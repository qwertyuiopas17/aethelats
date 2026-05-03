# 1. Save all your current changes
git add .
git commit -m "Deploy backend to HF Spaces"

# 2. Push to GitHub (This will automatically update your Vercel frontend)
git push origin main

# 3. Add Hugging Face as your second remote
git remote add space https://huggingface.co/spaces/Unded-17/aethel-backend

# 4. Push to Hugging Face (This will build your backend)
git push space main
