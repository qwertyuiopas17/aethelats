# JWT Secret Configuration Guide

## 🎯 Quick Check: Is Your JWT Secret Working?

### Option 1: Check Your Deployed HF Space

Visit your health endpoint:
```
https://your-space-name.hf.space/health
```

Look for the `security` section in the JSON response:
```json
{
  "security": {
    "jwt_configured": true,
    "jwt_secure": true,
    "jwt_using_default": false,  // ✅ Should be FALSE
    "jwt_secret_length": 64,     // ✅ Should be 32+
    "jwt_expiry_days": 7
  }
}
```

**✅ Good:** `jwt_using_default: false` and `jwt_secret_length >= 32`  
**❌ Bad:** `jwt_using_default: true` (anyone can forge tokens!)

---

### Option 2: Use the Test Script

```bash
# Check your deployed API
python test_jwt_secret.py https://your-space-name.hf.space

# Generate a new secure secret
python test_jwt_secret.py --generate
```

---

## 🔧 How to Set JWT_SECRET in HuggingFace Spaces

### Step 1: Generate a Secure Secret

Run this command to generate a cryptographically secure 64-character secret:

```bash
python test_jwt_secret.py --generate
```

Or use this Python one-liner:
```python
python -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*()-_=+') for _ in range(64)))"
```

### Step 2: Add to HuggingFace Spaces

1. Go to your Space: `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE`
2. Click **Settings** (gear icon)
3. Scroll to **Repository secrets**
4. Click **New secret**
5. Enter:
   - **Name:** `JWT_SECRET`
   - **Value:** (paste your generated secret)
6. Click **Add secret**
7. **Restart your Space** (it will rebuild automatically)

### Step 3: Verify It's Working

Wait 2-3 minutes for the Space to rebuild, then check:

```bash
curl https://your-space-name.hf.space/health | jq '.security'
```

You should see:
```json
{
  "jwt_configured": true,
  "jwt_secure": true,
  "jwt_using_default": false,  // ✅ This should be false!
  "jwt_secret_length": 64
}
```

---

## 🚨 Common Issues

### Issue 1: "jwt_using_default: true"

**Problem:** Your JWT_SECRET environment variable is not being read.

**Solutions:**
1. Check the secret name is exactly `JWT_SECRET` (case-sensitive)
2. Restart your Space after adding the secret
3. Check HF Spaces logs for any errors

### Issue 2: "jwt_secret_length: 0"

**Problem:** The secret is empty or not set.

**Solutions:**
1. Make sure you clicked "Add secret" after pasting the value
2. Verify the secret appears in the "Repository secrets" list
3. Try deleting and re-adding the secret

### Issue 3: Tokens Still Invalid After Setting Secret

**Problem:** Old tokens were signed with the old secret.

**Solution:** All users need to log out and log back in to get new tokens signed with the new secret.

---

## 🔐 Security Best Practices

### ✅ DO:
- Use a secret that's at least 32 characters long
- Use a mix of letters, numbers, and special characters
- Generate secrets using cryptographically secure methods
- Keep secrets in environment variables (never in code)
- Rotate secrets periodically (every 90 days)

### ❌ DON'T:
- Use the default secret in production
- Share secrets in chat, email, or version control
- Use simple passwords like "password123"
- Reuse secrets across different applications
- Store secrets in frontend code

---

## 📊 What Happens If JWT_SECRET Is Compromised?

If someone gets your JWT_SECRET, they can:
1. **Forge authentication tokens** for any user
2. **Impersonate recruiters** and access candidate data
3. **Bypass all authentication** checks
4. **Access admin endpoints** if role-based checks exist

**Immediate Actions:**
1. Generate a new secret immediately
2. Update JWT_SECRET in HF Spaces
3. Force all users to log out (tokens become invalid)
4. Review access logs for suspicious activity
5. Notify affected users if data was accessed

---

## 🧪 Testing Your JWT Configuration

### Test 1: Register a New User

```bash
curl -X POST https://your-space.hf.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "role": "candidate"
  }'
```

### Test 2: Login and Get Token

```bash
curl -X POST https://your-space.hf.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Save the `access_token` from the response.

### Test 3: Use Token to Access Protected Endpoint

```bash
curl https://your-space.hf.space/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

If you get user data back, your JWT is working correctly! ✅

---

## 📝 Environment Variables Checklist

Make sure these are set in HuggingFace Spaces:

- [ ] `JWT_SECRET` - Your secure JWT signing secret (64+ chars)
- [ ] `JWT_EXP_DAYS` - Token expiry in days (optional, default: 7)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `RESEND_API_KEY` - For email verification
- [ ] `GROQ_PRIMARY_KEY_1` - For AI processing

---

## 🆘 Still Having Issues?

1. Check HuggingFace Spaces logs:
   - Go to your Space
   - Click "Logs" tab
   - Look for `[Auth]` messages

2. Run the test script:
   ```bash
   python test_jwt_secret.py https://your-space.hf.space
   ```

3. Check the health endpoint manually:
   ```bash
   curl https://your-space.hf.space/health | jq
   ```

4. If all else fails, delete and recreate the JWT_SECRET:
   - Delete the old secret in HF Spaces settings
   - Generate a new one with `python test_jwt_secret.py --generate`
   - Add it back
   - Restart the Space

---

**Last Updated:** May 28, 2026  
**Maintained By:** Aethel Security Team
