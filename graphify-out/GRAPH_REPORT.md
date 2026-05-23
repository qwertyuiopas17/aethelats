# Graph Report - current  (2026-05-23)

## Corpus Check
- 35 files · ~452,228 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 398 nodes · 546 edges · 20 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 126 edges (avg confidence: 0.59)
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `ResumeScore` - 95 edges
2. `parse_json_response()` - 11 edges
3. `AethelReport` - 11 edges
4. `generate_report()` - 10 edges
5. `useAuth()` - 10 edges
6. `analyze_resume()` - 9 edges
7. `extract_resume_text()` - 8 edges
8. `_fetch_platform_data()` - 8 edges
9. `auth_register()` - 7 edges
10. `structure_resume()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Deterministic Legacy ATS Score Simulator.      Mimics keyword-only ATS behavio` --uses--> `ResumeScore`  [INFERRED]
  backend\main.py → backend\database.py
- `Guardrail: Checks if the extracted text is actually a resume/CV.      Two-tier` --uses--> `ResumeScore`  [INFERRED]
  backend\main.py → backend\database.py
- `OCR an image resume using Groq Vision (llama-4-scout).     Includes automatic P` --uses--> `ResumeScore`  [INFERRED]
  backend\main.py → backend\database.py
- `Extract text from a native (non-scanned) PDF using PyPDF2.` --uses--> `ResumeScore`  [INFERRED]
  backend\main.py → backend\database.py
- `Unified resume text extractor.      Routing logic:       .pdf  → PyPDF2 (fast` --uses--> `ResumeScore`  [INFERRED]
  backend\main.py → backend\database.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (51): analyze_job_description(), analyze_links(), analyze_resume(), auth_me(), chat(), compare_models(), Completions, _compute_percentile_from_db() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (55): BaseModel, init_db(), Create tables if they don't already exist. Idempotent., One row per completed /analyze OR /counterfactual-test invocation.      PII-free, ResumeScore, ColabUrlUpdate, keep_awake_task(), _load_gliner() (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (38): hash_password(), Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string., Base, create_otp(), create_scan_record(), create_user(), _generate_otp(), get_active_otp() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (11): App(), AuthenticatedApp(), ErrorBoundary, useAppState(), useAuth(), AuthView(), LoginForm(), OTPScreen() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (27): _analyze(), build_analysis_prompt(), counterfactual_test(), detect_role(), _dispatch_llm(), _full_score_with_model(), _generate_mutations(), _generate_skills_for_role() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (21): create_access_token(), decode_access_token(), get_current_user(), get_optional_user(), auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────, Like get_current_user but does NOT raise on missing token.     Returns User or N, Return True if plain matches the stored bcrypt hash., Create a signed JWT access token.     Payload: sub (user_id), email, role, exp ( (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (20): _extract_duration_months(), _load_model(), preformat_resume(), Structure Agent (v2 — Fine-tuned T5 / Bot 3) ----------------------------------, Attempt to repair common T5 output malformations:       - Parentheses used inst, Lazy-load the fine-tuned T5 model.      Priority:       1. HuggingFace Hub (f, Normalise sanitised resume text to match the training-data style exactly., Feed pre-formatted resume text into the fine-tuned T5 model (LOCAL).     Return (+12 more)

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

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): detect_caste_proxy_signals(), get_mutation_names(), name_signals.py — Demographic signal detection for Indian names.  LIMITATIONS:, Given an original candidate name, return a dict of alternate names     represent, Return demographic signal tags for a given name.      Returns:       {         "

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): Called once when the container boots. Loads model into GPU VRAM.

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (1): One row per completed /analyze OR /counterfactual-test invocation.      PII-free

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): Create tables if they don't already exist. Idempotent.

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): Write per-signal bias deltas to the resume_scores table after a     /counterfact

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints.

## Knowledge Gaps
- **99 isolated node(s):** `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.`, `Create a signed JWT access token.     Payload: sub (user_id), email, role, exp (`, `Decode and validate a JWT. Returns payload dict or None on failure.     Raises n` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (1 nodes): `Called once when the container boots. Loads model into GPU VRAM.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `One row per completed /analyze OR /counterfactual-test invocation.      PII-free`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `Create tables if they don't already exist. Idempotent.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `Write per-signal bias deltas to the resume_scores table after a     /counterfact`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ResumeScore` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `export_report()` connect `Community 7` to `Community 0`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 90 inferred relationships involving `ResumeScore` (e.g. with `ColabUrlUpdate` and `RegisterRequest`) actually correct?**
  _`ResumeScore` has 90 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `useAuth()` (e.g. with `AuthenticatedApp()` and `App()`) actually correct?**
  _`useAuth()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ───────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._