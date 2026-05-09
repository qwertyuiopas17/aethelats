# ═══════════════════════════════════════════════════════════════
#  Aethel — HuggingFace Spaces Docker Deployment
#  Bot 1 (GLiNER) runs locally on CPU
#  Bots 3 & 4 call the HF Serverless Inference API
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces requires running as non-root user (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy backend source files (uploaded to Space root by deploy_hf.py)
COPY --chown=user main.py ./main.py
COPY --chown=user evaluator_agent.py ./evaluator_agent.py
COPY --chown=user structure_agent.py ./structure_agent.py
COPY --chown=user database.py ./database.py
COPY --chown=user name_signals.py ./name_signals.py
COPY --chown=user skill_graph.json ./skill_graph.json
COPY --chown=user requirements.txt ./requirements.txt

# Install CPU-only torch first (separate step to use --extra-index-url)
RUN pip install --no-cache-dir \
    torch \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    groq \
    PyPDF2 \
    python-multipart \
    requests \
    transformers \
    sentencepiece \
    gliner \
    Pillow \
    sqlalchemy \
    psycopg2-binary

# HF Spaces requires port 7860
ENV PORT=7860
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
