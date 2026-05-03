from huggingface_hub import HfApi
import sys
import tempfile
import os

HF_TOKEN = sys.argv[1] if len(sys.argv) > 1 else None
SPACE_NAME = "Unded-17/aethel-backend-v3"

# Minimal safe README — only what HF Spaces needs
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
- `HF_TOKEN` — HuggingFace Inference API access
- `GROQ_PRIMARY_KEY_1` — Groq API key for LLM fallback
"""

def deploy():
    if not HF_TOKEN:
        print("Usage: python deploy_hf.py <HF_WRITE_TOKEN>")
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
            exist_ok=True   # no error if already exists
        )
        print(f"  Space '{SPACE_NAME}' ready.")
    except Exception as e:
        print(f"  Warning: could not create space: {e}")

    # Upload the Python files, Dockerfile, and JSON assets individually
    files = {
        "backend/main.py":             "main.py",
        "backend/evaluator_agent.py":  "evaluator_agent.py",
        "backend/structure_agent.py":  "structure_agent.py",
        "backend/requirements.txt":    "requirements.txt",
        "backend/skill_graph.json":    "skill_graph.json",
        "Dockerfile":                  "Dockerfile",
    }

    for local_path, remote_path in files.items():
        print(f"  Uploading {local_path} -> {remote_path}")
        api.upload_file(
            path_or_fileobj=local_path,
            path_in_repo=remote_path,
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message=f"Deploy: {remote_path}"
        )

    # Upload the minimal safe README (not the main project README)
    print("  Uploading minimal README.md")
    api.upload_file(
        path_or_fileobj=HF_README.encode(),
        path_in_repo="README.md",
        repo_id=SPACE_NAME,
        repo_type="space",
        commit_message="Deploy: README.md"
    )

    print(f"\nDeployment complete! Check: https://huggingface.co/spaces/{SPACE_NAME}")

if __name__ == "__main__":
    deploy()
