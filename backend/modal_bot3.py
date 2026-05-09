"""
modal_bot3.py — Bot 3 (Qwen 2.5 1.5B Resume Structurer) on Modal.com
========================================================
Deploy with:  modal deploy backend/modal_bot3.py
Test with:    modal run   backend/modal_bot3.py

This exposes a web endpoint for your HF Space to call.
The GPU is ONLY active during inference (~1.5s per resume).

Setup (one-time):
  1. pip install modal
  2. modal setup          (links your Modal account)
  3. modal secret create hf-secret HF_TOKEN=<your_hf_token>
  4. modal deploy backend/modal_bot3.py
  5. Copy the printed URL into your HF Space's MODAL_BOT3_URL secret.
"""

import json
import os
import re

import modal

# ── Config ────────────────────────────────────────────────────────────────────
BASE_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER_REPO = "Unded-17/bot3-qwen25-resume-structurer"

BASE_DIR = "/base-model"
ADAPTER_DIR = "/adapter-model"

# ── Image: install deps and bake model weights in at build time ───────────────
bot3_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch==2.5.1",
        "numpy<2",
        "transformers==4.46.3",
        "peft==0.13.2",
        "accelerate",
        "sentencepiece",
        "huggingface_hub>=0.26.0",
        "hf_transfer",
        "fastapi[standard]",
        extra_index_url="https://download.pytorch.org/whl/cu121",
    )
    .run_commands(
        # Download base model using hf_transfer (fast C-level downloader)
        f"HF_HUB_ENABLE_HF_TRANSFER=1 "
        f"python -c \""
        f"import os; os.environ['HF_HUB_ENABLE_HF_TRANSFER']='1'; "
        f"from huggingface_hub import snapshot_download; "
        f"snapshot_download("
        f"  repo_id='{BASE_MODEL}', "
        f"  local_dir='{BASE_DIR}', "
        f"  token=os.environ['HF_TOKEN'], "
        f"  ignore_patterns=['*.gguf','*.bin','*.msgpack','flax_model*','tf_model*']"
        f")\"",
        secrets=[modal.Secret.from_name("hf-secret")],
    )
    .run_commands(
        # Download LoRA adapter (small ~52MB)
        f"HF_HUB_ENABLE_HF_TRANSFER=1 "
        f"python -c \""
        f"import os; os.environ['HF_HUB_ENABLE_HF_TRANSFER']='1'; "
        f"from huggingface_hub import snapshot_download; "
        f"snapshot_download("
        f"  repo_id='{ADAPTER_REPO}', "
        f"  local_dir='{ADAPTER_DIR}', "
        f"  token=os.environ['HF_TOKEN']"
        f")\"",
        secrets=[modal.Secret.from_name("hf-secret")],
    )
    .run_commands(
        # Strip auto_map references to avoid trust_remote_code requirements
        "python -c \"import json, os; "
        "d='/base-model'; "
        "os.system(f'rm -f {d}/*.py'); "
        "f1=f'{d}/config.json'; "
        "d1=json.load(open(f1)); d1.pop('auto_map',None); d1.pop('_name_or_path',None); "
        "json.dump(d1,open(f1,'w')); "
        "f2=f'{d}/tokenizer_config.json'; "
        "d2=json.load(open(f2)); d2.pop('auto_map',None); d2.pop('_name_or_path',None); "
        "json.dump(d2,open(f2,'w'))\""
    )
)

app = modal.App("aethel-bot3-structurer", image=bot3_image)

from pydantic import BaseModel

class StructureRequest(BaseModel):
    sanitized_text: str
    max_new_tokens: int = 768   # resume JSON is ~500-700 tokens; 768 gives headroom without 3x waste

# ── The inference class ───────────────────────────────────────────────────────
@app.cls(
    gpu="T4",                  # cheapest GPU, plenty for 1.5B model
    scaledown_window=600,      # keep warm for 10 min after last request
    min_containers=1,          # always keep 1 container hot — eliminates 60-90s cold start
    secrets=[modal.Secret.from_name("hf-secret")],
)
class Bot3Structurer:

    @modal.enter()
    def load_model(self):
        """Called once when the container boots. Loads model into GPU VRAM."""
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from peft import PeftModel

        print(f"[Bot3/Modal] Loading tokenizer ...")
        self.tokenizer = AutoTokenizer.from_pretrained(BASE_DIR, local_files_only=True)

        print(f"[Bot3/Modal] Loading base model onto GPU ...")
        base = AutoModelForCausalLM.from_pretrained(
            BASE_DIR,
            torch_dtype=torch.float16,
            device_map="auto",
            local_files_only=True
        )
        
        print(f"[Bot3/Modal] Loading LoRA adapter ...")
        self.model = PeftModel.from_pretrained(base, ADAPTER_DIR)
        self.model.eval()
        print("[Bot3/Modal] Qwen 2.5 + LoRA ready on GPU.")

    def _build_prompt(self, sanitized_text: str) -> str:
        """Build the Qwen ChatML prompt."""
        # This exact format matches how we trained the model
        return (
            "<|im_start|>system\n"
            "You are a precise resume parser. Return ONLY valid JSON with keys: "
            "total_years_experience, technical_skills, job_history, highest_degree, "
            "education, experience, work_experience_summary. No markdown, no explanation.<|im_end|>\n"
            "<|im_start|>user\nParse this resume:\n\n"
            f"{sanitized_text}<|im_end|>\n"
            "<|im_start|>assistant\n"
        )

    def _repair_json(self, text: str):
        """Attempt to recover valid JSON from a truncated or slightly malformed model output."""
        s = text.strip()
        # Strip markdown fences
        s = re.sub(r'^```json\s*', '', s, flags=re.I)
        s = re.sub(r'```\s*$', '', s)
        s = s.strip()

        # Try as-is first
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            pass

        # Find the outermost opening brace
        start = s.find('{')
        if start == -1:
            return None
        s = s[start:]

        # The model often truncates mid-value (string, array, or nested object).
        # Strategy: keep closing brackets/braces until it parses.
        for _ in range(20):  # max 20 repair attempts
            try:
                return json.loads(s)
            except json.JSONDecodeError as e:
                msg = str(e)
                # Unterminated string — close the string, then close open containers
                if 'Unterminated string' in msg or 'Invalid control character' in msg:
                    # Close any open string
                    if s.rstrip()[-1] not in ('"', '}', ']'):
                        s = s.rstrip() + '"'
                    else:
                        break
                else:
                    break

        # Count open brackets and braces and close them
        open_braces  = s.count('{') - s.count('}')
        open_brackets = s.count('[') - s.count(']')
        # Remove trailing comma before we close
        s = re.sub(r',\s*$', '', s.rstrip())
        s += ']' * max(0, open_brackets) + '}' * max(0, open_braces)
        # Also remove trailing commas before any closing bracket
        s = re.sub(r',\s*([}\]])', r'\1', s)

        try:
            return json.loads(s)
        except json.JSONDecodeError:
            pass

        # Last resort: regex-extract the outermost {...}
        match = re.search(r'\{.*\}', s, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        return None

    def _parse_output(self, text: str) -> dict:
        """Extract JSON from raw model output, with repair for truncated JSON."""
        parsed = self._repair_json(text)
        if parsed is not None:
            return {"structured_data": parsed}
        return {"error": f"Could not parse JSON from model output: {text[:300]}"}

    @modal.fastapi_endpoint(method="POST")
    def structure(self, req: StructureRequest) -> dict:
        """
        POST /structure
        Body: StructureRequest JSON
        Returns: {"structured_data": {...}} or {"error": "..."}
        """
        import torch

        prompt = self._build_prompt(req.sanitized_text)

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            max_length=4096,
            truncation=True,
        ).to("cuda")

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=req.max_new_tokens,
                do_sample=False,           # greedy decode — deterministic + fastest
                pad_token_id=self.tokenizer.eos_token_id,
            )

        # Decode only the newly generated tokens
        new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
        raw_text   = self.tokenizer.decode(new_tokens, skip_special_tokens=True)
        print(f"[Bot3/Modal] Raw output: {raw_text[:200]}")

        return self._parse_output(raw_text)


# ── Local test (modal run backend/modal_bot3.py) ──────────────────────────────
@app.local_entrypoint()
def test():
    test_resume = """
    JOHN DOE | San Francisco, CA | john@example.com
    EXPERIENCE
    Software Engineer | TechCorp | Jan 2020 - Present
    - Built backend APIs in Python and Django.
    - Managed PostgreSQL databases.

    EDUCATION
    Bachelor of Science in Computer Science
    University of California, Berkeley | 2018
    """

    structurer = Bot3Structurer()
    result = structurer.structure.remote(StructureRequest(sanitized_text=test_resume))
    print(json.dumps(result, indent=2))
