# 🔐 Quick JWT Secret Check

## Is Your JWT Secret Working? (30 seconds)

### Method 1: Visit Your Health Endpoint

Open this URL in your browser:
```
https://YOUR-SPACE-NAME.hf.space/health
```

Look for this section:
```json
"security": {
  "jwt_using_default": false,  // ✅ Should be FALSE
  "jwt_secure": true,          // ✅ Should be TRUE
  "jwt_secret_length": 64      // ✅ Should be 32+
}
```

### Method 2: Run the Test Script

```bash
python test_jwt_secret.py https://YOUR-SPACE-NAME.hf.space
```

---

## ✅ If Everything is Good:

You'll see:
- `jwt_using_default: false`
- `jwt_secure: true`
- `jwt_secret_length: 64` (or higher)

**You're all set!** Your JWT secret is properly configured.

---

## ❌ If You See Problems:

### Problem: `jwt_using_default: true`

**This means:** Your JWT_SECRET environment variable is NOT being read by HuggingFace Spaces.

**Fix:**
1. Go to your HF Space settings
2. Check "Repository secrets"
3. Make sure `JWT_SECRET` exists (exact name, case-sensitive)
4. If it doesn't exist, add it:
   ```bash
   python test_jwt_secret.py --generate
   ```
5. Copy the generated secret
6. Add as new secret in HF Spaces
7. Restart your Space

### Problem: `jwt_secret_length: 0` or very short

**This means:** The secret is empty or too weak.

**Fix:**
1. Generate a new secure secret:
   ```bash
   python test_jwt_secret.py --generate
   ```
2. Update JWT_SECRET in HF Spaces
3. Restart your Space

---

## 🚀 Quick Setup (If Not Set Yet)

```bash
# 1. Generate a secure secret
python test_jwt_secret.py --generate

# 2. Copy the output

# 3. Add to HuggingFace Spaces:
#    Settings → Repository secrets → New secret
#    Name: JWT_SECRET
#    Value: (paste the generated secret)

# 4. Restart your Space

# 5. Verify (wait 2-3 minutes for rebuild):
python test_jwt_secret.py https://YOUR-SPACE-NAME.hf.space
```

---

## 🔍 What Each Status Means

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| `jwt_configured: true` | Secret is set | ✅ Good |
| `jwt_configured: false` | No secret found | ❌ Add JWT_SECRET |
| `jwt_using_default: false` | Using custom secret | ✅ Good |
| `jwt_using_default: true` | Using insecure default | ❌ Set JWT_SECRET |
| `jwt_secure: true` | Secret is strong | ✅ Good |
| `jwt_secure: false` | Secret is weak/default | ❌ Generate new secret |
| `jwt_secret_length: 64` | Good length | ✅ Good |
| `jwt_secret_length: 0-31` | Too short | ❌ Generate longer secret |

---

## 📞 Need Help?

See the full guide: `JWT_SECRET_SETUP.md`

Or check the security analysis: `SECURITY_ANALYSIS.md`
