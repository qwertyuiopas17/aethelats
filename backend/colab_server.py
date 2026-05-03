"""
Aethel Colab GPU Server — ALL 3 Bots in One
=============================================
Run this on Google Colab (free T4/A100) to serve:
  Bot 1 — GLiNER NER Anonymiser  (deterministic PII stripping)
  Bot 3 — Fine-tuned T5-base     (resume → structured JSON)
  Bot 4 — Fine-tuned Phi-3.5     (structured JSON → scorecard)

Usage (Colab cell):
    !pip install fastapi uvicorn gliner transformers sentencepiece \
                 torch peft accelerate bitsandbytes
    !pip install cloudflared  # for tunnel

    # Upload this file OR clone the repo
    # Then run:
    !python colab_server.py &
    !cloudflared tunnel --url http://localhost:8888

Endpoints:
    POST /anonymize     — Bot 1: GLiNER PII stripping
    POST /structure     — Bot 3: Resume text → structured JSON
    POST /generate      — Bot 4: Structured JSON → scorecard
    POST /analyze       — Full pipeline: raw text → PII strip → structure → evaluate
    GET  /health        — Status check
"""

import json
import os
import re
import sys
import traceback
from typing import List, Optional

import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ─── APP ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Aethel Colab GPU Server", version="2.0")


# ═══════════════════════════════════════════════════════════════════════════════
#  BOT 1 — GLiNER NER Anonymiser
# ═══════════════════════════════════════════════════════════════════════════════

_gliner_model = None

def _load_gliner():
    global _gliner_model
    if _gliner_model is not None:
        return _gliner_model
    from gliner import GLiNER
    print("[Bot1] Loading GLiNER model (urchade/gliner_medium-v2.1) ...")
    _gliner_model = GLiNER.from_pretrained("urchade/gliner_medium-v2.1")
    print("[Bot1] GLiNER ready.")
    return _gliner_model


# NER labels — intentionally excludes Date to preserve employment durations
_NER_LABELS = [
    "Person", "Location", "Email", "Phone",
    "Address", "Organization", "Nationality", "Gender", "University"
]
_NER_THRESHOLD = 0.45

# Map GLiNER labels to Aethel placeholders for consistency
_LABEL_TO_PLACEHOLDER = {
    "Person":       "[CANDIDATE]",
    "Location":     "[LOCATION]",
    "Email":        "[EMAIL]",
    "Phone":        "[PHONE]",
    "Address":      "[LOCATION]",
    "Organization": "[INSTITUTION]",  # Colleges/universities/schools
    "Nationality":  "[NATIONALITY]",
    "Gender":       "[GENDER]",
    "University":   "[INSTITUTION]",
}


def _anonymize_text(text: str) -> dict:
    """
    Run GLiNER NER on resume text to strip PII deterministically.
    Returns {sanitized_text: str, items_removed: [str]}
    """
    model = _load_gliner()
    items_removed = []
    sanitized_lines = []

    for line in text.split('\n'):
        if not line.strip():
            sanitized_lines.append(line)
            continue

        entities = model.predict_entities(line, _NER_LABELS, threshold=_NER_THRESHOLD)

        if not entities:
            sanitized_lines.append(line)
            continue

        # Sort spans by start position; drop overlapping spans (keep longest)
        entities_sorted = sorted(
            entities, key=lambda e: (e["start"], -(e["end"] - e["start"]))
        )
        non_overlapping = []
        last_end = -1
        for ent in entities_sorted:
            if ent["start"] >= last_end:
                non_overlapping.append(ent)
                last_end = ent["end"]

        # Rebuild the line by substituting spans with placeholders
        result_chars = []
        cursor = 0
        for ent in non_overlapping:
            result_chars.append(line[cursor:ent["start"]])
            placeholder = _LABEL_TO_PLACEHOLDER.get(ent["label"], f"[{ent['label'].upper()}]")
            result_chars.append(placeholder)
            # Track what was removed
            original_text = line[ent["start"]:ent["end"]]
            items_removed.append(original_text)
            cursor = ent["end"]
        result_chars.append(line[cursor:])
        sanitized_lines.append("".join(result_chars))

    # Post-process: replace gendered pronouns with they/their/them
    sanitized_text = "\n".join(sanitized_lines)
    sanitized_text = re.sub(r'\b[Hh]e\b', 'they', sanitized_text)
    sanitized_text = re.sub(r'\b[Ss]he\b', 'they', sanitized_text)
    sanitized_text = re.sub(r'\b[Hh]is\b', 'their', sanitized_text)
    sanitized_text = re.sub(r'\b[Hh]er\b', 'their', sanitized_text)
    sanitized_text = re.sub(r'\b[Hh]im\b', 'them', sanitized_text)

    return {
        "sanitized_text": sanitized_text,
        "items_removed": list(set(items_removed)),  # deduplicate
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  BOT 3 — Fine-tuned T5-base Structure Agent
# ═══════════════════════════════════════════════════════════════════════════════

_t5_model = None
_t5_tokenizer = None

# HuggingFace repo for the T5 model (uploaded via scripts/upload_bot3_to_hf.py)
_T5_HF_REPO = os.environ.get("T5_HF_REPO", "Unded-17/bot3-t5-resume-structurer")
_T5_BASE_MODEL = "t5-base"
_T5_MAX_INPUT = 768
_T5_MAX_OUTPUT = 384
_T5_NUM_BEAMS = 4


def _load_t5():
    """Load the fine-tuned T5 model. Tries HuggingFace repo first, then local checkpoint."""
    global _t5_model, _t5_tokenizer
    if _t5_model is not None:
        return _t5_model, _t5_tokenizer

    from transformers import T5ForConditionalGeneration, T5Tokenizer

    _t5_tokenizer = T5Tokenizer.from_pretrained(_T5_BASE_MODEL)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Try loading from HuggingFace
    try:
        print(f"[Bot3] Loading T5 from HuggingFace: {_T5_HF_REPO} ...")
        _t5_model = T5ForConditionalGeneration.from_pretrained(_T5_HF_REPO)
        _t5_model.eval().to(device)
        print(f"[Bot3] T5 ready on {device.upper()} (from HuggingFace).")
        return _t5_model, _t5_tokenizer
    except Exception as e:
        print(f"[Bot3] HuggingFace load failed ({e}). Trying local checkpoint ...")

    # Fallback: local checkpoint (if running from cloned repo)
    local_paths = [
        "/content/bot3.1/best_checkpoint.ckpt",  # Colab typical path
        os.path.join(os.path.dirname(__file__), "..", "bot3.1", "best_checkpoint.ckpt"),
    ]
    for ckpt_path in local_paths:
        if os.path.exists(ckpt_path):
            print(f"[Bot3] Loading T5 from local checkpoint: {ckpt_path}")
            ck = torch.load(ckpt_path, map_location="cpu")
            cleaned_sd = {
                k[len("model."):] if k.startswith("model.") else k: v
                for k, v in ck["state_dict"].items()
            }
            _t5_model = T5ForConditionalGeneration.from_pretrained(
                _T5_BASE_MODEL, ignore_mismatched_sizes=True
            )
            _t5_model.load_state_dict(cleaned_sd, strict=False)
            _t5_model.eval().to(device)
            print(f"[Bot3] T5 ready on {device.upper()} (from local checkpoint).")
            return _t5_model, _t5_tokenizer

    raise RuntimeError("[Bot3] No T5 model found. Set T5_HF_REPO env var or provide local checkpoint.")


# Subjective-phrase filter (same as structure_agent.py)
_SUBJECTIVE_RE = re.compile(
    r"\b("
    r"passionate(ly)?|hard[- ]?work(ing|er)?|results?[- ]?driven|"
    r"visionary|innovative|dynamic|exceptional|accomplished|award[- ]?winning|"
    r"world[- ]?class|go[- ]?getter|thrives? under pressure|motivated|"
    r"highly motivated|extremely hardworking|deeply empathetic|resourceful|"
    r"creative|versatile|seasoned|self[- ]?taught|dedicated|committed|"
    r"driven|strategic|emotionally intelligent|unparalleled|polymath|"
    r"eager to make an impact|proven leadership|top[- ]?tier|obsessed with"
    r")\b",
    re.IGNORECASE,
)

_SECTION_ALIASES = [
    (re.compile(
        r"^\s*(technical\s+skills?|core\s+competencies?|skills?\s+acquired|"
        r"design\s+tools?|research\s+&\s+technical\s+skills?|"
        r"tech\s+stack|tech\s+expertise|tools?\s+&\s+(systems?|platforms?))\s*:?\s*$",
        re.I | re.M,
    ), "SKILLS"),
    (re.compile(
        r"^\s*(work\s+(history|experience)|professional\s+experience|"
        r"experience|career\s+history|leadership\s+history|"
        r"freelance\s+&\s+work|previous\s+experience)\s*:?\s*$",
        re.I | re.M,
    ), "EXPERIENCE"),
    (re.compile(
        r"^\s*(education|academic\s+background)\s*:?\s*$",
        re.I | re.M,
    ), "EDUCATION"),
]


def _preformat_resume(text: str) -> str:
    """Normalise sanitised resume text to match T5 training-data style."""
    text = _SUBJECTIVE_RE.sub(" ", text)
    for pattern, canonical in _SECTION_ALIASES:
        text = pattern.sub(f"\n{canonical}\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(line.rstrip() for line in text.splitlines())
    return text.strip()


def _run_t5_inference(formatted_text: str) -> Optional[dict]:
    """Run T5 inference and return parsed JSON or None."""
    model, tokenizer = _load_t5()
    device = next(model.parameters()).device

    inputs = tokenizer(
        f"Extract JSON from this resume:\n{formatted_text}",
        return_tensors="pt",
        max_length=_T5_MAX_INPUT,
        truncation=True,
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=_T5_MAX_OUTPUT,
            num_beams=_T5_NUM_BEAMS,
            early_stopping=True,
            no_repeat_ngram_size=3,
        )

    raw = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(f"[Bot3] T5 raw output: {raw[:200]}")

    # Truncate at 'Tip:' — discard post-JSON artifacts
    tip_match = re.search(r"tip:", raw, re.IGNORECASE)
    if tip_match:
        raw = raw[:tip_match.start()]

    raw_clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    try:
        return json.loads(raw_clean)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", raw_clean, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


# ═══════════════════════════════════════════════════════════════════════════════
#  BOT 4 — Fine-tuned Phi-3.5 + LoRA Evaluator
# ═══════════════════════════════════════════════════════════════════════════════

_phi_model = None
_phi_tokenizer = None

_PHI_HF_REPO = os.environ.get("HF_REPO_ID", "Unded-17/bot4-phi35-resume-evaluator")

_EVALUATOR_SYSTEM_PROMPT = (
    "You are an objective resume scoring assistant. "
    "Score the candidate's structured JSON resume against the provided "
    "job description rubric. Return ONLY valid JSON with keys: "
    "'overall_score' (0-100), 'skill_match_score' (0-100), "
    "'experience_score' (0-100), 'education_score' (0-100), "
    "'missing_skills' (list of strings), 'strengths' (list of strings), "
    "'recommendation' (one of: Strong Hire / Hire / Maybe / No Hire), "
    "and 'reasoning' (2-3 sentence string)."
)


def _load_phi():
    """Load the fine-tuned Phi-3.5 + LoRA model."""
    global _phi_model, _phi_tokenizer
    if _phi_model is not None:
        return _phi_model, _phi_tokenizer

    from transformers import AutoModelForCausalLM, AutoTokenizer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[Bot4] Loading Phi-3.5 from: {_PHI_HF_REPO} ...")

    _phi_tokenizer = AutoTokenizer.from_pretrained(_PHI_HF_REPO, trust_remote_code=True)
    _phi_model = AutoModelForCausalLM.from_pretrained(
        _PHI_HF_REPO,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True,
    )
    _phi_model.eval()
    print(f"[Bot4] Phi-3.5 ready on {device.upper()}.")
    return _phi_model, _phi_tokenizer


def _run_phi_inference(structured_json: dict, jd_skills: list, job_title: str,
                       max_new_tokens: int = 1024) -> dict:
    """Run Bot 4 Phi-3.5 evaluator inference."""
    model, tokenizer = _load_phi()

    rubric = {"job_title": job_title, "required_skills": jd_skills}
    user_msg = (
        f"Candidate Resume JSON:\n{json.dumps(structured_json, indent=2)}\n\n"
        f"Job Description Rubric:\n{json.dumps(rubric, indent=2)}"
    )
    prompt = (
        f"<|system|>\n{_EVALUATOR_SYSTEM_PROMPT}<|end|>\n"
        f"<|user|>\n{user_msg}<|end|>\n"
        f"<|assistant|>\n"
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=0.1,
            do_sample=False,
        )

    # Decode only the generated portion (after the prompt)
    generated = output_ids[0][inputs["input_ids"].shape[-1]:]
    text = tokenizer.decode(generated, skip_special_tokens=True)
    print(f"[Bot4] Phi output: {text[:300]}")

    # Parse JSON from output
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {"error": f"Could not parse JSON from model output: {text[:300]}"}


# ═══════════════════════════════════════════════════════════════════════════════
#  REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class AnonymizeRequest(BaseModel):
    text: str

class StructureRequest(BaseModel):
    sanitized_text: str

class EvaluateRequest(BaseModel):
    structured_data: dict
    jd_skills: List[str]
    job_title: str = "Software Engineer"
    max_new_tokens: int = 1024

class FullPipelineRequest(BaseModel):
    sanitized_text: str  # can be raw or pre-anonymized
    jd_skills: List[str]
    job_title: str = "Software Engineer"
    raw_text: Optional[str] = None  # if provided, Bot 1 runs first


# ═══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {
        "status": "ok",
        "server": "Aethel Colab GPU Server v2.0",
        "gpu": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "none",
        "bots": ["bot1_gliner", "bot3_t5", "bot4_phi35"],
    }


@app.post("/anonymize")
def anonymize(req: AnonymizeRequest):
    """Bot 1: GLiNER NER-based PII stripping. Deterministic, fast, auditable."""
    try:
        result = _anonymize_text(req.text)
        return {
            "sanitized_text": result["sanitized_text"],
            "items_removed": result["items_removed"],
            "method": "gliner_ner",
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Bot 1 (GLiNER) failed: {e}")


@app.post("/structure")
def structure(req: StructureRequest):
    """Bot 3: Convert sanitized resume text → structured JSON."""
    try:
        formatted = _preformat_resume(req.sanitized_text)
        t5_result = _run_t5_inference(formatted)

        if t5_result is not None:
            return {"structured_data": t5_result, "method": "t5_finetuned"}
        else:
            return {"structured_data": None, "method": "t5_failed",
                    "error": "T5 did not produce valid JSON — use rule-based fallback on backend"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Bot 3 (T5) failed: {e}")


@app.post("/generate")
def generate(req: EvaluateRequest):
    """Bot 4: Score structured resume JSON against JD rubric."""
    try:
        result = _run_phi_inference(
            req.structured_data, req.jd_skills, req.job_title, req.max_new_tokens
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Bot 4 (Phi-3.5) failed: {e}")


@app.post("/analyze")
def full_pipeline(req: FullPipelineRequest):
    """
    Full pipeline: Bot 1 (optional) → Bot 3 → Bot 4.
    If raw_text is provided, Bot 1 runs first to anonymize.
    Otherwise, sanitized_text is used directly for Bot 3 + Bot 4.
    """
    try:
        # ── Bot 1: Anonymize (if raw text provided) ──
        pii_result = None
        if req.raw_text:
            print("[Pipeline] Running Bot 1 (GLiNER anonymizer) ...")
            pii_result = _anonymize_text(req.raw_text)
            sanitized = pii_result["sanitized_text"]
        else:
            sanitized = req.sanitized_text

        # ── Bot 3: Structure ──
        print("[Pipeline] Running Bot 3 (T5 structurer) ...")
        formatted = _preformat_resume(sanitized)
        structured_data = _run_t5_inference(formatted)

        if structured_data is None:
            # Return partial result — backend can use rule-based fallback
            return {
                "sanitized_text": sanitized,
                "pii_removed": pii_result["items_removed"] if pii_result else [],
                "structured_data": None,
                "evaluation": {"error": "T5 did not produce valid JSON"},
                "bot3_method": "t5_failed",
            }

        # ── Bot 4: Evaluate ──
        print("[Pipeline] Running Bot 4 (Phi-3.5 evaluator) ...")
        evaluation = _run_phi_inference(
            structured_data, req.jd_skills, req.job_title
        )

        return {
            "sanitized_text": sanitized,
            "pii_removed": pii_result["items_removed"] if pii_result else [],
            "structured_data": structured_data,
            "evaluation": evaluation,
            "bot1_method": "gliner_ner" if pii_result else "skipped",
            "bot3_method": "t5_finetuned",
            "bot4_method": "phi35_lora",
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("  AETHEL COLAB GPU SERVER v2.0")
    print("  Bots: GLiNER (Bot 1) + T5 (Bot 3) + Phi-3.5 (Bot 4)")
    print(f"  GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print("=" * 60)

    # Pre-load Bot 1 (GLiNER) at startup — it's small and fast
    try:
        _load_gliner()
    except Exception as e:
        print(f"[WARN] GLiNER pre-load failed: {e}")

    uvicorn.run(app, host="0.0.0.0", port=8888)
