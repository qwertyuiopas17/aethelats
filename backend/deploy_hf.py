from huggingface_hub import HfApi
import sys
import os

HF_TOKEN  = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HF_WRITE_TOKEN")
SPACE_NAME = "Unded-17/aethel-backend-v3"

HF_README = """\
---
title: Aethel FairAI Backend
emoji: 🛡️
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Aethel — Bias-Free Resume Evaluation Backend

FastAPI backend for the Aethel anti-bias hiring intelligence engine.

## Secrets Required
- `GROQ_PRIMARY_KEY_1` — Primary Groq API key (LLM)
- `GROQ_VISION_KEY`    — Groq key for OCR / vision tasks
- `HF_TOKEN`           — HuggingFace Inference API access
- `JWT_SECRET`         — HMAC-SHA256 secret for auth tokens (min 32 chars)
- `RESEND_API_KEY`     — Resend API key for OTP emails
- `RESEND_FROM_EMAIL`  — (optional) e.g. "Aethel <noreply@aethel.ai>"
- `DATABASE_URL`       — (optional) PostgreSQL URL; uses SQLite if unset
"""

# All backend source files to upload
# Format: (local_path_relative_to_this_script, remote_path_in_space)
BACKEND_FILES = [
    ("main.py",             "main.py"),
    ("auth.py",             "auth.py"),
    ("database.py",         "database.py"),
    ("email_service.py",    "email_service.py"),
    ("evaluator_agent.py",  "evaluator_agent.py"),
    ("structure_agent.py",  "structure_agent.py"),
    ("name_signals.py",     "name_signals.py"),
    ("report_generator.py", "report_generator.py"),
    ("skill_graph.json",    "skill_graph.json"),
    ("Dockerfile",          "Dockerfile"),
]

REQUIREMENTS_SRC = "requirements(2).txt"
REQUIREMENTS_DST = "requirements.txt"


def deploy():
    if not HF_TOKEN:
        print("Usage: python deploy_hf.py <HF_WRITE_TOKEN>")
        print("  or set env var: HF_WRITE_TOKEN")
        return

    api = HfApi(token=HF_TOKEN)
    print(f"Deploying to {SPACE_NAME}...")

    # Auto-create the Space if it doesn't exist yet
    try:
        api.create_repo(
            repo_id=SPACE_NAME,
            repo_type="space",
            space_sdk="docker",
            private=False,
            exist_ok=True,
        )
        print(f"  Space '{SPACE_NAME}' ready.")
    except Exception as e:
        print(f"  Warning: could not create space: {e}")

    # Upload each backend source file
    script_dir = os.path.dirname(os.path.abspath(__file__))

    for local_name, remote_path in BACKEND_FILES:
        local_path = os.path.join(script_dir, local_name)
        if not os.path.exists(local_path):
            print(f"  SKIP (not found): {local_name}")
            continue
        print(f"  Uploading {local_name} -> {remote_path}")
        api.upload_file(
            path_or_fileobj=local_path,
            path_in_repo=remote_path,
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message=f"Deploy: {remote_path}",
        )

    # requirements(2).txt -> requirements.txt
    req_local = os.path.join(script_dir, REQUIREMENTS_SRC)
    if os.path.exists(req_local):
        print(f"  Uploading {REQUIREMENTS_SRC} -> {REQUIREMENTS_DST}")
        api.upload_file(
            path_or_fileobj=req_local,
            path_in_repo=REQUIREMENTS_DST,
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message="Deploy: requirements.txt",
        )
    else:
        print(f"  SKIP: {REQUIREMENTS_SRC} not found")

    # Minimal README
    print("  Uploading README.md")
    api.upload_file(
        path_or_fileobj=HF_README.encode(),
        path_in_repo="README.md",
        repo_id=SPACE_NAME,
        repo_type="space",
        commit_message="Deploy: README.md",
    )

    print(f"\nDeployment complete!")
    print(f"Space URL: https://huggingface.co/spaces/{SPACE_NAME}")
    print(f"\nRemember to set these secrets in the Space settings:")
    print(f"  JWT_SECRET     = <random 64-char string>")
    print(f"  RESEND_API_KEY = re_xxxxxxxxxxxx")


if __name__ == "__main__":
    deploy()
