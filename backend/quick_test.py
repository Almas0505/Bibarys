"""Quick test of fixes"""
import requests
import json

BASE_URL = "http://localhost:8001"

def test_quick():
    print("="*60)
    print("QUICK FIX VERIFICATION TEST")
    print("="*60)
    
    # 1. Health check
    print("\n1. Health check...")
    resp = requests.get(f"{BASE_URL}/health")
    print(f"   {'PASS' if resp.status_code == 200 else 'FAIL'} - Status: {resp.status_code}")
    
    # 2. Register (might exist already)
    print("\n2. Register user...")
    register_data = {
        "email": "quicktest@example.com",
        "password": "TestPassword123!",
        "first_name": "Quick",
        "last_name": "Test"
    }
    resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"   Status: {resp.status_code}")
    
    # 3. Login
    print("\n3. Login...")
    login_data = {
        "email": "quicktest@example.com",
        "password": "TestPassword123!"
    }
    resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    print(f"   {'PASS' if resp.status_code == 200 else 'FAIL'} - Status: {resp.status_code}")
    
    if resp.status_code != 200:
        print("   Cannot continue without token")
        return
    
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. Get /me (JWT validation test)
    print("\n4. GET /api/v1/auth/me (JWT VALIDATION TEST)...")
    resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
    print(f"   {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   User email: {resp.json().get('email')}")
    else:
        print(f"   Error: {resp.json().get('detail')}")
    
    # 5. Category filter test
    print("\n5. Products category filter...")
    resp = requests.get(f"{BASE_URL}/api/v1/products?category=electronics")
    print(f"   {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - Status: {resp.status_code}")
    
    # 6. Admin stats
    print("\n6. Admin stats endpoint...")
    resp = requests.get(f"{BASE_URL}/api/v1/admin/stats", headers=headers)
    print(f"   {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - Status: {resp.status_code}")
    
    # 7. Analytics endpoints
    print("\n7. Analytics endpoints...")
    
    resp = requests.get(f"{BASE_URL}/api/v1/analytics/sales", headers=headers)
    print(f"   /sales: {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - {resp.status_code}")
    
    resp = requests.get(f"{BASE_URL}/api/v1/analytics/products", headers=headers)
    print(f"   /products: {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - {resp.status_code}")
    
    resp = requests.get(f"{BASE_URL}/api/v1/analytics/users", headers=headers)
    print(f"   /users: {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - {resp.status_code}")
    
    # 8. Cart test (protected endpoint)
    print("\n8. Protected endpoint (cart)...")
    resp = requests.get(f"{BASE_URL}/api/v1/cart", headers=headers)
    print(f"   {'✓ PASS' if resp.status_code == 200 else '✗ FAIL'} - Status: {resp.status_code}")
    
    print("\n" + "="*60)
    print("TESTS COMPLETED!")
    print("="*60)

if __name__ == "__main__":
    try:
        test_quick()
    except Exception as e:
        print(f"\nError: {e}")
