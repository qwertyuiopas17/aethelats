import json
import os
import re
from pathlib import Path
import requests

# ── Paths ────────────────────────────────────────────────────────────────────
# backend/ → resume_scanner/ → project_root/ → bot4/
_BACKEND_DIR  = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent.parent
BOT4_PATH     = _PROJECT_ROOT / "bot4"

# ── HuggingFace config ───────────────────────────────────────────────────────
# Step 1: Run  scripts/upload_bot4_to_hf.py  to upload your model.
# Step 2: Paste your HF repo id and token below (or use env vars).
#
# Option A — HuggingFace Inference API (free, rate-limited, shared hardware)
#   HF_REPO_ID = "your-username/bot4-phi35-resume-evaluator"
#   Uses URL:  https://api-inference.huggingface.co/models/<HF_REPO_ID>
#
# Option B — HuggingFace Dedicated Endpoint (~$0.06/hr, always-on, fastest)
#   Deploy at: https://ui.endpoints.huggingface.co
#   Then set HF_ENDPOINT_URL to the endpoint URL shown there.
# ─────────────────────────────────────────────────────────────────────────────
HF_REPO_ID      = os.environ.get("HF_REPO_ID", "Unded-17/bot4-phi35-resume-evaluator")
HF_TOKEN        = os.environ.get("HF_TOKEN", "")  # Set HF_TOKEN env var — never hardcode tokens!
HF_ENDPOINT_URL = os.environ.get("HF_ENDPOINT_URL", "")  # optional dedicated endpoint
COLAB_URL       = os.environ.get("COLAB_URL", "https://airline-immigrants-prayer-arguments.trycloudflare.com")        # Paste your trycloudflare.com URL here!

# ── Prompt template (must match what was used during fine-tuning) ─────────────
_SYSTEM_PROMPT = (
    "You are an objective resume scoring assistant. "
    "Score the candidate's structured JSON resume against the provided "
    "job description rubric. Return ONLY valid JSON with keys: "
    "'overall_score' (0-100), 'skill_match_score' (0-100), "
    "'experience_score' (0-100), 'education_score' (0-100), "
    "'missing_skills' (list of strings), 'strengths' (list of strings), "
    "'recommendation' (one of: Strong Hire / Hire / Maybe / No Hire), "
    "and 'reasoning' (2-3 sentence string)."
)


def _build_hf_payload(structured_json: dict, jd_skills: list[str], job_title: str, max_new_tokens: int) -> dict:
    """Build the request payload for the HuggingFace Inference API."""
    rubric = {"job_title": job_title, "required_skills": jd_skills}
    user_msg = (
        f"Candidate Resume JSON:\n{json.dumps(structured_json, indent=2)}\n\n"
        f"Job Description Rubric:\n{json.dumps(rubric, indent=2)}"
    )
    # Phi-3 chat template — same format as training
    prompt = (
        f"<|system|>\n{_SYSTEM_PROMPT}<|end|>\n"
        f"<|user|>\n{user_msg}<|end|>\n"
        f"<|assistant|>\n"
    )
    return {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": 0.1,
            "do_sample": False,
            "return_full_text": False,   # only return the generated part, not the prompt
        },
    }


def _parse_hf_response(raw: list | dict) -> dict:
    """Extract and parse the JSON scorecard from the HF API response."""
    # HF text-generation returns a list of dicts: [{"generated_text": "..."}]
    if isinstance(raw, list) and raw:
        text = raw[0].get("generated_text", "")
    elif isinstance(raw, dict):
        text = raw.get("generated_text", str(raw))
    else:
        text = str(raw)

    # Try to extract the first JSON object from the generated text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {"error": f"Could not parse JSON from model output: {text[:300]}"}


def evaluate_resume(
    structured_data: dict,
    jd_skills: list[str],
    job_title: str = "Software Engineer",
    max_new_tokens: int = 1024,
) -> dict:
    """
    Run Bot 4 inference via HuggingFace.

    Priority order:
      1. HF_ENDPOINT_URL  — dedicated endpoint (fastest, ~$0.06/hr)
      2. HF Inference API — free, rate-limited, shared hardware

    Args:
        structured_data: The JSON produced by Bot 3 (structure_agent).
        jd_skills:       List of required skills from the JD Builder.
        job_title:       The target job title string.
        max_new_tokens:  Max tokens to generate (default 512).

    Returns:
        A dict with keys: overall_score, skill_match_score,
        experience_score, education_score, missing_skills,
        strengths, recommendation, reasoning.
        On failure, returns {"error": "<message>"}.
    """
    if not HF_TOKEN:
        return {
            "error": (
                "HF_TOKEN is not set. "
                "1) Get a free token at https://huggingface.co/settings/tokens  "
                "2) Set HF_TOKEN env var or paste it into evaluator_agent.py  "
                "3) Run scripts/upload_bot4_to_hf.py to upload your model first."
            )
        }

    if "YOUR_HF_USERNAME" in HF_REPO_ID and not HF_ENDPOINT_URL:
        return {
            "error": (
                "HF_REPO_ID is not configured. "
                "Run scripts/upload_bot4_to_hf.py, then set HF_REPO_ID to your "
                "HuggingFace repo id (e.g. 'johndoe/bot4-phi35-resume-evaluator')."
            )
        }

    # ── Pick the API URL ──────────────────────────────────────────────────────
    if COLAB_URL:
        api_url = f"{COLAB_URL.rstrip('/')}/generate"
        print(f"[Bot4] Using FREE Google Colab GPU at: {api_url}")
    elif HF_ENDPOINT_URL:
        # Dedicated endpoint — no cold-start delay, always on
        api_url = HF_ENDPOINT_URL.rstrip("/")
        print(f"[Bot4] Using HuggingFace Dedicated Endpoint: {api_url}")
    else:
        # Free shared Inference API
        api_url = f"https://api-inference.huggingface.co/models/{HF_REPO_ID}"
        print(f"[Bot4] Using HuggingFace Inference API: {api_url}")
        print("       Tip: first request may take 20-60s while model loads on shared hardware.")

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = _build_hf_payload(structured_data, jd_skills, job_title, max_new_tokens)

    try:
        resp = requests.post(api_url, headers=headers, json=payload, timeout=180)

        # HF returns 503 while the model is warming up on shared hardware
        if resp.status_code == 503:
            estimated = resp.json().get("estimated_time", "unknown")
            return {
                "error": (
                    f"HuggingFace model is still loading (estimated {estimated}s). "
                    "Please wait ~30-60s and try again. This only happens on the first request."
                )
            }

        resp.raise_for_status()
        return _parse_hf_response(resp.json())

    except requests.exceptions.HTTPError as e:
        # Colab/FastAPI usually returns {"detail": "Error message"} on 500
        error_detail = e.response.text
        try:
            error_detail = e.response.json().get("detail", error_detail)
        except:
            pass
        print(f"[Bot4][ERROR] HTTP {e.response.status_code}: {error_detail}")
        return {"error": f"Cloud inference failed: {error_detail}"}
    except requests.exceptions.Timeout:
        return {"error": "HuggingFace request timed out after 180s. Try again or use a Dedicated Endpoint for faster responses."}
    except Exception as e:
        print(f"[Bot4][ERROR] HuggingFace inference failed: {e}")
        return {"error": f"HuggingFace inference failed: {e}"}
