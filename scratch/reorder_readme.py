import re
import os

def parse_readme():
    with open("README.md", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Split by H2 (## )
    parts = re.split(r'\n(?=## )', content)
    
    header_block = parts[0] # The ascii art, badges, etc
    
    blocks = {}
    for part in parts[1:]:
        match = re.match(r'##\s+([^\n]+)', part)
        if match:
            title = match.group(1).strip()
            blocks[title] = part
    
    # Categorize blocks
    platform_block = blocks.get('The Aethel Platform', '')
    what_is_block = blocks.get('What is Aethel?', '')
    
    architecture_titles = [
        'System Architecture — The 4-Bot Pipeline',
        'Model Architecture — Deep Dive',
        'Tech Stack',
        'Deployment Architecture',
        'Project Structure'
    ]
    
    # Everything else goes into Science/Other, except things we specifically want to move
    science_titles = [k for k in blocks.keys() if k not in architecture_titles and k not in ['The Aethel Platform', 'What is Aethel?']]
    
    # Reassemble
    new_content = []
    
    # 1. Intro
    new_content.append(header_block)
    
    # 2. What is Aethel
    new_content.append("\n" + what_is_block)
    
    # 3. Platform (Features)
    if platform_block:
        new_content.append("\n" + platform_block)
        
    # 4. Quick Start
    quick_start = """
## 🚀 Quick Start (Local Setup)

Aethel is built as a split-stack application (React frontend, FastAPI backend).

### Prerequisites
- Python 3.11+
- Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/qwertyuiopas17/aethelats.git
cd aethelats

# 2. Start the Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python main.py

# 3. Start the Frontend
cd ../frontend
npm install
npm run dev
```
"""
    new_content.append(quick_start)
    
    # 5. The Science (Wrap massive tables in details)
    new_content.append("\n## 📊 The Science & Research (Deep Dive)\n\nAethel is built on rigorous academic research and empirical data. Read below to understand the exact bias vectors we neutralize.\n")
    
    for title in science_titles:
        block = blocks[title]
        # We will wrap the block in details to make it skimmable, OR just wrap the tables
        # Actually, wrapping the whole section in <details> makes it super clean.
        
        # Format title for summary tag
        clean_title = title.replace("—", "-").replace("—", "-")
        
        wrapped_block = f"""
<details>
<summary><b>{clean_title}</b></summary>
<br>

{block.replace(f"## {title}", "").strip()}

</details>
<br>
"""
        new_content.append(wrapped_block)
        
    # 6. Architecture
    new_content.append("\n## 🏗️ Architecture & Engineering\n")
    for title in architecture_titles:
        if title in blocks:
            # We don't wrap architecture, devs want to read this
            new_content.append("\n" + blocks[title])
            
    # Generate TOC
    final_text = "".join(new_content)
    
    # Simple TOC generation based on the new major H2 headers
    toc = """
## Table of Contents
- [What is Aethel?](#what-is-aethel)
- [The Aethel Platform](#the-aethel-platform)
- [🚀 Quick Start (Local Setup)](#-quick-start-local-setup)
- [📊 The Science & Research](#-the-science--research-deep-dive)
- [🏗️ Architecture & Engineering](#%EF%B8%8F-architecture--engineering)
"""
    # Insert TOC after What is Aethel
    # Find position to insert
    what_is_aethel_str = "## What is Aethel?"
    if what_is_aethel_str in final_text:
        # insert after the block ends (before next ##)
        parts = final_text.split("## The Aethel Platform")
        final_text = parts[0] + toc + "\n\n## The Aethel Platform" + parts[1]
        
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(final_text)

    print("README restructuring complete.")

if __name__ == "__main__":
    parse_readme()
