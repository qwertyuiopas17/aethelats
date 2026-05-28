#!/usr/bin/env python3
"""
Quick JWT Secret Verification Script
=====================================
Run this to check if your JWT_SECRET environment variable is properly configured.

Usage:
    python test_jwt_secret.py

Or test your deployed HF Space:
    python test_jwt_secret.py https://your-space-url.hf.space
"""
import os
import sys
import requests


def check_local_env():
    """Check JWT_SECRET in local environment."""
    print("=" * 60)
    print("🔐 LOCAL ENVIRONMENT CHECK")
    print("=" * 60)
    
    jwt_secret = os.environ.get("JWT_SECRET", "")
    
    if not jwt_secret:
        print("❌ JWT_SECRET is NOT set in environment")
        print("   Set it with: export JWT_SECRET='your-secret-here'")
        return False
    
    if jwt_secret == "aethel-dev-secret-change-in-production":
        print("⚠️  JWT_SECRET is using the INSECURE default value")
        print("   Change it immediately in production!")
        return False
    
    secret_length = len(jwt_secret)
    print(f"✅ JWT_SECRET is set")
    print(f"   Length: {secret_length} characters")
    
    if secret_length < 32:
        print(f"⚠️  Secret is too short (recommended: 32+ characters)")
        return False
    
    print(f"✅ Secret length is secure ({secret_length} chars)")
    
    # Mask the secret for display
    masked = f"{jwt_secret[:4]}...{jwt_secret[-4:]}" if len(jwt_secret) > 8 else "***"
    print(f"   Value: {masked}")
    
    return True


def check_deployed_api(base_url):
    """Check JWT configuration on deployed API."""
    print("\n" + "=" * 60)
    print(f"🌐 DEPLOYED API CHECK: {base_url}")
    print("=" * 60)
    
    health_url = f"{base_url.rstrip('/')}/health"
    
    try:
        print(f"Fetching: {health_url}")
        response = requests.get(health_url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        security = data.get("security", {})
        
        print("\n📊 Security Status:")
        print(f"   JWT Configured: {'✅' if security.get('jwt_configured') else '❌'}")
        print(f"   JWT Secure: {'✅' if security.get('jwt_secure') else '❌'}")
        print(f"   Using Default: {'⚠️ YES' if security.get('jwt_using_default') else '✅ NO'}")
        print(f"   Secret Length: {security.get('jwt_secret_length', 0)} characters")
        print(f"   Token Expiry: {security.get('jwt_expiry_days', 7)} days")
        
        if security.get('jwt_using_default'):
            print("\n❌ CRITICAL: Your deployed app is using the default JWT secret!")
            print("   Anyone can forge authentication tokens!")
            print("   Fix: Set JWT_SECRET in HuggingFace Spaces secrets")
            return False
        
        if not security.get('jwt_secure'):
            print("\n⚠️  WARNING: JWT secret may be too short or misconfigured")
            return False
        
        print("\n✅ Deployed API has secure JWT configuration!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Failed to connect to API: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error checking API: {e}")
        return False


def generate_secure_secret():
    """Generate a cryptographically secure JWT secret."""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+[]{}|;:,.<>?"
    secret = ''.join(secrets.choice(alphabet) for _ in range(64))
    
    print("\n" + "=" * 60)
    print("🔑 GENERATED SECURE JWT SECRET")
    print("=" * 60)
    print("\nCopy this secret to your HuggingFace Spaces secrets:")
    print(f"\n{secret}\n")
    print("Steps:")
    print("1. Go to your HF Space settings")
    print("2. Click 'Repository secrets'")
    print("3. Add new secret: JWT_SECRET")
    print("4. Paste the value above")
    print("5. Restart your Space")
    print("=" * 60)


def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "--generate":
            generate_secure_secret()
            return
        
        # Check deployed API
        api_url = sys.argv[1]
        check_deployed_api(api_url)
    else:
        # Check local environment
        is_secure = check_local_env()
        
        print("\n" + "=" * 60)
        if is_secure:
            print("✅ LOCAL ENVIRONMENT IS SECURE")
        else:
            print("❌ LOCAL ENVIRONMENT NEEDS ATTENTION")
            print("\nGenerate a secure secret with:")
            print("   python test_jwt_secret.py --generate")
        print("=" * 60)


if __name__ == "__main__":
    main()
