# Graph Report - current  (2026-05-24)

## Corpus Check
- 36 files · ~462,919 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 433 nodes · 587 edges · 21 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `ResumeScore` - 123 edges
2. `parse_json_response()` - 11 edges
3. `AethelReport` - 11 edges
4. `execute_scan_job()` - 10 edges
5. `generate_report()` - 10 edges
6. `useAuth()` - 10 edges
7. `extract_resume_text()` - 9 edges
8. `auth_register()` - 9 edges
9. `_fetch_platform_data()` - 8 edges
10. `structure_resume()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ResumeScore` --uses--> `Deterministic Legacy ATS Score Simulator.      Mimics keyword-only ATS behavio`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Guardrail: Checks if the extracted text is actually a resume/CV.      Two-tier`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `OCR an image resume using Groq Vision (llama-4-scout).     Includes automatic P`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Unified resume text extractor.      Routing logic:       .pdf  → PyPDF2 (fast`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Try to close open braces/brackets in a truncated JSON string.`  [INFERRED]
  backend\database.py → backend\main.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (72): One row per completed /analyze OR /counterfactual-test invocation.      PII-free, ResumeScore, _extract_pdf_text(), extract_text_from_pdf(), Persist one anonymised scoring result. Silent-fail: a DB outage     must never, Returns (percentile, pool_size, is_mock).      - Counts rows for this role_tar, Updates the Colab Cloudflare/Ngrok URL dynamically without restarting the server, Persist one anonymised scoring result. Silent-fail: a DB outage     must never (+64 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (50): BaseModel, _analyze(), analyze_job_description(), analyze_links(), auth_me(), build_analysis_prompt(), chat(), ColabUrlUpdate (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (41): Base, consume_otp(), create_otp(), create_scan_record(), create_user(), _generate_otp(), get_active_otp(), get_bias_trends() (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (34): Write per-signal bias deltas to the resume_scores table after a     /counterfact, record_bias_deltas(), compare_models(), _compute_percentile_from_db(), counterfactual_test(), detect_role(), execute_scan_job(), extract_resume_text() (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (11): App(), AuthenticatedApp(), ErrorBoundary, useAppState(), useAuth(), AuthView(), LoginForm(), OTPScreen() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (20): _extract_duration_months(), _load_model(), preformat_resume(), Structure Agent (v2 — Fine-tuned T5 / Bot 3) ----------------------------------, Attempt to repair common T5 output malformations:       - Parentheses used inst, Lazy-load the fine-tuned T5 model.      Priority:       1. HuggingFace Hub (f, Normalise sanitised resume text to match the training-data style exactly., Feed pre-formatted resume text into the fine-tuned T5 model (LOCAL).     Return (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (19): create_access_token(), decode_access_token(), get_current_user(), get_optional_user(), hash_password(), auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────, Like get_current_user but does NOT raise on missing token.     Returns User or N, Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string. (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (9): FPDF, export_report(), Generates and returns a professional PDF Bias Audit Report.      Accepts the f, AethelReport, generate_report(), report_generator.py - Generates a professional PDF Bias Audit Report.  Uses fpdf, Replace non-Latin-1 characters with ASCII equivalents., Build a PDF Bias Audit Report from scan result data.      Args:         data: { (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (3): ResultsView(), ScoreMeter(), useCountUp()

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (9): Bot4Evaluator, _download_model(), evaluate(), EvaluateRequest, modal_bot4.py — Bot 4 (Phi-3.5 fine-tune) on Modal.com =========================, Build the Phi-3 chat-format prompt (identical to training format)., Extract JSON scorecard from raw model output., Called once at image build time. Downloads model into /model-cache. (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (4): deltaSign(), ModelCard(), RadarDiff(), scoreColor()

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (11): _build_hf_payload(), _call_hf_inference_api(), evaluate_resume(), _groq_fallback(), _parse_hf_response(), Bot 4 — Resume Evaluator (Phi-3.5 + LoRA) =====================================, Priority 4: Fast Groq LLM fallback when all fine-tuned model endpoints are down., Run Bot 4 inference.      Priority order:       1. COLAB_URL        — Google (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (9): _otp_html(), email_service.py — Transactional email via Resend ──────────────────────────────, Send a 6-digit OTP verification email.     Returns True if sent (or printed in d, Alias for resend flow — send a new OTP when user requests it again., POST to Resend's /emails endpoint.     Returns True on success, False on any fai, Premium, brandable HTML OTP email. No external CSS or images., send_otp_email(), send_resend_otp_email() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (8): _load_gliner(), Lazy-load GLiNER model. Only ~1.5GB RAM — runs fine on HF Spaces free tier., Bot 1 (PRIMARY): GLiNER NER-based PII stripping.     Deterministic, auditable,, Bot 1 (FALLBACK): LLM-based PII stripping via Groq API.     Probabilistic, slow, Feature 1: Strip all PII from resume text before analysis.     Priority: GLiNER, _strip_pii(), _strip_pii_via_gliner(), _strip_pii_via_llm()

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (5): detect_caste_proxy_signals(), get_mutation_names(), name_signals.py — Demographic signal detection for Indian names.  LIMITATIONS:, Given an original candidate name, return a dict of alternate names     represent, Return demographic signal tags for a given name.      Returns:       {         "

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): Called once when the container boots. Loads model into GPU VRAM.

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): One row per completed /analyze OR /counterfactual-test invocation.      PII-free

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): Create tables if they don't already exist. Idempotent.

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): Write per-signal bias deltas to the resume_scores table after a     /counterfact

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints.

## Knowledge Gaps
- **127 isolated node(s):** `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.`, `Create a signed JWT access token.     Payload: sub (user_id), email, role, exp (`, `Decode and validate a JWT. Returns payload dict or None on failure.     Raises n` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 24`** (1 nodes): `Called once when the container boots. Loads model into GPU VRAM.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `One row per completed /analyze OR /counterfactual-test invocation.      PII-free`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `Create tables if they don't already exist. Idempotent.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `Write per-signal bias deltas to the resume_scores table after a     /counterfact`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ResumeScore` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 13`?**
  _High betweenness centrality (0.266) - this node is a cross-community bridge._
- **Why does `export_report()` connect `Community 7` to `Community 1`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 118 inferred relationships involving `ResumeScore` (e.g. with `ColabUrlUpdate` and `RegisterRequest`) actually correct?**
  _`ResumeScore` has 118 INFERRED edges - model-reasoned connections that need verification._
- **What connects `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._