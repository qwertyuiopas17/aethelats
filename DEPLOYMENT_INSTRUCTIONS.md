# Deployment Instructions for Bot 3 Degree Fix

## What Was Fixed

The Modal Bot 3 (Qwen 2.5) was hallucinating "Master" degree for ongoing/pursuing Bachelor's degrees. I've added degree mapping instructions to the prompt to fix this.

## Files Modified

1. **backend/modal_bot3.py** - Added degree mapping instructions to the Qwen prompt

## Deployment Steps

### Step 1: Deploy Modal Bot 3 (REQUIRED)

```bash
cd C:\Users\gtrip\OneDrive\Desktop\current
modal deploy backend/modal_bot3.py
```

This will:
- Rebuild the Modal container with the updated prompt
- Deploy to your Modal.com account
- The URL will remain the same (already configured in your HF Space)

**Expected output:**
```
✓ Created objects.
├── 🔨 Created mount /C:/Users/gtrip/OneDrive/Desktop/current/backend/modal_bot3.py
├── 🔨 Created Bot3Structurer => https://madhulikadasgupta16--aethel-bot3-structurer-bot3structur-1a83a0.modal.run
└── 🔨 Created function Bot3Structurer.structure.
✓ App deployed! 🎉
```

### Step 2: Test the Fix

After deployment, scan your resume again. The logs should now show:

```
[Bot3] Modal highest_degree: Bachelor  ← FIXED!
```

Instead of:

```
[Bot3] Modal highest_degree: Master  ← WRONG
```

### Step 3: Backend Changes (Already Done Locally)

The following backend fixes are already applied in your local files but NOT deployed to HuggingFace yet:

**backend/main.py:**
- Added degree mapping to Groq fallback prompt
- Fixed GitHub fork thresholds (10→5, 3→1)
- Moved is_tutorial detection before lazy commit check
- Added Adzuna cron logging
- Added RAG health logging

**backend/structure_agent.py:**
- Tightened Master regex (requires dots)
- Added Indian degrees (m.tech, bca, mca, b.sc)
- Added Bot 3 Modal output logging

**To deploy these to HuggingFace Spaces:**
```bash
python backend/deploy_hf.py <YOUR_HF_TOKEN>
```

### Step 4: Frontend Changes (Already Deployed)

✅ Frontend changes were already committed and pushed to GitHub:
- Removed `isCandidate` gating from bias test buttons
- Candidates can now run bias stability and model comparison tests

## Expected Score Change

After all fixes are deployed:
- **Before:** 62/100 (with hallucinated Master degree = +15 edu bonus)
- **After:** ~60/100 (with correct Bachelor degree = +10 edu bonus)

The 2-point drop is **correct behavior** — the previous score was inflated by the hallucinated degree.

## Verification Checklist

- [ ] Modal bot3 redeployed
- [ ] Resume scan shows "Bachelor" instead of "Master"
- [ ] Score drops by ~2 points (expected)
- [ ] Backend deployed to HF Spaces (optional, for other fixes)
- [ ] Frontend already deployed via Vercel ✅

## Notes

- The Modal deployment is **instant** (no cold start) because the container is already warm
- The HF Space backend deployment takes ~5-10 minutes
- The frontend is already live on Vercel
