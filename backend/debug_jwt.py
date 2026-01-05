"""
Simple direct JWT test to debug the issue
"""
import sys
import requests
import json

# Test JWT creation and validation
print("=" * 80)
print("JWT TOKEN DEBUG TEST")
print("=" * 80)

BASE_URL = "http://localhost:8001"

# Step 1: Register
print("\n1. Registering user...")
register_data = {
    "email": "jwttest@example.com",
    "password": "TestPassword123!",
    "first_name": "JWT",
    "last_name": "Test",
    "phone": "+77771234567"
}

try:
    resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data, timeout=5)
    print(f"   Status: {resp.status_code}")
    if resp.status_code not in [200, 201, 422]:
        print(f"   Error: {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"   Error: {e}")

# Step 2: Login
print("\n2. Logging in...")
login_data = {
    "email": "jwttest@example.com",
    "password": "TestPassword123!"
}

try:
    resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data, timeout=5)
    print(f"   Status: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"   Error: {resp.text}")
        sys.exit(1)
        
    data = resp.json()
    token = data.get("access_token")
    print(f"   Token received: YES")
    print(f"   Token (first 100 chars): {token[:100]}")
    
except Exception as e:
    print(f"   Error: {e}")
    sys.exit(1)

# Step 3: Decode token manually
print("\n3. Decoding token...")
try:
    from jose import jwt
    # Decode without verification first
    header = jwt.get_unverified_header(token)
    claims = jwt.get_unverified_claims(token)
    print(f"   Algorithm: {header.get('alg')}")
    print(f"   Token type: {header.get('typ')}")
    print(f"   Claims: {json.dumps(claims, indent=6)}")
except Exception as e:
    print(f"   Error: {e}")

# Step 4: Test /me endpoint
print("\n4. Testing /api/v1/auth/me...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"   Headers: {headers}")

try:
    resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=5)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {json.dumps(resp.json(), indent=6, ensure_ascii=False)}")
    
    if resp.status_code == 200:
        print("\n✓ SUCCESS: JWT validation works!")
    else:
        print("\n✗ FAILED: JWT validation not working")
        print(f"   Problem: {resp.json().get('detail', 'Unknown error')}")
        
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 80)
