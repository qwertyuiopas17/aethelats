# Graph Report - C:\Users\gtrip\OneDrive\Desktop\bias_working-main  (2026-04-23)

## Corpus Check
- Corpus is ~15,553 words - fits in a single context window. You may not need a graph.

## Summary
- 101 nodes · 163 edges · 13 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Bias UI Components|Frontend Bias UI Components]]
- [[_COMMUNITY_LLM Analysis Pipeline|LLM Analysis Pipeline]]
- [[_COMMUNITY_Platform Data Fetchers|Platform Data Fetchers]]
- [[_COMMUNITY_Backend API Routes|Backend API Routes]]
- [[_COMMUNITY_Fair Hiring Concepts|Fair Hiring Concepts]]
- [[_COMMUNITY_Counterfactual & Multi-Model Testing|Counterfactual & Multi-Model Testing]]
- [[_COMMUNITY_Python Dependencies|Python Dependencies]]
- [[_COMMUNITY_Resume Processing Core|Resume Processing Core]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_App Root & Utilities|App Root & Utilities]]
- [[_COMMUNITY_Job Description Bias Auditor|Job Description Bias Auditor]]
- [[_COMMUNITY_HTML Entry Point|HTML Entry Point]]
- [[_COMMUNITY_Project README|Project README]]

## God Nodes (most connected - your core abstractions)
1. `parse_json_response()` - 10 edges
2. `_fetch_platform_data()` - 9 edges
3. `extract_text_from_pdf()` - 7 edges
4. `analyze_resume()` - 6 edges
5. `Backend Dependencies` - 6 edges
6. `_strip_pii()` - 5 edges
7. `_analyze()` - 5 edges
8. `ErrorBoundary` - 5 edges
9. `extract_urls_from_text()` - 4 edges
10. `detect_platform()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `PII Stripping / Blind Evaluation` --semantically_similar_to--> `_strip_pii()`  [INFERRED] [semantically similar]
  README.md → C:\Users\gtrip\OneDrive\Desktop\bias_working-main\backend\main.py
- `Resume Analysis Pipeline` --semantically_similar_to--> `analyze_resume()`  [INFERRED] [semantically similar]
  README.md → C:\Users\gtrip\OneDrive\Desktop\bias_working-main\backend\main.py
- `PyPDF2 PDF Parser` --conceptually_related_to--> `extract_text_from_pdf()`  [INFERRED]
  backend/requirements.txt → C:\Users\gtrip\OneDrive\Desktop\bias_working-main\backend\main.py
- `Requests HTTP Library` --conceptually_related_to--> `_fetch_github()`  [INFERRED]
  backend/requirements.txt → C:\Users\gtrip\OneDrive\Desktop\bias_working-main\backend\main.py
- `Requests HTTP Library` --conceptually_related_to--> `_fetch_leetcode()`  [INFERRED]
  backend/requirements.txt → C:\Users\gtrip\OneDrive\Desktop\bias_working-main\backend\main.py

## Hyperedges (group relationships)
- **FairAI Core Analysis Pipeline** — concept_resume_analysis, concept_pii_stripping, concept_bias_detection, concept_fair_hiring [INFERRED 0.85]
- **Backend Python Dependency Stack** — dep_fastapi, dep_uvicorn, dep_groq, dep_pypdf2, dep_requests [EXTRACTED 1.00]

## Communities

### Community 0 - "Frontend Bias UI Components"
Cohesion: 0.16
Nodes (22): ArchitectureDiagram(), BiasStabilitySection(), ComplianceDashboard(), FairnessGateModal(), FairnessMetricsCard(), FeatureAttributionChart(), getLogColor(), JDAnalysisSection() (+14 more)

### Community 1 - "LLM Analysis Pipeline"
Cohesion: 0.15
Nodes (13): _analyze(), build_analysis_prompt(), _generate_mutations(), parse_json_response(), _quick_score(), Score a resume with a specific model — returns fit_score and primary_reason., Robustly extract the outermost JSON object from a response string., Run the full bias-free analysis on sanitized text. (+5 more)

### Community 2 - "Platform Data Fetchers"
Cohesion: 0.36
Nodes (9): Requests HTTP Library, _fetch_codeforces(), _fetch_devto(), _fetch_github(), _fetch_huggingface(), _fetch_leetcode(), _fetch_platform_data(), _note_platform() (+1 more)

### Community 3 - "Backend API Routes"
Cohesion: 0.29
Nodes (6): analyze_links(), _extract_username_from_url(), get_stats(), health(), Extract username/handle from a profile URL., Fetches public data from candidate profile links and synthesizes an unbiased pro

### Community 4 - "Fair Hiring Concepts"
Cohesion: 0.33
Nodes (7): AI Bias Detection, Fair Hiring Compliance, PII Stripping / Blind Evaluation, Resume Analysis Pipeline, Feature 1: Strip all PII from resume text before analysis., _strip_pii(), Test Resume - Jane Doe Data Scientist

### Community 5 - "Counterfactual & Multi-Model Testing"
Cohesion: 0.33
Nodes (6): counterfactual_test(), detect_role(), extract_text_from_pdf(), multi_model_test(), Score the same resume with multiple models to prove bias is systemic.     Also r, REAL demographic mutation test:     1. Generates 3 mutated resume versions via L

### Community 6 - "Python Dependencies"
Cohesion: 0.33
Nodes (6): FastAPI Framework, Groq LLM Client, PyPDF2 PDF Parser, Python Multipart, Uvicorn ASGI Server, Backend Dependencies

### Community 7 - "Resume Processing Core"
Cohesion: 0.5
Nodes (4): analyze_resume(), detect_platform(), extract_urls_from_text(), Extract all URLs from resume text.

### Community 8 - "Error Boundary"
Cohesion: 0.5
Nodes (1): ErrorBoundary

### Community 9 - "App Root & Utilities"
Cohesion: 0.67
Nodes (3): App(), getFitVariant(), getScoreColor()

### Community 10 - "Job Description Bias Auditor"
Cohesion: 1.0
Nodes (2): analyze_job_description(), Analyzes a job description for biased language using research-backed criteria.

### Community 11 - "HTML Entry Point"
Cohesion: 1.0
Nodes (2): HTML Entry Point, Vite React Application

### Community 24 - "Project README"
Cohesion: 1.0
Nodes (1): FairAI Project

## Knowledge Gaps
- **21 isolated node(s):** `Robustly extract the outermost JSON object from a response string.`, `Extract all URLs from resume text.`, `Extract username/handle from a profile URL.`, `For platforms we can't fetch from — just note they exist.`, `Feature 1: Strip all PII from resume text before analysis.` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Error Boundary`** (4 nodes): `ErrorBoundary`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Job Description Bias Auditor`** (2 nodes): `analyze_job_description()`, `Analyzes a job description for biased language using research-backed criteria.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HTML Entry Point`** (2 nodes): `HTML Entry Point`, `Vite React Application`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project README`** (1 nodes): `FairAI Project`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Backend Dependencies` connect `Python Dependencies` to `Platform Data Fetchers`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `extract_text_from_pdf()` connect `Counterfactual & Multi-Model Testing` to `Platform Data Fetchers`, `Backend API Routes`, `Python Dependencies`, `Resume Processing Core`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `analyze_resume()` connect `Resume Processing Core` to `Platform Data Fetchers`, `Backend API Routes`, `Fair Hiring Concepts`, `Counterfactual & Multi-Model Testing`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `Robustly extract the outermost JSON object from a response string.`, `Extract all URLs from resume text.`, `Extract username/handle from a profile URL.` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._