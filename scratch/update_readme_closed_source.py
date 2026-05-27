import re

def update_readme():
    with open("README.md", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove Emojis
    emojis_to_remove = ["🚀 ", "📊 ", "🏗️ ", "✨ "]
    for e in emojis_to_remove:
        content = content.replace(e, "")

    # 2. Remove Quick Start Section completely
    # The quick start section is between "## Quick Start (Local Setup)" and "## The Science & Research"
    start_str = "## Quick Start (Local Setup)"
    end_str = "## The Science & Research (Deep Dive)"
    if start_str in content and end_str in content:
        before = content.split(start_str)[0]
        after = content.split(end_str)[1]
        content = before + "## The Science & Research (Deep Dive)" + after
        
    # Remove Quick Start from TOC
    content = re.sub(r"- \[Quick Start \(Local Setup\)\].*\n", "", content)

    # 3. Rewrite The Aethel Platform section
    # Find the block from "## The Aethel Platform" to the start of "## The Science"
    platform_start = "## The Aethel Platform"
    platform_end = "## The Science & Research"
    
    if platform_start in content and platform_end in content:
        before_plat = content.split(platform_start)[0]
        after_plat = content.split(platform_end)[1]
        
        new_platform_section = """## The Aethel Platform

Aethel is a complete, two-sided hiring platform built to replace biased legacy ATS workflows. 

### 1. The Recruiter Workspace (Kanban ATS)
<p align="center">
  <img src="docs/kanban-dashboard.png" width="100%" />
</p>

We built a drag-and-drop pipeline management system that actually surfaces candidate skills instead of burying them in PDFs.
- **Candidate DNA Spark-Cards**: A 5-bar skill fingerprint on every card. See exactly where a candidate spikes before you even click their profile.
- **Pipeline Velocity**: Built-in time-in-stage metrics. If a candidate sits for 5+ days, they get an amber warning ring so nobody falls through the cracks.
- **Batch Cohorts**: Filter the entire board to a specific cohort using the color-coded legend. 
- **Rejection Intelligence**: Aethel automatically reads the "Rejected" column and tells you exactly which skills your pipeline is missing, so you can fix your job descriptions.

**Batch Processing & Ranking**
<p align="center">
  <img src="docs/batch-mode.png" width="100%" />
</p>
Stop reading resumes one by one. Drop a cohort of 50 resumes into Aethel. It extracts the text, strips the PII, scores them blindly against your specific job description, and ranks them by `fit_score`. The top candidates bubble up instantly.

**Multi-Model Bias Auditing**
<p align="center">
  <img src="docs/bias-dashboard.png" width="100%" />
</p>
Aethel doesn't just score candidates; it actively audits *other* LLMs. The Bias Dashboard runs the exact same resume through GPT-4, Claude 3, and Llama 3 side-by-side. It exposes exactly how much those generic models penalize your candidates for career gaps or regional colleges compared to Aethel's fair baseline.

### 2. The Candidate Workspace (Empowerment & Transparency)
We believe candidates deserve to know exactly how they are evaluated. 

- **Score Transparency**: Candidates get full access to see their own `fit_score` and the exact skills Aethel extracted from their resume.
- **Bias Report**: Candidates can see if they triggered any bias proxy flags (e.g., career gaps, location markers) and see how Aethel's Counterfactual Engine neutralized that penalty.
- **AI Coach (Coming Soon)**: An interactive chatbot that acts as a personal career strategist. It analyzes the specific gaps between the candidate's resume and target job descriptions, providing actionable, tailored coaching to strengthen their profile.

### Enterprise Security & Access
<p align="center">
  <img src="docs/recruiter-verification.png" width="500" />
</p>

- **Role-Based Routing**: Strict separation between Candidate and Recruiter views.
- **Verification Gate**: Premium enterprise features (like Batch Mode and the Bias Dashboard) are strictly locked behind a work-email and LinkedIn verification system.

"""
        
        content = before_plat + new_platform_section + "## The Science & Research" + after_plat

    with open("README.md", "w", encoding="utf-8") as f:
        f.write(content)

    print("README closed-source update complete.")

if __name__ == "__main__":
    update_readme()
