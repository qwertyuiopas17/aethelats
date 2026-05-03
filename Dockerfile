# ═══════════════════════════════════════════════════════════════
#  Aethel — HuggingFace Spaces Docker Deployment
#  Runs the FastAPI backend + GLiNER (Bot 1) locally
#  Bots 3 & 4 are called via HF Serverless Inference API (free GPUs)
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/

# Install Python dependencies
# Note: torch is CPU-only since HF Spaces free tier has no GPU
# GLiNER runs fine on CPU (~200ms per resume)
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    groq \
    PyPDF2 \
    python-multipart \
    requests \
    torch --index-url https://download.pytorch.org/whl/cpu \
    transformers \
    sentencepiece \
    gliner

# Pre-download GLiNER model at build time (so first request is fast)
RUN python -c "from gliner import GLiNER; GLiNER.from_pretrained('urchade/gliner_medium-v2.1')"

# HF Spaces requires port 7860
ENV PORT=7860
EXPOSE 7860

# Start the server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
