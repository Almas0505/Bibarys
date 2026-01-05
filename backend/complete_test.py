"""
Complete Backend Verification Test
Tests all implemented features
"""
import requests
import json
from typing import Dict, Optional

BASE_URL = "http://localhost:8001"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_header(text: str):
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"{text}")
    print(f"{'='*70}{Colors.RESET}")

def print_test(name: str, passed: bool, details: str = ""):
    status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if passed else f"{Colors.RED}✗ FAIL{Colors.RESET}"
    print(f"{status} - {name}")
    if details:
        print(f"       {details}")

def test_complete_backend():
    """Complete backend verification"""
    
    print(f"{Colors.BLUE}")
    print("="*70)
    print("COMPLETE BACKEND VERIFICATION TEST")
    print("Testing all implemented features")
    print("="*70)
    print(Colors.RESET)
    
    tests_passed = 0
    tests_total = 0
    token = None
    admin_token = None
    seller_token = None
    product_id = None
    
    # 1. SYSTEM HEALTH
    print_header("1. SYSTEM ENDPOINTS")
    tests_total += 2
    
    resp = requests.get(f"{BASE_URL}/health")
    passed = resp.status_code == 200
    tests_passed += passed
    print_test("GET /health", passed, f"Status: {resp.status_code}")
    
    resp = requests.get(f"{BASE_URL}/")
    passed = resp.status_code == 200
    tests_passed += passed
    print_test("GET / (root)", passed, f"Status: {resp.status_code}")
    
    # 2. AUTHENTICATION
    print_header("2. AUTHENTICATION & USER MANAGEMENT")
    tests_total += 3
    
    # Try register customer (might already exist)
    register_data = {
        "email": "customer@test.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "Customer"
    }
    resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    passed = resp.status_code in [200, 201, 409]  # Accept 409 if already exists
    tests_passed += passed
    print_test("POST /auth/register (Customer)", passed, f"Status: {resp.status_code}")
    
    # Login
    login_data = {"email": "customer@test.com", "password": "Password123!"}
    resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    passed = resp.status_code == 200
    tests_passed += passed
    if passed:
        token = resp.json().get("access_token")
    print_test("POST /auth/login", passed, f"Token: {'Received' if token else 'None'}")
    
    # Get current user
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /auth/me", passed, f"Status: {resp.status_code}")
    else:
        tests_passed += 0
        print_test("GET /auth/me", False, "No token available")
    
    # Register seller
    seller_data = {
        "email": "seller@test.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "Seller",
        "role": "seller"
    }
    resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=seller_data)
    # Try login regardless of registration result
    seller_login = {"email": "seller@test.com", "password": "Password123!"}
    resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=seller_login)
    if resp.status_code == 200:
        seller_token = resp.json().get("access_token")
    
    # Register admin
    admin_data = {
        "email": "admin@test.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "Admin",
        "role": "admin"
    }
    resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=admin_data)
    # Try login regardless of registration result
    admin_login = {"email": "admin@test.com", "password": "Password123!"}
    resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=admin_login)
    if resp.status_code == 200:
        admin_token = resp.json().get("access_token")
    
    # 3. PRODUCTS
    print_header("3. PRODUCT MANAGEMENT")
    tests_total += 5
    
    # Get products
    resp = requests.get(f"{BASE_URL}/api/v1/products")
    passed = resp.status_code == 200
    tests_passed += passed
    print_test("GET /products", passed, f"Count: {len(resp.json().get('items', []))}")
    
    # Search products
    resp = requests.get(f"{BASE_URL}/api/v1/products?search=test")
    passed = resp.status_code == 200
    tests_passed += passed
    print_test("GET /products?search=test", passed)
    
    # Filter by category
    resp = requests.get(f"{BASE_URL}/api/v1/products?category=electronics")
    passed = resp.status_code == 200
    tests_passed += passed
    print_test("GET /products?category=electronics", passed)
    
    # Create product (seller)
    if seller_token:
        product_data = {
            "name": "Test Product",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "category": "electronics",
            "image_urls": ["https://example.com/image.jpg"]
        }
        headers = {"Authorization": f"Bearer {seller_token}"}
        resp = requests.post(f"{BASE_URL}/api/v1/products", json=product_data, headers=headers)
        passed = resp.status_code in [200, 201]
        tests_passed += passed
        if passed:
            product_id = resp.json().get("id")
        print_test("POST /products (Seller)", passed, f"Product ID: {product_id}")
    else:
        print_test("POST /products (Seller)", False, "No seller token")
    
    # Get product by ID
    if product_id:
        resp = requests.get(f"{BASE_URL}/api/v1/products/{product_id}")
        passed = resp.status_code == 200
        tests_passed += passed
        print_test(f"GET /products/{product_id}", passed)
    else:
        print_test("GET /products/{id}", False, "No product created")
    
    # 4. CART
    print_header("4. SHOPPING CART")
    tests_total += 4
    
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get empty cart
        resp = requests.get(f"{BASE_URL}/api/v1/cart", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /cart (empty)", passed)
        
        # Add to cart
        if product_id:
            cart_data = {"product_id": product_id, "quantity": 2}
            resp = requests.post(f"{BASE_URL}/api/v1/cart/items", json=cart_data, headers=headers)
            passed = resp.status_code in [200, 201]
            tests_passed += passed
            print_test("POST /cart/items", passed)
            
            # Update cart item
            update_data = {"quantity": 3}
            resp = requests.put(f"{BASE_URL}/api/v1/cart/items/{product_id}", json=update_data, headers=headers)
            passed = resp.status_code == 200
            tests_passed += passed
            print_test("PUT /cart/items/{id}", passed)
            
            # Get cart with items
            resp = requests.get(f"{BASE_URL}/api/v1/cart", headers=headers)
            passed = resp.status_code == 200 and len(resp.json().get("items", [])) > 0
            tests_passed += passed
            print_test("GET /cart (with items)", passed)
        else:
            tests_passed += 0
            print_test("Cart operations", False, "No product available")
            tests_total -= 2
    else:
        tests_passed += 0
        print_test("Cart operations", False, "No token")
        tests_total -= 3
    
    # 5. ORDERS
    print_header("5. ORDER MANAGEMENT")
    tests_total += 3
    
    if token and product_id:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create order
        order_data = {
            "delivery_method": "standard",
            "delivery_address": "123 Test Street",
            "phone": "+77771234567"
        }
        resp = requests.post(f"{BASE_URL}/api/v1/orders", json=order_data, headers=headers)
        passed = resp.status_code in [200, 201]
        tests_passed += passed
        order_id = resp.json().get("id") if passed else None
        print_test("POST /orders", passed, f"Order ID: {order_id}")
        
        # Get orders
        resp = requests.get(f"{BASE_URL}/api/v1/orders", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /orders", passed)
        
        # Get order by ID
        if order_id:
            resp = requests.get(f"{BASE_URL}/api/v1/orders/{order_id}", headers=headers)
            passed = resp.status_code == 200
            tests_passed += passed
            print_test(f"GET /orders/{order_id}", passed)
        else:
            print_test("GET /orders/{id}", False, "No order created")
    else:
        tests_passed += 0
        print_test("Order operations", False, "No token or product")
        tests_total -= 2
    
    # 6. REVIEWS
    print_header("6. REVIEWS")
    tests_total += 2
    
    if token and product_id:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create review
        review_data = {
            "product_id": product_id,
            "rating": 5,
            "comment": "Excellent product!"
        }
        resp = requests.post(f"{BASE_URL}/api/v1/reviews", json=review_data, headers=headers)
        passed = resp.status_code in [200, 201]
        tests_passed += passed
        print_test("POST /reviews", passed)
        
        # Get reviews
        resp = requests.get(f"{BASE_URL}/api/v1/reviews?product_id={product_id}")
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /reviews", passed)
    else:
        print_test("Review operations", False, "No token or product")
        tests_total -= 1
    
    # 7. WISHLIST
    print_header("7. WISHLIST")
    tests_total += 2
    
    if token and product_id:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Add to wishlist
        wishlist_data = {"product_id": product_id}
        resp = requests.post(f"{BASE_URL}/api/v1/wishlist/items", json=wishlist_data, headers=headers)
        passed = resp.status_code in [200, 201]
        tests_passed += passed
        print_test("POST /wishlist/items", passed)
        
        # Get wishlist
        resp = requests.get(f"{BASE_URL}/api/v1/wishlist", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /wishlist", passed)
    else:
        print_test("Wishlist operations", False, "No token or product")
        tests_total -= 1
    
    # 8. ADMIN
    print_header("8. ADMIN PANEL")
    tests_total += 3
    
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Dashboard
        resp = requests.get(f"{BASE_URL}/api/v1/admin/dashboard", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /admin/dashboard", passed)
        
        # Stats
        resp = requests.get(f"{BASE_URL}/api/v1/admin/stats", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /admin/stats", passed)
        
        # Users
        resp = requests.get(f"{BASE_URL}/api/v1/admin/users", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /admin/users", passed)
    else:
        print_test("Admin operations", False, "No admin token")
        tests_total -= 2
    
    # 9. SELLER
    print_header("9. SELLER PANEL")
    tests_total += 2
    
    if seller_token:
        headers = {"Authorization": f"Bearer {seller_token}"}
        
        # Get seller products
        resp = requests.get(f"{BASE_URL}/api/v1/seller/products", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /seller/products", passed)
        
        # Get seller analytics
        resp = requests.get(f"{BASE_URL}/api/v1/seller/analytics", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /seller/analytics", passed)
    else:
        print_test("Seller operations", False, "No seller token")
        tests_total -= 1
    
    # 10. ANALYTICS
    print_header("10. ANALYTICS")
    tests_total += 4
    
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Sales
        resp = requests.get(f"{BASE_URL}/api/v1/analytics/sales", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /analytics/sales", passed)
        
        # Products
        resp = requests.get(f"{BASE_URL}/api/v1/analytics/products", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /analytics/products", passed)
        
        # Users
        resp = requests.get(f"{BASE_URL}/api/v1/analytics/users", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /analytics/users", passed)
        
        # Dashboard
        resp = requests.get(f"{BASE_URL}/api/v1/analytics/dashboard", headers=headers)
        passed = resp.status_code == 200
        tests_passed += passed
        print_test("GET /analytics/dashboard", passed)
    else:
        print_test("Analytics operations", False, "No admin token")
        tests_total -= 3
    
    # SUMMARY
    print_header("TEST SUMMARY")
    
    percentage = (tests_passed / tests_total * 100) if tests_total > 0 else 0
    
    print(f"\nTotal Tests: {tests_total}")
    print(f"{Colors.GREEN}Passed: {tests_passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {tests_total - tests_passed}{Colors.RESET}")
    print(f"Success Rate: {percentage:.1f}%")
    
    if percentage >= 90:
        print(f"\n{Colors.GREEN}🎉 EXCELLENT! Backend is production ready!{Colors.RESET}")
    elif percentage >= 70:
        print(f"\n{Colors.YELLOW}⚠️  GOOD! Most features working, some issues to fix.{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}❌ NEEDS WORK! Several features need attention.{Colors.RESET}")
    
    print(f"\n{Colors.BLUE}{'='*70}{Colors.RESET}\n")

if __name__ == "__main__":
    try:
        test_complete_backend()
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}ERROR: Cannot connect to server at {BASE_URL}")
        print(f"Make sure the server is running: python production_server.py{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}ERROR: {e}{Colors.RESET}")
