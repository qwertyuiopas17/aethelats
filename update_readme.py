import re
import sys

try:
    import emoji
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "emoji"])
    import emoji

def update_readme():
    with open("README.md", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Remove all emojis
    content_no_emojis = emoji.replace_emoji(content, replace="")
    
    # Clean up extra spaces left behind by emoji removal (e.g. "  " -> " ")
    # specifically at the start of headers where an emoji might have been: "##  Title" -> "## Title"
    content_no_emojis = re.sub(r"##\s+", "## ", content_no_emojis)
    content_no_emojis = re.sub(r"###\s+", "### ", content_no_emojis)

    # 2. Add the new section
    new_section = """

## The Aethel Platform (Enterprise ATS)

Aethel has evolved from a single-resume auditor into a **full two-sided platform** designed for enterprise recruitment workflows.

![Dual Dashboards](docs/dual-dashboards-screenshot.png)

### 1. Dual Dashboard System & Authentication
- **Email OTP System**: Secure, passwordless login system.
- **Role-Based Access**: 
  - *Candidate Dashboard*: Focused on personal resume auditing, skill understanding, and score transparency.
  - *Recruiter Dashboard*: Focused on pipeline management, cohort processing, and systemic bias analytics.

### 2. Recruiter Verification Gate
To unlock premium enterprise features, users must verify their identity using a **work email address** and (optionally) their LinkedIn profile. This ensures powerful batch and bias analytics are restricted to actual hiring managers.

### 3. Batch Cohort Processing & Ranking
![Batch Cohort Mode](docs/batch-cohort-screenshot.png)
- **Batch Upload**: Recruiters can upload an entire cohort of resumes (ZIP or multi-file) simultaneously.
- **Smart Candidate Ranking**: Aethel processes the batch and ranks candidates dynamically based on their contextual `fit_score` and skill matches against the target role.

### 4. The Recruiter Workspace (Kanban ATS)
![Recruiter Kanban Board](docs/kanban-screenshot.png)

A fully functional, drag-and-drop pipeline management system built around the AI evaluation engine:
- **Candidate DNA Spark-Cards**: Visual, 5-bar skill fingerprints on every card showing real per-skill scores.
- **Pipeline Velocity Clock**: Time-in-stage metrics tracking how long candidates have been in the pipeline, with automatic alerts for "stale" candidates (5+ days).
- **Batch Cohort Strips**: Clickable cohort legends that allow recruiters to instantly filter the entire 5-stage pipeline to a specific batch of applicants.
- **Rejection Intelligence**: Aggregate pattern analysis on the "Rejected" column, tallying the most common missing skills across rejected candidates to help refine job descriptions.
- **Private Notes System**: Persistent, database-backed note-taking directly on the candidate cards.

"""
    
    # Find insertion point: After "What Aethel Does" section or before "Why India-Specific Bias Vectors Matter"
    # Let's insert it before "Why India-Specific Bias Vectors Matter"
    insert_marker = "## Why India-Specific Bias Vectors Matter"
    
    if insert_marker in content_no_emojis:
        content_no_emojis = content_no_emojis.replace(insert_marker, new_section + "\n" + insert_marker)
    else:
        # Append if marker not found
        content_no_emojis += new_section

    with open("README.md", "w", encoding="utf-8") as f:
        f.write(content_no_emojis)
        
    print("README updated successfully.")

if __name__ == "__main__":
    update_readme()
