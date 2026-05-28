# 🚀 Deploy JWT Verification to HuggingFace Space

## Current Status

Your Space is running: ✅ `https://unded-17-aethel-backend-v3.hf.space`

But it's running **old code** without the JWT verification tools.

---

## 📋 Deployment Steps

### Step 1: Commit the Changes

```bash
# Navigate to your project directory
cd /path/to/your/project

# Add the modified files
git add backend/auth.py
git add backend/main.py
git add test_jwt_secret.py
git add JWT_SECRET_SETUP.md
git add QUICK_JWT_CHECK.md
git add DEPLOY_JWT_FIX.md
git add SECURITY_ANALYSIS.md

# Commit
git commit -m "feat: Add JWT secret verification and health check security status"

# Push to HuggingFace
git push
```

### Step 2: Wait for Rebuild

- Go to: https://huggingface.co/spaces/Unded-17/aethel-backend-v3
- You'll see "Building..." status
- Wait 2-3 minutes for the rebuild to complete

### Step 3: Verify the Update

Once rebuilt, check if the new endpoint is working:

```bash
curl https://unded-17-aethel-backend-v3.hf.space/health | jq '.security'
```

You should see:
```json
{
  "jwt_configured": true,
  "jwt_secure": true,
  "jwt_using_default": false,
  "jwt_secret_length": 64,
  "jwt_expiry_days": 7
}
```

### Step 4: Interpret the Results

| Field | Expected | What It Means |
|-------|----------|---------------|
| `jwt_configured` | `true` | JWT_SECRET env var is set |
| `jwt_secure` | `true` | Secret is strong (32+ chars, not default) |
| `jwt_using_default` | `false` | NOT using insecure default |
| `jwt_secret_length` | `32+` | Secret is long enough |

---

## ⚠️ If You See Problems After Deploy

### Problem: `jwt_using_default: true`

**This means:** Your JWT_SECRET is not set in HuggingFace Spaces secrets.

**Fix:**

1. Generate a secure secret:
   ```bash
   python test_jwt_secret.py --generate
   ```

2. Copy the output (64-character string)

3. Go to: https://huggingface.co/spaces/Unded-17/aethel-backend-v3/settings

4. Scroll to **Repository secrets**

5. Click **New secret**

6. Enter:
   - Name: `JWT_SECRET`
   - Value: (paste the 64-char secret)

7. Click **Add secret**

8. **Restart your Space** (it will rebuild automatically)

9. Wait 2-3 minutes and check again

### Problem: `jwt_secret_length: 0` or very short

**This means:** The secret exists but is empty or too short.

**Fix:** Delete the old secret and add a new one following the steps above.

---

## 🧪 Testing After Deployment

### Test 1: Health Check
```bash
curl https://unded-17-aethel-backend-v3.hf.space/health
```

### Test 2: Register a Test User
```bash
curl -X POST https://unded-17-aethel-backend-v3.hf.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "role": "candidate"
  }'
```

### Test 3: Login
```bash
curl -X POST https://unded-17-aethel-backend-v3.hf.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

If you get a token back, your JWT is working! ✅

---

## 📊 Current Space Info

- **Space URL:** https://huggingface.co/spaces/Unded-17/aethel-backend-v3
- **API URL:** https://unded-17-aethel-backend-v3.hf.space
- **Health Endpoint:** https://unded-17-aethel-backend-v3.hf.space/health
- **Docs:** https://unded-17-aethel-backend-v3.hf.space/docs

---

## ✅ Success Checklist

After deploying, verify:

- [ ] Space rebuilt successfully (no errors in logs)
- [ ] `/health` endpoint returns `security` section
- [ ] `jwt_using_default` is `false`
- [ ] `jwt_secure` is `true`
- [ ] `jwt_secret_length` is 32 or higher
- [ ] Can register a new user
- [ ] Can login and receive a token
- [ ] Token works for authenticated endpoints

---

## 🆘 Troubleshooting

### Space Won't Build

Check the logs:
1. Go to https://huggingface.co/spaces/Unded-17/aethel-backend-v3
2. Click **Logs** tab
3. Look for Python errors

### Can't Push to HuggingFace

Make sure you have the remote configured:
```bash
git remote -v
```

Should show:
```
origin  https://huggingface.co/spaces/Unded-17/aethel-backend-v3 (fetch)
origin  https://huggingface.co/spaces/Unded-17/aethel-backend-v3 (push)
```

If not, add it:
```bash
git remote add origin https://huggingface.co/spaces/Unded-17/aethel-backend-v3
```

### Authentication Failed When Pushing

You need a HuggingFace token:
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "write" access
3. Use it as your password when pushing

---

**Need Help?** Check the full guide in `JWT_SECRET_SETUP.md`
