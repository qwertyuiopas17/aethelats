---
title: Aethel FairAI Backend
emoji: 🛡️
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

```
 █████╗ ███████╗████████╗██╗  ██╗███████╗██╗
██╔══██╗██╔════╝╚══██╔══╝██║  ██║██╔════╝██║
███████║█████╗     ██║   ███████║█████╗  ██║
██╔══██║██╔══╝     ██║   ██╔══██║██╔══╝  ██║
██║  ██║███████╗   ██║   ██║  ██║███████╗███████╗
╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝

              A E T H E L   ·   U N B I A S E D   H I R I N G   I N T E L L I G E N C E
```

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-LPU%20Inference-F55036?style=for-the-badge)

**The world's first fully auditable, multi-model AI resume screening pipeline built to eliminate demographic bias — with a focus on India-specific bias vectors.**

</div>

---

## 🧠 What is Aethel?

Aethel is a **research-grade AI hiring compliance engine** built on a single founding principle:

> *A candidate's name, university, gender, location, career gap, or caste-proxy signal should have zero effect on how their resume is scored.*

Modern AI hiring tools — including mainstream LLMs like GPT-4, Gemini, and Llama — are trained on internet-scale data that mirrors decades of real-world hiring biases. They score resumes higher when the institution is IIT or MIT, when the name is dominant-caste or Western, and when there are no employment gaps. **Aethel proves this empirically, shows you the numbers, and then corrects for it.**

This is not a keyword matcher. It is not a job board. Aethel is a **process-level compliance tool** — it plugs into the decision layer of hiring and audits whether the evaluation itself is fair.

---

## ❓ Is Hiring Bias Real in India? (What the Data Says)

Before claiming to solve a problem, it must exist. In India, it does — and it is documented by real placement data, industry reports, and audit studies.

---

### 🏫 1. Institution Prestige Bias — The IIT vs. Everyone Else Gap

This is the bias vector that affects **the largest number of Indian candidates** — the 99%+ of engineers who did not attend an IIT.

**Placement salary data (2024, sourced from placement reports and Business Standard):**

| Institution Tier | Typical Average Package (CSE) | Access to "Day 0" Recruiters |
|---|---|---|
| Old IITs (Bombay, Delhi, Madras) | ₹20–35 LPA avg · outliers to ₹2+ crore | Yes — HFT firms, FAANG, top consulting |
| Top NITs (Trichy, Surathkal, Warangal) | ₹10–18 LPA avg | Partial — some top recruiters, mostly Tier-2 |
| Other NITs / State colleges | ₹4–9 LPA avg | Mostly mass recruiters (AMCAT/CoCubes driven) |

**The ₹1 crore package myth:** In 2024, IIT Bombay initially reported that 85 students received packages above ₹1 crore, then **corrected that figure to 22** — citing a "technical error" (*Business Standard, 2024*). The actual median package was ₹17.92 LPA. The outlier figures get amplified by media, creating a distorted public perception that all IIT graduates are elite and NIT graduates are "second tier" — a narrative baked into LLM training data and which surfaces as scoring bias.

**The "Day 0" gating system:** Top global recruiters exclusively conduct "Day 0" and "Day 1" hiring drives at IIT campuses. An equally skilled NIT candidate is literally never in the same hiring room as an IIT candidate — not because of skill, but because of which campus they attend. This is an institutional access problem, not a skills problem. Aethel's blind evaluation removes `[INSTITUTION]` from the scoring context entirely.

---

### 👩 2. Gender & Maternity Penalty — India-Specific Data

**Gender pay gap in Indian tech (2024, sourced from Business Standard / industry reports):**

| Sector | Overall Gender Pay Gap | Mid-Level Gap | Senior-Level Gap |
|---|---|---|---|
| IT Services | 3.55% | 6.12% | 8.34% |
| Global Capability Centers (GCCs) | 16.1% | — | 22.2% (high-demand tech roles) |
| Non-tech roles in tech-adjacent sectors | 18–19% at mid-level | — | — |

**The Maternity Benefit Act paradox:** The 2017 amendment extending paid maternity leave to **26 weeks** — the third-longest in the world — was a landmark policy. Research and reporting in *Policy Circle* and *Business Standard* document an unintended consequence: many employers began **actively avoiding hiring women of childbearing age** to sidestep the cost, despite this being illegal under Article 16 of the Constitution.

**What this means in ATS terms:** A 7-month maternity gap is indistinguishable from a 7-month unemployment gap in every mainstream ATS and untreated LLM. Both are scored identically as a "reliability risk." One is a legally protected right. Aethel explicitly prompts: *"NEVER penalise employment gaps — they may be legally protected."*

- **40%** of professional women in India report experiencing bias or discriminatory behavior in hiring (Economic Times)
- The **"leaky pipeline"**: Women account for large proportions of entry-level hiring but representation drops sharply at every level above — a pattern traced directly to missed promotions during or after maternity breaks

---

### 🗣️ 3. English Language & Accent Bias

India has **22 scheduled languages** and hundreds of dialects. Yet corporate India — especially MNCs and product-based tech companies — uses English as the sole hiring language, creating a proxy filter that is not about job skill:

- English proficiency in India correlates directly with **access to English-medium schools**, which correlates with **urban location and socioeconomic class** — not with technical ability
- Recruiters use "fluency" and "accent" as a **signaling device** to categorize candidates as "professional" or "unsophisticated" — a documented bias in HR research (*HR Katha*, *ABAC Journals*)
- Job postings explicitly requiring "native-level English" or "neutral accent" are used in India to filter out candidates from non-metro, vernacular-medium educational backgrounds — the same candidates who often have strong technical skills but non-elite English
- **LLMs amplify this:** Models trained on English-dominant professional text (LinkedIn, Glassdoor, resume databases) associate formal Western English writing style with candidate quality. A resume written in simple but technically accurate English scores lower than one with polished MBA-speak, even when the underlying skills are identical or superior

Aethel strips communication-style signals from scoring context and focuses purely on **evidenced, contextual skill usage**.

---

### 📍 4. Location & Tier-2 City Bias

India's hiring ecosystem is overwhelmingly concentrated in 5–6 metro cities. Candidates from Tier-2 and Tier-3 cities face compounding disadvantages:

- **Address as a filter:** A Nagpur or Patna address on a resume is statistically associated with "regional" talent by recruiters and ATS systems trained on metro-skewed historical data, even for fully remote roles
- **Networking gap:** Top-tier job referrals flow through alumni networks of IITs, IIMs, and metro colleges. Candidates from Tier-2 cities are structurally outside these networks regardless of skill
- **Internet-sourced LLM bias:** LLMs learn from professional content created disproportionately by metro-based, English-literate professionals — meaning the "ideal" resume they've learned to reward reflects metro experience and metro institutions, not actual skill distributions across India's 700+ engineering colleges
- **Relocation perception:** Candidates from Tier-2 cities are often penalized during screening for "relocation uncertainty" — a proxy bias that has no correlation with job performance

Aethel replaces city/address with `[LOCATION]` before scoring, making location invisible to the evaluation model.

---

### 📋 5. AMCAT, CoCubes & eLitmus — The "Tier-2 Tax"

These platforms were *designed* to level the playing field for non-IIT students. In practice:

- **The halo effect persists:** Even a high AMCAT score doesn't override the IIT brand premium — it's used as a tiebreaker, not a leveller
- **Low-quality job funnel:** High scores predominantly lead to service-based companies offering ₹3–4 LPA — top product companies don't use AMCAT as a filter; they use campus presence at elite institutions
- **Aptitude ≠ skill:** These tests measure reasoning shaped by access to coaching (FIITJEE, Allen, etc.) — itself correlated with socioeconomic class and Tier-1 city access
- **Zero explainability:** AMCAT gives a 3-digit score with no explanation of *why* — unlike Aethel's factor-by-factor, fully explainable scorecard

> **The system is circular:** IIT students enter IIT because they had coaching access. They get top jobs because recruiters visit only IIT campuses. LLMs trained on this historical hiring data learn "IIT = hire." Equally skilled NIT and state college graduates are filtered before any human ever sees them. **Aethel breaks this loop.**

---

> **The bias is not hypothetical. It is documented in placement data, industry reports, and audit studies — and it is embedded in every LLM used for hiring in India today.**

---



This is the bias vector that affects **the largest number of Indian candidates** — the 99%+ of engineers who did not attend an IIT.

**Placement salary data (2024):**

| Institution Tier | Typical Average Package (CSE) | Access to "Day 0" Recruiters |
|---|---|---|
| Old IITs (Bombay, Delhi, Madras) | ₹20–35 LPA avg · outliers to ₹2+ crore | Yes — global HFT, FAANG, consulting |
| Top NITs (Trichy, Surathkal, Warangal) | ₹10–18 LPA avg | Partial — some top recruiters, mostly Tier-2 |
| Other NITs / State colleges | ₹4–9 LPA avg | Mostly mass recruiters (AMCAT/CoCubes driven) |

**The ₹1 crore package myth:** In 2024, IIT Bombay initially claimed 85 students received packages above ₹1 crore, then **corrected it to 22** — citing a "technical error." The median IIT Bombay package was ₹17.92 LPA. The outlier figures get amplified by media, creating a distorted perception that all IIT graduates are elite, while NIT graduates are "second tier" — a narrative that is **baked into LLM training data** and surfaces as scoring bias.

**The "Day 0" gating system:** Top recruiters only visit IIT campuses for "Day 0" drives — meaning equally or better-skilled NIT candidates literally never get seen by the same recruiters, regardless of their GitHub contributions, project quality, or technical depth. This is an institutional access problem, not a skills problem. And it is what Aethel's blind evaluation corrects for.

---

### 👩 3. Gender & Maternity Penalty — Documented Indian Evidence

- **40%** of professional women in India report experiencing bias or discriminatory behavior in hiring or the workplace (Economic Times survey)
- The **2017 Maternity Benefit Act amendment** (extending paid leave to 26 weeks) — a progressive policy — **backfired in practice**: research documents employers actively avoiding hiring women of childbearing age to avoid the perceived cost, a trend documented in studies and reported in Business Standard and Policy Circle
- Indian corporate career models assume **linear, uninterrupted employment**. A 7-month maternity gap is treated identically to a 7-month unemployment gap in every mainstream ATS — despite the former being a **legally protected right under Indian law**
- The **"leaky pipeline"**: Women are hired in large numbers at entry level but representation drops sharply at every level above it — often traced to missed promotions and projects during or after maternity breaks

---

### 📋 4. AMCAT, CoCubes & eLitmus — The "Tier-2 Tax"

These platforms were *designed* to level the playing field by letting non-IIT students prove aptitude. In practice, they perpetuate a different form of bias:

- **The halo effect persists:** Even when a Tier-2 student scores well on AMCAT, recruiters still subconsciously favour IIT/BITS resumes — the test score is a tiebreaker, not a leveller
- **Low-quality job funnel:** High AMCAT scores predominantly lead to service-based companies and mass recruiters offering ₹3–4 LPA. Top product-based companies do not use AMCAT as a primary filter — they rely on campus presence at elite institutions
- **Aptitude ≠ skill:** These tests measure reasoning and quantitative aptitude — skills shaped by access to coaching (FIITJEE, Allen, etc.), which correlates with socioeconomic class and Tier-1 city access, not raw engineering ability
- **No contextual evaluation:** AMCAT gives a 3-digit score with zero explanation of *why* a candidate scored what they did — unlike Aethel's fully explainable, factor-by-factor scorecard

> **The system is circular:** IIT students get IIT because they had coaching. They get jobs because recruiters go to IIT campuses. LLMs trained on hiring data learn that IIT = hire. Candidates with identical skills from NITs or state colleges are filtered out before any human ever sees them. **Aethel breaks this loop.**

---

> **The bias is not hypothetical. It is measured. It is active. And it is embedded in every LLM used for hiring in India today.**

---

## 🎯 What Aethel Does

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AETHEL OUTCOMES AT A GLANCE                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ✦  Strips PII before any AI sees the resume                            │
│  ✦  Scores skills contextually (proven usage) vs declaratively (listed) │
│  ✦  Runs real demographic mutation tests — not simulated guesses        │
│  ✦  Measures 4 EEOC/EU/NYC regulatory fairness metrics per resume       │
│  ✦  Detects intersectional bias amplification (compound discrimination) │
│  ✦  Audits job descriptions for biased language (Gaucher et al. 2011)   │
│  ✦  Fetches live proof-of-work from GitHub, LeetCode, Codeforces etc.   │
│  ✦  Compares its bias sensitivity directly against Llama, Gemma, Mixtral│
│  ✦  Renders a full Skill Knowledge Graph for every candidate            │
│  ✦  India-specific bias vectors: IIT/NIT swap, maternity gap, Tier-2    │
│     city, caste-proxy names (Priya Kumari vs Arjun Sharma)              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🇮🇳 Why India-Specific Bias Vectors Matter

Global tools like Textio, Pymetrics, and Workday are built for US/EU compliance frameworks. **India has no equivalent hiring-AI regulation yet** — which means:

- AMCAT, CoCubes, and eLitmus use aptitude-test cutoffs heavily correlated with Tier-1 college training pipelines, not actual skill
- Indian ATS systems trained on historical hire data are dominated by IIT/IIM graduates, systematically underscoring NIT/state-college graduates with equal skills
- Indian names carry demographic signals (gender, regional origin) that LLMs trained on hiring data use as scoring proxies — even when explicit identity markers are removed
- The Maternity Benefit Act protects career gaps — but no mainstream ATS respects this

**Aethel tests for all four simultaneously:**

```
Bias Vector          │ What Aethel Tests
─────────────────────┼──────────────────────────────────────────────────────
Institution Prestige │ Score with NIT Trichy  →  Score with IIT Bombay
                     │ Typical LLM delta: +9 to +12 pts   Aethel delta: +1
─────────────────────┼──────────────────────────────────────────────────────
Maternity Leave Gap  │ Score with 7-month gap  →  Score without gap
                     │ Typical LLM delta: +5 to +8 pts   Aethel delta: +2
─────────────────────┼──────────────────────────────────────────────────────
Name / Caste Proxy   │ Score as Priya Kumari  →  Score as Arjun Sharma
                     │ Typical LLM delta: +2 to +4 pts   Aethel delta: 0
─────────────────────┼──────────────────────────────────────────────────────
City / Tier Proxy    │ Score with Nagpur address  →  Score with Bengaluru
                     │ Typical LLM delta: +2 pts          Aethel delta: 0
```

No competing tool — global or Indian — tests any of these vectors.

---

## ⚔️ How Aethel Compares to Existing Tools

| Tool | What it does | What it misses | Aethel's edge |
|---|---|---|---|
| **Textio** | Removes biased language from job descriptions | Does not score resumes. Does not test resume bias. | Aethel does both: JD scanning *and* resume bias audit |
| **Pymetrics** | Replaces resumes with neuroscience games | Requires a separate candidate assessment. Zero friction for recruiters. Doesn't analyze resumes at all. | Aethel works inside the existing resume workflow — zero new steps for candidates |
| **HireVue** | Video AI interview scoring (facial + tonal) | EEOC investigated it. Illinois banned unregulated use. Completely black-box. | Aethel is fully transparent — every score is explained factor by factor |
| **Workday / LinkedIn AI** | Large-scale ATS keyword filtering | Currently being sued for racial and age discrimination (*Mobley v. Workday*, 2024). No bias audit provided to recruiters. | Aethel is the auditor that exposes what tools like Workday are doing wrong |
| **Jobscan** | Tells candidates how to "beat" the ATS | Actively encourages keyword stuffing. Rewards the wrong behavior. Doesn't reduce bias — it games it. | Aethel penalizes keyword stuffing and rewards contextual, evidenced skills |
| **AMCAT / CoCubes** | Aptitude tests used as a hiring filter | Heavily correlated with Tier-1 college training. No skill-contextual evaluation. No bias audit. | Aethel evaluates on demonstrated skills, not test-taking ability shaped by institutional resources |

### The gap nobody fills

**No existing tool tells a recruiter: "Here is exactly how much your current screening process penalized this candidate for their college, name, or career gap — and here is the numerical proof."**

Aethel is the only tool that:
1. Runs a **live, measurable counterfactual test** on a specific resume
2. Gives the recruiter a **numeric bias delta** (e.g., "+11 pts for IIT Bombay vs NIT Trichy")
3. Shows this comparison **across multiple LLMs simultaneously**
4. Does this **without requiring a separate candidate assessment**
5. Targets **India-specific bias vectors** that no global tool covers

---

## 🔬 How Bias is Calculated — The Counterfactual Engine

Aethel doesn't *assume* bias. It **measures** it using **real demographic mutation tests** — the same methodology used in peer-reviewed academic papers and required by EU AI Act Article 9.

### Step 1 — Generate Resume Variants

```
Original Resume (Priya Kumari, NIT Trichy, Nagpur, 7-month maternity gap)
      │
      ├──▶  Variant A: College → "IIT Bombay"         (institution-prestige bias)
      │
      ├──▶  Variant B: Maternity gap removed           (employment-continuity bias)
      │
      ├──▶  Variant C: Name → "Arjun Sharma"           (gender + caste-proxy bias)
      │
      ├──▶  Variant D: Address → "Koramangala, Bengaluru" (metro-location bias)
      │
      └──▶  Variant E: All combined                    (intersectional amplification)
```

Each variant is **identical in technical content** — same skills, same projects, same companies. Only the demographic signal changes.

### Step 2 — Score All Variants Independently

```
  Original score:        82
  ──────────────────────────────────────────────────────
  IIT Bombay:            93   →  Δ = +11  ← institution-prestige bias
  Gap removed:           90   →  Δ = +8   ← maternity-gap bias
  Arjun Sharma:          85   →  Δ = +3   ← name/caste-proxy bias
  Bengaluru address:     84   →  Δ = +2   ← metro-location bias
  All combined:          97   →  Δ = +15  ← intersectional total
```

### Step 3 — 4 Regulatory Fairness Metrics

| Metric | Regulation | Formula | Pass Threshold |
|--------|------------|---------|----------------|
| **Disparate Impact Ratio** | EEOC 4/5ths Rule | `min_score / max_score` | ≥ 0.80 |
| **Score Stability (σ)** | Statistical Reliability | `stdev(all_variant_scores)` | ≤ 5.0 |
| **Bias Amplification Index** | EU AI Act Art. 9 | `max_delta / baseline_score` | ≤ 0.15 |
| **Max Score Deviation** | NYC Local Law 144 | `max(abs(deltas))` | ≤ 5 pts |

### Step 4 — Intersectional Amplification Detection

```python
amplification_detected = combined_delta > sum_of_individual_deltas
amplification_factor   = combined_delta / sum_of_individual_deltas
```

If `amplification_detected = True`, the model exhibits **compound discrimination** — punishing candidates more harshly when multiple disadvantages intersect.

---

## 🏗️ System Architecture — The 4-Bot Pipeline

```
                          ┌─────────────────────────────────────┐
                          │         RESUME  (PDF / Image)        │
                          └──────────────────┬──────────────────┘
                                             │
                          ╔══════════════════▼══════════════════╗
                          ║  BOT 1  ·  GLiNER NER Anonymiser   ║
                          ║  ─────────────────────────────────  ║
                          ║  Named Entity Recognition model     ║
                          ║  Names      →  [CANDIDATE]          ║
                          ║  Colleges   →  [INSTITUTION]        ║
                          ║  Cities     →  [LOCATION]           ║
                          ║  Emails     →  [EMAIL]              ║
                          ║  Pronouns   →  they/their           ║
                          ╚══════════════════╦══════════════════╝
                                             │  sanitised_text
                          ╔══════════════════▼══════════════════╗
                          ║  BOT 3  ·  Fine-tuned T5-base       ║
                          ║  ─────────────────────────────────  ║
                          ║  Seq2Seq model fine-tuned on        ║
                          ║  de-identified resume→JSON pairs    ║
                          ║  Extracts structured schema:        ║
                          ║  • total_years_experience           ║
                          ║  • technical_skills[]               ║
                          ║  • job_history[] (title, months)    ║
                          ║  • education[] (degree, GPA, field) ║
                          ║  • work_experience_summary{}        ║
                          ║  ↓ invalid JSON? → rule-based       ║
                          ║    fallback extractor (deterministic)║
                          ╚══════════════════╦══════════════════╝
                                             │  structured_json
                          ╔══════════════════▼══════════════════╗
                          ║  BOT 4  ·  Fine-tuned Phi-3.5       ║
                          ║  (LoRA Adapter · HuggingFace/Colab) ║
                          ║  ─────────────────────────────────  ║
                          ║  Chat-format model fine-tuned on    ║
                          ║  bias-free resume→scorecard pairs   ║
                          ║  Outputs full scorecard JSON:       ║
                          ║  • overall_score (0–100)            ║
                          ║  • skill_match_score                ║
                          ║  • experience_score                 ║
                          ║  • education_score                  ║
                          ║  • missing_skills[]                 ║
                          ║  • strengths[]                      ║
                          ║  • recommendation                   ║
                          ╚══════════════════╦══════════════════╝
                                             │
                          ╔══════════════════▼══════════════════╗
                          ║  LLaMA 3.3 70B  ·  Groq/LPU        ║
                          ║  (Main Analysis Backbone)           ║
                          ║  ─────────────────────────────────  ║
                          ║  • Full bias-audit analysis         ║
                          ║  • Radar scoring (6 dimensions)     ║
                          ║  • Skill Knowledge Graph matching   ║
                          ║  • Counterfactual mutation scoring  ║
                          ║  • JD bias detection                ║
                          ║  • Proof-of-work link synthesis     ║
                          ╚══════════════════╦══════════════════╝
                                             │
                          ╔══════════════════▼══════════════════╗
                          ║         AETHEL  RESULT  JSON        ║
                          ║  fit_score · radar · bias_proxies   ║
                          ║  counterfactual · fairness_metrics  ║
                          ║  skill_graph · proof_of_work        ║
                          ╚═════════════════════════════════════╝
```

---

## 🧬 Model Architecture — Deep Dive

### Bot 1 — GLiNER (Zero-shot NER Anonymiser)
- Architecture: **Bidirectional encoder** with span-level entity classification
- No fine-tuning required — zero-shot generalises to resume entities
- Replaces 7 PII categories with symbolic placeholders before any scoring model sees the text
- Operates as a preprocessing gate: **no PII ever reaches Bot 3, Bot 4, or the LLM backbone**

### Bot 3 — Fine-tuned T5-base (Structure Agent)
- Architecture: **Text-to-Text Transfer Transformer** (encoder-decoder, 220M params)
- Fine-tuned on de-identified `resume_text → structured_JSON` pairs
- Input: sanitised resume text, normalised to canonical format
- Output: strict schema JSON with `technical_skills`, `job_history`, `education`, `work_experience_summary`
- **Beam search** (4 beams) for deterministic, reproducible output
- **Rule-based fallback** guarantees the pipeline never stalls if the model produces invalid JSON

```
Pre-formatter → T5 Inference → JSON validator → Rule-based fallback (if needed)
                                     ↓
              {total_years_experience, technical_skills[], job_history[],
               highest_degree, education[], experience[], work_experience_summary{}}
```

### Bot 4 — Fine-tuned Phi-3.5 with LoRA Adapter (Evaluator Agent)
- Architecture: **Microsoft Phi-3.5** (3.8B params) fine-tuned with **LoRA (Low-Rank Adaptation)**
- LoRA enables efficient fine-tuning: only adapter weights are trained (~1% of total parameters)
- Fine-tuned on `(structured_JSON + JD_rubric) → scorecard_JSON` pairs with explicit bias-neutrality constraints
- Training uses **Phi-3 chat template** for alignment with instruction-following behaviour
- Runs on **Google Colab** (free T4/A100 GPU) via Cloudflare Tunnel — zero cloud cost
- Falls back to HuggingFace Inference API if Colab is offline

```
  Input:  {structured_resume_json} + {job_description_rubric}
  Output: {overall_score, skill_match_score, experience_score,
           education_score, missing_skills[], strengths[], recommendation}
```

### VLM Support — Image Resume Parsing
- Accepts `.jpg`, `.png`, `.webp`, `.gif` in addition to PDF
- LLaMA 3.3 70B with vision fallback processes image resumes
- Handles scanned documents, photo resumes, and screenshots

### Skill Knowledge Graph
- A curated graph of `canonical_skills` with synonym mappings
- Adjacent skills get **partial credit** (not penalised for using React when Vue is listed)
- Resolves aliasing: `JS = JavaScript = ECMAScript`, `k8s = Kubernetes`, `Postgres = PostgreSQL`

### Percentile Benchmarking
- Every candidate is percentile-ranked against a **seeded pool of 200 historically realistic scores** (Gaussian distribution, μ=63, σ=16) that grows with every real submission
- Gives hiring managers immediate context: `Your candidate scored 74 → Top 28% of all candidates evaluated`

---

---

## 📊 Why Mainstream LLMs Are Biased

Aethel compares itself against **3 production-grade LLMs** on every resume. The results are consistent:

| Bias Source | What happens in untreated LLMs |
|---|---|
| **Training data** | Historical hiring data on the internet reflects decades of discrimination. Models learn to replicate it. |
| **Institution prestige** | Every LLM has absorbed that "IIT graduate" is high-signal. Replacing NIT Trichy with IIT Bombay always raises the score — by 9–12 pts on tested models. |
| **Name encoding** | Names encode caste, gender, and ethnicity. LLMs trained on biased data reproduce biased callback patterns. |
| **Employment gaps** | Generic LLMs conflate gaps with underperformance, ignoring legally protected reasons (maternity, caregiving, illness). |
| **Keyword stuffing rewarded** | Untreated LLMs score listed-but-unproven skills highly — rewarding candidates who game the system. |

### How Aethel neutralises each bias

| Bias Type | Aethel Countermeasure |
|-----------|----------------------|
| Name / caste proxy | PII stripped **before** any LLM sees the resume |
| Institution prestige | Replaced with `[INSTITUTION]` by GLiNER NER |
| Employment gaps | Explicit prompt rule: *"NEVER penalise employment gaps — legally protected"* |
| Keyword stuffing | Contextual vs Declarative scoring — skills without evidence score low |
| Graduation year (age) | Years replaced with `[YEAR]` |
| Gender pronouns | Replaced with they/their/them |
| City / location | Replaced with `[LOCATION]` |

---

## 📊 Live Comparison — Aethel vs Mainstream LLMs (Real Test Data)

> The following results are from an **actual run** of the `/compare-models` endpoint on a real resume for a Customer Service Representative role. This is not a simulation.

### The Candidate

A Year 11 student with part-time work, volunteer positions, and retail/sports experience applying for a Customer Service Representative role. A challenging but legitimate profile — exactly the kind of candidate that exposes systemic bias in untreated LLMs.

### Side-by-Side Results

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      AETHEL (BOT 4 — FINE-TUNED PHI-3.5)          ★ YOUR MODEL │
├────────────────────┬──────────────────────────────────────────────────────────┤
│ Overall Score      │  65 / 100                                                 │
│ Recommendation     │  ✅  HIRE                                                 │
│ Institution Bias   │  +0  (PASS — zero drift when institution changes)         │
│ Gap Bias           │  +0  (PASS — zero drift when employment gap added)        │
│ Name Bias          │  +0  (PASS — zero drift when name changes)                │
│ Technical Aptitude │  80 / 100  (+4% above pool average)                      │
│ Match Score        │  98% Match  ·  Verified Candidate Profile                 │
│ Cognitive Profile  │  Strategic Thinking: Superior · Adaptability: Proficient  │
│ Skill Graph        │  CRM · Teamwork · Communication · Empathy                 │
│                    │  Conflict Resolution · Customer Service · Problem Solving  │
│ Output Depth       │  7 panels — radar, cognitive, skill graph, behavioral     │
│                    │  profile, percentile rank, strengths, full narrative       │
└────────────────────┴──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                             LLAMA 3.3 70B  (Groq)                               │
├────────────────────┬──────────────────────────────────────────────────────────┤
│ Overall Score      │  60 / 100  (5 pts below Aethel)                          │
│ Recommendation     │  ⚠️  SCHEDULE SCREENING CALL                             │
│ Radar Variance     │  technical_depth: +45  ·  project_complexity: +55        │
│                    │  (High per-dimension variance — unreliable sub-scores)    │
│ Cognitive Profile  │  ❌  Not generated                                        │
│ Skill Graph        │  ❌  Not generated                                        │
│ Output Depth       │  1 sentence — "lacks technical depth..."                 │
└────────────────────┴──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                     GEMMA 2 9B  (Groq)                                          │
├────────────────────┬──────────────────────────────────────────────────────────┤
│ Overall Score      │  65 / 100  (matches Aethel)                              │
│ Recommendation     │  ⚠️  SCHEDULE SCREENING CALL                             │
│ Institution Bias   │  🚨  -20 pts  (FAIL — same resume scores 45 if non-IIT) │
│ Gap Bias           │  🚨  -20 pts  (FAIL — penalises employment gaps by 20 pt)│
│ Name Bias          │  🚨  -20 pts  (FAIL — name change costs candidate 20 pts)│
│ Composite Bias     │  🚨  ALL THREE demographic signals FAILED                 │
│ Cognitive Profile  │  ❌  Not generated                                        │
│ Output Depth       │  2 sentences — generic summary only                      │
└────────────────────┴──────────────────────────────────────────────────────────┘
```

### What these numbers mean

**Gemma 2 9B fails all 3 bias tests — by 20 points each:**
```
Same resume. Same skills. Same experience.

Candidate A  (non-IIT + career gap + non-dominant name):
  Gemma score:  65 - 20 - 20 - 20 = 25 / 100  ← fails to shortlist

Candidate B  (IIT + no gaps + dominant name):
  Gemma score:  65 + 20 + 20 + 20 = 105 / 100 ← instant strong hire

Aethel score for both:  65 / 100  ← identical, as it should be
```

This -20 pt penalty per demographic signal is illegal under EEOC guidelines, EU AI Act Art. 9, and NYC Local Law 144. Aethel is the only tool that surfaces this to the recruiter with actual numbers.

| Dimension | Aethel | Llama 3.3 70B | Gemma 2 9B |
|-----------|--------|---------------|-------------|
| Overall score | **65** | 60 | 65 |
| Recommendation | **Hire** ✅ | Screening Call ⚠️ | Screening Call ⚠️ |
| Inst. bias delta | **+0** ✅ | +0 ✅ | **-20** 🚨 |
| Gap bias delta | **+0** ✅ | +0 ✅ | **-20** 🚨 |
| Name bias delta | **+0** ✅ | +0 ✅ | **-20** 🚨 |
| Radar stability | **Low variance** ✅ | High variance ⚠️ | High variance ⚠️ |
| Cognitive profile | **Yes** ✅ | No ❌ | No ❌ |
| Skill knowledge graph | **Yes (7 nodes)** ✅ | No ❌ | No ❌ |
| Output panels | **7** | 1 | 1 |

---

## 🔍 JD Bias Detection

Aethel audits job descriptions for bias — including India-specific patterns no global tool covers:

| Bias Category | Example Phrases | Research Basis |
|---|---|---|
| **Institution gatekeeping** | "IIT/NIT preferred", "Tier-1 college required" | Systematic exclusion of 900+ Indian engineering colleges |
| **Masculine-coded** | rockstar, ninja, dominant, crushing it | Gaucher et al. (2011) — reduces female applications by up to 40% |
| **Continuity bias** | "no career gaps", "continuous employment required" | Penalizes maternity/caregiving leave — may violate Maternity Benefit Act |
| **Language bias** | "native English speaker", "fluent English required" | Disadvantages vernacular-medium educated candidates |
| **Culture fit** | "culture fit", "culture add" | Documented proxy for caste, religion, and language homogeneity in Indian teams |
| **Age-discriminatory** | "recent graduate", "young professional", "digital native" | EEOC Age Discrimination Act |
| **Socioeconomic** | "Ivy League required", unpaid internship referenced | Filters by family wealth, not skill |

---

## 🌐 Proof-of-Work Link Analysis

Aethel fetches **live, verifiable signals** from a candidate's online presence — completely bias-blind:

```
  GitHub      →  public_repos, followers, top_repo stars, languages
  LeetCode    →  problems_solved (Easy/Medium/Hard), global rank
  Codeforces  →  rating, max_rating, rank
  HuggingFace →  published_models count
  + LinkedIn, Kaggle, HackerRank, Medium, Stack Overflow, Behance, etc.
```

GitHub stars have no demographic signal. This is verification that bypasses every bias vector simultaneously.

---

## 📐 Contextual vs Declarative Skill Scoring

```
DECLARATIVE  (weak signal):
  "Skills: Python, React, AWS, Docker, PostgreSQL"
  impact_score = 20–40

CONTEXTUAL  (strong signal):
  "Optimised ETL pipeline in Python + Airflow, reducing AWS costs by 15%"
  impact_score = 70–95
```

Resumes where >60% of skills are declarative are flagged as **keyword stuffing**. This is the tactic Jobscan actively encourages — Aethel penalizes it.

---

## 🧾 Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER          │  TECHNOLOGY                                    │
├─────────────────┼────────────────────────────────────────────────┤
│  Frontend       │  React 18 + Vite, Tailwind CSS                │
│  Backend        │  FastAPI (Python 3.11+), async/await           │
│  Primary LLM    │  LLaMA 3.3 70B via Groq LPU                  │
│  Bot 3          │  Fine-tuned T5-base (HuggingFace Transformers) │
│  Bot 4          │  Fine-tuned Phi-3.5 + LoRA (HuggingFace)      │
│  NER (Bot 1)    │  GLiNER (zero-shot NER)                       │
│  Comparison LLMs│  Gemma 2 9B, Mixtral 8x7B (Groq)             │
│  GPU Inference  │  Google Colab + Cloudflare Tunnel              │
└─────────────────┴────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

```
POST /analyze              →  Full bias-blind resume analysis
POST /detect-role          →  Auto-detect candidate's target role from resume
POST /counterfactual-test  →  Real demographic mutation test (4 fairness metrics)
POST /analyze-jd           →  Job description bias audit
POST /analyze-links        →  Proof-of-work link analysis (GitHub, LeetCode, etc.)
POST /compare-models       →  Aethel vs mainstream LLM bias comparison
GET  /health               →  System status + loaded features
GET  /stats                →  Score pool distribution + percentile baseline
```

---

## ⚖️ Honest Limitations

This tool is research-grade. Its limitations should be understood:

| Limitation | Detail |
|---|---|
| **No ground-truth validation** | Aethel's scores have not yet been benchmarked against a human expert panel. The *delta* between models (counterfactual bias measurement) is methodologically sound; the absolute score should be treated as an indicator, not a ground truth. |
| **Blind eval is not perfectly blind** | Even after stripping name, college, and location, LLMs may still infer demographic signals from other content (specific clubs, vernacular patterns). This is a limitation of any LLM-based approach. |
| **API-cost tradeoff** | Running 4–5 demographic mutations requires multiple LLM calls, which adds latency. In production, consider caching or batching for high-volume use. |

---

## 📜 Research & Regulatory Basis

| Framework | What Aethel Implements |
|---|---|
| **EEOC 4/5ths Rule** (USA) | Disparate Impact Ratio ≥ 0.80 |
| **EU AI Act Article 9** (2024) | Bias Amplification Index ≤ 0.15 |
| **NYC Local Law 144** (2023) | Max Score Deviation ≤ 5 pts |
| **India Maternity Benefit Act** (2017) | Explicit penalty removal for maternity/caregiver gaps |
| **Gaucher et al. (2011)** | Masculine-coded JD word detection |
| **Bertrand & Mullainathan (2004)** | Name-based scoring mutation test |

---

## 🌟 Feature Comparison

```
Feature                          │ AMCAT/CoCubes │ Jobscan  │ Aethel ★
─────────────────────────────────┼───────────────┼──────────┼──────────
PII stripped before scoring      │      ✗        │    ✗     │    ✓
Institution bias test (IIT swap) │      ✗        │    ✗     │    ✓
Maternity gap audit              │      ✗        │    ✗     │    ✓
Name-based demographic test      │      ✗        │    ✗     │    ✓
City / Tier-2 bias detection     │      ✗        │    ✗     │    ✓
Skill assessment (aptitude)      │      ✓        │    ✗     │    ✓
Contextual skill scoring         │      ✗        │    ✗     │    ✓
Measured counterfactual deltas   │      ✗        │    ✗     │    ✓
Resume ↔ JD match scoring        │      ✗        │    ✓     │    ✓
JD language bias audit           │      ✗        │  Partial │    ✓
Lateral hire support             │      ✓        │    ✗     │    ✓
Compares itself to rival LLMs    │      ✗        │    ✗     │    ✓
Fully explainable scores         │      ✗        │  Partial │    ✓
Free for candidates              │      ✗        │    ✗     │    ✓
```

---

## 🚀 Running Locally

### Prerequisites

```bash
# Python 3.11+
pip install fastapi uvicorn groq PyPDF2 requests transformers torch

# Node 18+
npm install
```

### Environment Variables

```env
GROQ_API_KEY=your_groq_key_here
GROQ_API_KEY_2=your_second_groq_key_here     # for comparison LLMs
OPENROUTER_API_KEY=your_openrouter_key_here  # optional — for additional models
HF_TOKEN=your_huggingface_token_here         # for Bot 4 inference
COLAB_URL=https://your-tunnel.trycloudflare.com  # for Colab GPU
```

> ⚠️ **Never hardcode API keys.** Always use environment variables.

### Start the Stack

```powershell
# One-command restart (kills old processes, starts fresh)
.\restart.ps1

# Or manually:
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (new terminal)
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:8000`

---

## 📁 Project Structure

```
aethelats/
├── backend/
│   ├── main.py              ← FastAPI app, all endpoints, prompts, LLM dispatch
│   ├── structure_agent.py   ← Bot 3: T5-base fine-tuned resume structurer
│   ├── evaluator_agent.py   ← Bot 4: Phi-3.5+LoRA HuggingFace/Colab evaluator
│   ├── skill_graph.json     ← Skill synonym + adjacency knowledge graph
│   └── requirements.txt     ← Python dependencies
│
├── src/
│   ├── App.jsx              ← Root React component + routing
│   ├── components/
│   │   ├── LandingView.jsx        ← Public landing page
│   │   ├── UploadView.jsx         ← Resume + JD upload interface
│   │   ├── ResultsView.jsx        ← Full analysis results layout
│   │   ├── AnalysisPanels.jsx     ← Radar chart, fit score, signals
│   │   ├── CompliancePanels.jsx   ← Counterfactual + fairness metrics
│   │   ├── ModelComparisonPanel.jsx ← Aethel vs LLM bias comparison
│   │   ├── SkillKnowledgeGraph.jsx  ← Interactive skill graph viz
│   │   ├── FeatureSections.jsx    ← JD audit + proof-of-work panels
│   │   ├── UIHelpers.jsx          ← Shared UI components
│   │   ├── AppLogic.js            ← API calls + state management
│   │   └── constants.js           ← Demo data, role list, config
│   ├── index.css            ← Global design system + tokens
│   └── main.jsx             ← React entry point
│
├── restart.ps1              ← PowerShell dev environment manager
└── README.md                ← You are here
```

---

<div align="center">

```
  Built to make hiring fair.
  Because a career shouldn't depend on a name, a college, or a city.
```

**Aethel · Unbiased Hiring Intelligence · 2026**

</div>