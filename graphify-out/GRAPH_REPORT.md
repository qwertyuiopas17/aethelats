# Graph Report - current  (2026-05-25)

## Corpus Check
- 43 files · ~486,649 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 465 nodes · 646 edges · 22 communities detected
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 166 edges (avg confidence: 0.6)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `ResumeScore` - 114 edges
2. `useAuth()` - 14 edges
3. `execute_scan_job()` - 13 edges
4. `parse_json_response()` - 11 edges
5. `AethelReport` - 11 edges
6. `generate_report()` - 10 edges
7. `extract_resume_text()` - 9 edges
8. `auth_register()` - 9 edges
9. `_fetch_platform_data()` - 8 edges
10. `create_access_token()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ResumeScore` --uses--> `Deterministic Legacy ATS Score Simulator.      Mimics keyword-only ATS behavio`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Guardrail: Checks if the extracted text is actually a resume/CV.      Two-tier`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `OCR an image resume using Groq Vision (llama-4-scout).     Includes automatic P`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Extract text from a native (non-scanned) PDF using PyPDF2.`  [INFERRED]
  backend\database.py → backend\main.py
- `ResumeScore` --uses--> `Unified resume text extractor.      Routing logic:       .pdf  → PyPDF2 (fast`  [INFERRED]
  backend\database.py → backend\main.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (60): get_bias_trends(), Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints., One row per completed /analyze OR /counterfactual-test invocation.      PII-free, ResumeScore, bias_comparison(), _load_gliner(), Starts the background task when the FastAPI server starts., Persist one anonymised scoring result. Silent-fail: a DB outage     must never (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (55): create_access_token(), decode_access_token(), get_current_user(), get_optional_user(), hash_password(), auth.py — JWT + bcrypt authentication helpers for Aethel ATS ──────────────────, Like get_current_user but does NOT raise on missing token.     Returns User or, Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string. (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (48): BaseModel, analyze_job_description(), analyze_links(), auth_me(), batch_analyze_resumes(), chat(), ColabUrlUpdate, Completions (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (16): App(), AuthenticatedApp(), ErrorBoundary, useAppState(), useAuth(), AuthView(), LoginForm(), OTPScreen() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (37): Write per-signal bias deltas to the resume_scores table after a     /counterfact, record_bias_deltas(), _analyze(), build_analysis_prompt(), compare_models(), counterfactual_test(), detect_role(), _dispatch_llm() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (20): _extract_duration_months(), _load_model(), preformat_resume(), Structure Agent (v2 — Fine-tuned T5 / Bot 3) ----------------------------------, Attempt to repair common T5 output malformations:       - Parentheses used inst, Lazy-load the fine-tuned T5 model.      Priority:       1. HuggingFace Hub (f, Normalise sanitised resume text to match the training-data style exactly., Feed pre-formatted resume text into the fine-tuned T5 model (LOCAL).     Return (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (9): FPDF, export_report(), Generates and returns a professional PDF Bias Audit Report.      Accepts the f, AethelReport, generate_report(), report_generator.py - Generates a professional PDF Bias Audit Report.  Uses fp, Replace non-Latin-1 characters with ASCII equivalents., Build a PDF Bias Audit Report from scan result data.      Args:         data: (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (3): ResultsView(), ScoreMeter(), useCountUp()

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): init_db(), Safely add a single column to an existing table.     Uses IF NOT EXISTS for Post, Create tables if they don't already exist, then run column migrations., _run_migration(), broadcast_to_batch(), keep_awake_task(), process_job_with_stages(), Async loop that waits 14 minutes, then runs the ping. (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): _compute_percentile_from_db(), execute_scan_job(), extract_urls_from_text(), Returns (percentile, pool_size, is_mock).      - Counts rows for this role_tar, Deterministic Legacy ATS Score Simulator.      Mimics keyword-only ATS behavio, Extract all URLs from resume text., _simulate_legacy_ats(), Bug Condition Exploration Test: Pipeline Stage Ordering  **Property 1: Bug Con (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (9): Bot4Evaluator, _download_model(), evaluate(), EvaluateRequest, modal_bot4.py — Bot 4 (Phi-3.5 fine-tune) on Modal.com =========================, Build the Phi-3 chat-format prompt (identical to training format)., Extract JSON scorecard from raw model output., Called once at image build time. Downloads model into /model-cache. (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (4): deltaSign(), ModelCard(), RadarDiff(), scoreColor()

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (11): _build_hf_payload(), _call_hf_inference_api(), evaluate_resume(), _groq_fallback(), _parse_hf_response(), Bot 4 — Resume Evaluator (Phi-3.5 + LoRA) =====================================, Priority 4: Fast Groq LLM fallback when all fine-tuned model endpoints are down., Run Bot 4 inference.      Priority order:       1. COLAB_URL        — Google (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (9): _otp_html(), email_service.py — Transactional email via Resend ─────────────────────────────, Send a 6-digit OTP verification email.     Returns True if sent (or printed in, Alias for resend flow — send a new OTP when user requests it again., POST to Resend's /emails endpoint.     Returns True on success, False on any fa, Premium, brandable HTML OTP email. No external CSS or images., send_otp_email(), send_resend_otp_email() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (5): detect_caste_proxy_signals(), get_mutation_names(), name_signals.py — Demographic signal detection for Indian names.  LIMITATIONS:, Given an original candidate name, return a dict of alternate names     represen, Return demographic signal tags for a given name.      Returns:       {

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (4): get_user_scans(), Return the most recent scan records for a user as plain dicts., get_user_scan_history(), Return the most recent 20 scan records for the authenticated user.

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (4): Move a candidate card to a new Kanban stage.     Only updates if the record belo, update_kanban_stage(), Move a candidate card to a different Kanban pipeline stage., update_scan_kanban_stage()

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Called once when the container boots. Loads model into GPU VRAM.

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (1): Test stage callbacks fire in sequential order [0, 1, 2, 3, 4, 5, 6, 7] for 1 res

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (1): Test stage callbacks fire in sequential order for 3 resumes.

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): Verify that parallel execution optimization is active (skill graph + blind scori

## Knowledge Gaps
- **114 isolated node(s):** `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ──────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.`, `Create a signed JWT access token.     Payload: sub (user_id), email, role, exp`, `Decode and validate a JWT. Returns payload dict or None on failure.     Raises` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 28`** (1 nodes): `Called once when the container boots. Loads model into GPU VRAM.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `POST /evaluate         Body: EvaluateRequest JSON — see model above.         Ret`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `Test stage callbacks fire in sequential order [0, 1, 2, 3, 4, 5, 6, 7] for 1 res`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `Test stage callbacks fire in sequential order for 3 resumes.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `Verify that parallel execution optimization is active (skill graph + blind scori`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ResumeScore` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `export_report()` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 109 inferred relationships involving `ResumeScore` (e.g. with `ColabUrlUpdate` and `RegisterRequest`) actually correct?**
  _`ResumeScore` has 109 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `useAuth()` (e.g. with `AuthenticatedApp()` and `App()`) actually correct?**
  _`useAuth()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `execute_scan_job()` (e.g. with `create_scan_record()` and `test_stage_callbacks_sequential_order_single_resume()`) actually correct?**
  _`execute_scan_job()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `auth.py — JWT + bcrypt authentication helpers for Aethel ATS ──────────────────`, `Hash a plaintext password with bcrypt. Returns the hash as a UTF-8 string.`, `Return True if plain matches the stored bcrypt hash.` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._