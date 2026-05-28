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
- `HF_TOKEN` — HuggingFace Inference API access + auto-refresh push-back
- `GROQ_PRIMARY_KEY_1` — Groq API key for LLM fallback
- `ADZUNA_APP_ID` — Adzuna API (weekly dataset refresh)
- `ADZUNA_APP_KEY` — Adzuna API (weekly dataset refresh)
- `HF_SPACE_NAME` — e.g. Unded-17/aethel-backend-v3 (for auto push-back)
- `ADMIN_KEY` — Optional secret for /admin/refresh-dataset endpoint
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
        "backend/database.py":         "database.py",
        "backend/name_signals.py":     "name_signals.py",
        "backend/report_generator.py": "report_generator.py",
        "backend/requirements.txt":    "requirements.txt",
        "backend/skill_graph.json":    "skill_graph.json",
        "backend/rag_retriever.py":    "rag_retriever.py",
        "backend/rag_store.py":        "rag_store.py",
        "backend/auth.py":             "auth.py",
        "backend/email_service.py":    "email_service.py",
        "backend/Dockerfile":          "Dockerfile",
        # ── Bot 5 additions ───────────────────────────────────────
        "backend/adzuna_refresh.py":   "adzuna_refresh.py",   # weekly data refresh + HF push-back
        "backend/skill_matcher.py":    "skill_matcher.py",    # semantic skill scoring
    }

    for local_path, remote_path in files.items():
        import os as _os
        if not _os.path.isfile(local_path):
            print(f"  Skipping {local_path} (not found locally)")
            continue
        print(f"  Uploading {local_path} -> {remote_path}")
        api.upload_file(
            path_or_fileobj=local_path,
            path_in_repo=remote_path,
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message=f"Deploy: {remote_path}"
        )

    print("  Uploading directories (rag_kb and rag_chroma_db)...")
    try:
        api.upload_folder(
            folder_path="backend/rag_kb",
            path_in_repo="rag_kb",
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message="Deploy: rag_kb"
        )
        api.upload_folder(
            folder_path="backend/rag_chroma_db",
            path_in_repo="rag_chroma_db",
            repo_id=SPACE_NAME,
            repo_type="space",
            commit_message="Deploy: rag_chroma_db"
        )
    except Exception as e:
        print(f"  Warning: could not upload folders: {e}")

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
