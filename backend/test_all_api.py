"""
Comprehensive API Testing Script
Tests all endpoints of the E-Commerce API systematically
"""
import requests
import json
from typing import Dict, Any, Optional
import sys


class APITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_id: Optional[int] = None
        self.admin_token: Optional[str] = None
        self.seller_token: Optional[str] = None
        self.test_results = []
        
    def print_section(self, title: str):
        """Print formatted section header"""
        print("\n" + "=" * 80)
        print(f"  {title}")
        print("=" * 80)
        
    def print_test(self, name: str, success: bool, details: str = ""):
        """Print test result"""
        status = "✓ PASS" if success else "✗ FAIL"
        color = "\033[92m" if success else "\033[91m"
        reset = "\033[0m"
        print(f"{color}{status}{reset} - {name}")
        if details:
            print(f"       {details}")
        self.test_results.append({"name": name, "success": success, "details": details})
        
    def make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        use_auth: bool = False
    ) -> tuple[int, Any]:
        """Make HTTP request and return status code and response"""
        url = f"{self.base_url}{endpoint}"
        
        # Add authorization header if needed
        if use_auth and self.access_token:
            if headers is None:
                headers = {}
            headers["Authorization"] = f"Bearer {self.access_token}"
            
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return 0, {"error": f"Unknown method: {method}"}
                
            try:
                return response.status_code, response.json()
            except:
                return response.status_code, {"text": response.text}
        except requests.exceptions.RequestException as e:
            return 0, {"error": str(e)}
            
    def test_health_check(self):
        """Test health check endpoint"""
        self.print_section("1. HEALTH CHECK")
        
        status, data = self.make_request("GET", "/health")
        success = status == 200 and data.get("status") == "healthy"
        self.print_test(
            "GET /health",
            success,
            f"Status: {status}, Response: {json.dumps(data, ensure_ascii=False)[:100]}"
        )
        
        status, data = self.make_request("GET", "/")
        success = status == 200
        self.print_test(
            "GET / (root)",
            success,
            f"Status: {status}, Message: {data.get('message', '')}"
        )
        
    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.print_section("2. AUTHENTICATION API")
        
        # Test user registration
        register_data = {
            "email": "testuser@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+77771234567"
        }
        
        status, data = self.make_request("POST", "/api/v1/auth/register", register_data)
        success = status in [200, 201]
        self.print_test(
            "POST /api/v1/auth/register (User)",
            success,
            f"Status: {status}, User ID: {data.get('id', 'N/A')}"
        )
        
        # Test login
        login_data = {
            "email": "testuser@example.com",
            "password": "TestPassword123!"
        }
        
        status, data = self.make_request("POST", "/api/v1/auth/login", login_data)
        success = status == 200 and "access_token" in data
        if success:
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
        self.print_test(
            "POST /api/v1/auth/login",
            success,
            f"Status: {status}, Token received: {bool(self.access_token)}"
        )
        
        # Test get current user
        status, data = self.make_request("GET", "/api/v1/auth/me", use_auth=True)
        success = status == 200 and data.get("email") == "testuser@example.com"
        if success:
            self.user_id = data.get("id")
        self.print_test(
            "GET /api/v1/auth/me",
            success,
            f"Status: {status}, Email: {data.get('email', 'N/A')}"
        )
        
        # Register admin user
        admin_data = {
            "email": "admin@example.com",
            "password": "AdminPass123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin"
        }
        
        status, data = self.make_request("POST", "/api/v1/auth/register", admin_data)
        self.print_test(
            "POST /api/v1/auth/register (Admin)",
            status in [200, 201],
            f"Status: {status}"
        )
        
        # Login as admin
        admin_login = {
            "email": "admin@example.com",
            "password": "AdminPass123!"
        }
        status, data = self.make_request("POST", "/api/v1/auth/login", admin_login)
        if status == 200:
            self.admin_token = data.get("access_token")
        self.print_test(
            "POST /api/v1/auth/login (Admin)",
            status == 200,
            f"Status: {status}, Admin token: {bool(self.admin_token)}"
        )
        
        # Register seller
        seller_data = {
            "email": "seller@example.com",
            "password": "SellerPass123!",
            "first_name": "Seller",
            "last_name": "User",
            "role": "seller"
        }
        
        status, data = self.make_request("POST", "/api/v1/auth/register", seller_data)
        self.print_test(
            "POST /api/v1/auth/register (Seller)",
            status in [200, 201],
            f"Status: {status}"
        )
        
        # Login as seller
        seller_login = {
            "email": "seller@example.com",
            "password": "SellerPass123!"
        }
        status, data = self.make_request("POST", "/api/v1/auth/login", seller_login)
        if status == 200:
            self.seller_token = data.get("access_token")
        self.print_test(
            "POST /api/v1/auth/login (Seller)",
            status == 200,
            f"Status: {status}, Seller token: {bool(self.seller_token)}"
        )
        
    def test_products_endpoints(self):
        """Test products endpoints"""
        self.print_section("3. PRODUCTS API")
        
        # Get all products (public)
        status, data = self.make_request("GET", "/api/v1/products")
        success = status == 200
        product_count = len(data.get("items", [])) if isinstance(data, dict) else 0
        self.print_test(
            "GET /api/v1/products",
            success,
            f"Status: {status}, Products count: {product_count}"
        )
        
        # Create product (requires seller/admin token)
        product_data = {
            "name": "Test Product",
            "description": "This is a test product",
            "price": 99.99,
            "category": "Electronics",
            "stock_quantity": 100,
            "image_url": "https://example.com/image.jpg"
        }
        
        # Try with seller token
        headers = {"Authorization": f"Bearer {self.seller_token}"} if self.seller_token else None
        status, data = self.make_request("POST", "/api/v1/products", product_data, headers=headers)
        success = status in [200, 201]
        product_id = data.get("id") if success else None
        self.print_test(
            "POST /api/v1/products (Create)",
            success,
            f"Status: {status}, Product ID: {product_id}"
        )
        
        # Get specific product
        if product_id:
            status, data = self.make_request("GET", f"/api/v1/products/{product_id}")
            success = status == 200 and data.get("id") == product_id
            self.print_test(
                f"GET /api/v1/products/{product_id}",
                success,
                f"Status: {status}, Name: {data.get('name', 'N/A')}"
            )
            
            # Update product
            update_data = {
                "name": "Updated Test Product",
                "price": 89.99
            }
            status, data = self.make_request("PUT", f"/api/v1/products/{product_id}", update_data, headers=headers)
            success = status == 200
            self.print_test(
                f"PUT /api/v1/products/{product_id} (Update)",
                success,
                f"Status: {status}"
            )
            
        # Search products
        status, data = self.make_request("GET", "/api/v1/products?search=Test")
        success = status == 200
        self.print_test(
            "GET /api/v1/products?search=Test",
            success,
            f"Status: {status}, Found: {len(data.get('items', []))}"
        )
        
        # Filter by category
        status, data = self.make_request("GET", "/api/v1/products?category=Electronics")
        success = status == 200
        self.print_test(
            "GET /api/v1/products?category=Electronics",
            success,
            f"Status: {status}, Found: {len(data.get('items', []))}"
        )
        
        return product_id
        
    def test_cart_endpoints(self, product_id: Optional[int]):
        """Test cart endpoints"""
        self.print_section("4. CART API")
        
        # Get cart (empty)
        status, data = self.make_request("GET", "/api/v1/cart", use_auth=True)
        success = status == 200
        self.print_test(
            "GET /api/v1/cart (Empty)",
            success,
            f"Status: {status}, Items: {len(data.get('items', []))}"
        )
        
        if product_id:
            # Add item to cart
            cart_data = {
                "product_id": product_id,
                "quantity": 2
            }
            status, data = self.make_request("POST", "/api/v1/cart/items", cart_data, use_auth=True)
            success = status in [200, 201]
            self.print_test(
                "POST /api/v1/cart/items (Add)",
                success,
                f"Status: {status}"
            )
            
            # Get cart with items
            status, data = self.make_request("GET", "/api/v1/cart", use_auth=True)
            success = status == 200 and len(data.get("items", [])) > 0
            self.print_test(
                "GET /api/v1/cart (With items)",
                success,
                f"Status: {status}, Items: {len(data.get('items', []))}"
            )
            
            # Update cart item
            update_data = {"quantity": 3}
            status, data = self.make_request("PUT", f"/api/v1/cart/items/{product_id}", update_data, use_auth=True)
            success = status == 200
            self.print_test(
                f"PUT /api/v1/cart/items/{product_id} (Update quantity)",
                success,
                f"Status: {status}"
            )
            
            # Clear cart (for testing - we'll add again for orders)
            status, data = self.make_request("DELETE", "/api/v1/cart/clear", use_auth=True)
            self.print_test(
                "DELETE /api/v1/cart/clear",
                status == 200,
                f"Status: {status}"
            )
            
            # Add item again for order testing
            status, data = self.make_request("POST", "/api/v1/cart/items", cart_data, use_auth=True)
            
    def test_orders_endpoints(self):
        """Test orders endpoints"""
        self.print_section("5. ORDERS API")
        
        # Create order from cart
        order_data = {
            "shipping_address": "123 Test Street, Test City",
            "phone": "+77771234567"
        }
        
        status, data = self.make_request("POST", "/api/v1/orders", order_data, use_auth=True)
        success = status in [200, 201]
        order_id = data.get("id") if success else None
        self.print_test(
            "POST /api/v1/orders (Create from cart)",
            success,
            f"Status: {status}, Order ID: {order_id}"
        )
        
        # Get all orders
        status, data = self.make_request("GET", "/api/v1/orders", use_auth=True)
        success = status == 200
        self.print_test(
            "GET /api/v1/orders",
            success,
            f"Status: {status}, Orders count: {len(data.get('items', []))}"
        )
        
        # Get specific order
        if order_id:
            status, data = self.make_request("GET", f"/api/v1/orders/{order_id}", use_auth=True)
            success = status == 200
            self.print_test(
                f"GET /api/v1/orders/{order_id}",
                success,
                f"Status: {status}, Status: {data.get('status', 'N/A')}"
            )
            
            # Update order status (admin/seller)
            headers = {"Authorization": f"Bearer {self.admin_token}"} if self.admin_token else None
            update_data = {"status": "processing"}
            status, data = self.make_request("PUT", f"/api/v1/orders/{order_id}/status", update_data, headers=headers)
            self.print_test(
                f"PUT /api/v1/orders/{order_id}/status",
                status == 200,
                f"Status: {status}"
            )
            
        return order_id
        
    def test_reviews_endpoints(self, product_id: Optional[int]):
        """Test reviews endpoints"""
        self.print_section("6. REVIEWS API")
        
        if product_id:
            # Create review
            review_data = {
                "product_id": product_id,
                "rating": 5,
                "comment": "Excellent product! Very satisfied."
            }
            
            status, data = self.make_request("POST", "/api/v1/reviews", review_data, use_auth=True)
            success = status in [200, 201]
            review_id = data.get("id") if success else None
            self.print_test(
                "POST /api/v1/reviews (Create)",
                success,
                f"Status: {status}, Review ID: {review_id}"
            )
            
            # Get product reviews
            status, data = self.make_request("GET", f"/api/v1/reviews?product_id={product_id}")
            success = status == 200
            self.print_test(
                f"GET /api/v1/reviews?product_id={product_id}",
                success,
                f"Status: {status}, Reviews count: {len(data.get('items', []))}"
            )
            
            # Update review
            if review_id:
                update_data = {
                    "rating": 4,
                    "comment": "Good product, updated review"
                }
                status, data = self.make_request("PUT", f"/api/v1/reviews/{review_id}", update_data, use_auth=True)
                success = status == 200
                self.print_test(
                    f"PUT /api/v1/reviews/{review_id} (Update)",
                    success,
                    f"Status: {status}"
                )
                
                # Delete review
                status, data = self.make_request("DELETE", f"/api/v1/reviews/{review_id}", use_auth=True)
                self.print_test(
                    f"DELETE /api/v1/reviews/{review_id}",
                    status == 200,
                    f"Status: {status}"
                )
        else:
            self.print_test("Skipped - No product ID", False, "Product required for reviews")
            
    def test_wishlist_endpoints(self, product_id: Optional[int]):
        """Test wishlist endpoints"""
        self.print_section("7. WISHLIST API")
        
        # Get empty wishlist
        status, data = self.make_request("GET", "/api/v1/wishlist", use_auth=True)
        success = status == 200
        self.print_test(
            "GET /api/v1/wishlist (Empty)",
            success,
            f"Status: {status}, Items: {len(data.get('items', []))}"
        )
        
        if product_id:
            # Add to wishlist
            wishlist_data = {"product_id": product_id}
            status, data = self.make_request("POST", "/api/v1/wishlist/items", wishlist_data, use_auth=True)
            success = status in [200, 201]
            self.print_test(
                "POST /api/v1/wishlist/items (Add)",
                success,
                f"Status: {status}"
            )
            
            # Get wishlist with items
            status, data = self.make_request("GET", "/api/v1/wishlist", use_auth=True)
            success = status == 200
            self.print_test(
                "GET /api/v1/wishlist (With items)",
                success,
                f"Status: {status}, Items: {len(data.get('items', []))}"
            )
            
            # Remove from wishlist
            status, data = self.make_request("DELETE", f"/api/v1/wishlist/items/{product_id}", use_auth=True)
            self.print_test(
                f"DELETE /api/v1/wishlist/items/{product_id}",
                status == 200,
                f"Status: {status}"
            )
        else:
            self.print_test("Skipped - No product ID", False, "Product required for wishlist")
            
    def test_payments_endpoints(self, order_id: Optional[int]):
        """Test payments endpoints"""
        self.print_section("8. PAYMENTS API")
        
        if order_id:
            # Process payment
            payment_data = {
                "order_id": order_id,
                "payment_method": "card",
                "amount": 199.98
            }
            
            status, data = self.make_request("POST", "/api/v1/payments/process", payment_data, use_auth=True)
            success = status in [200, 201]
            payment_id = data.get("id") if success else None
            self.print_test(
                "POST /api/v1/payments/process",
                success,
                f"Status: {status}, Payment ID: {payment_id}"
            )
            
            # Verify payment
            if payment_id:
                verify_data = {"payment_id": payment_id}
                status, data = self.make_request("POST", "/api/v1/payments/verify", verify_data, use_auth=True)
                self.print_test(
                    "POST /api/v1/payments/verify",
                    status == 200,
                    f"Status: {status}, Verified: {data.get('verified', False)}"
                )
                
            # Get payment status
            if payment_id:
                status, data = self.make_request("GET", f"/api/v1/payments/{payment_id}/status", use_auth=True)
                self.print_test(
                    f"GET /api/v1/payments/{payment_id}/status",
                    status == 200,
                    f"Status: {status}, Payment status: {data.get('status', 'N/A')}"
                )
        else:
            self.print_test("Skipped - No order ID", False, "Order required for payments")
            
    def test_admin_endpoints(self):
        """Test admin endpoints"""
        self.print_section("9. ADMIN API")
        
        if not self.admin_token:
            self.print_test("Skipped - No admin token", False, "Admin authentication required")
            return
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get all users
        status, data = self.make_request("GET", "/api/v1/admin/users", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/admin/users",
            success,
            f"Status: {status}, Users count: {len(data.get('items', []))}"
        )
        
        # Get dashboard stats
        status, data = self.make_request("GET", "/api/v1/admin/dashboard", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/admin/dashboard",
            success,
            f"Status: {status}"
        )
        
        # Get platform stats
        status, data = self.make_request("GET", "/api/v1/admin/stats", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/admin/stats",
            success,
            f"Status: {status}"
        )
        
        # Get all orders (admin view)
        status, data = self.make_request("GET", "/api/v1/admin/orders", headers=headers)
        self.print_test(
            "GET /api/v1/admin/orders",
            status == 200,
            f"Status: {status}, Orders: {len(data.get('items', []))}"
        )
        
    def test_seller_endpoints(self):
        """Test seller endpoints"""
        self.print_section("10. SELLER API")
        
        if not self.seller_token:
            self.print_test("Skipped - No seller token", False, "Seller authentication required")
            return
            
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        
        # Get seller products
        status, data = self.make_request("GET", "/api/v1/seller/products", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/seller/products",
            success,
            f"Status: {status}, Products: {len(data.get('items', []))}"
        )
        
        # Get seller orders
        status, data = self.make_request("GET", "/api/v1/seller/orders", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/seller/orders",
            success,
            f"Status: {status}, Orders: {len(data.get('items', []))}"
        )
        
        # Get seller analytics
        status, data = self.make_request("GET", "/api/v1/seller/analytics", headers=headers)
        self.print_test(
            "GET /api/v1/seller/analytics",
            status == 200,
            f"Status: {status}"
        )
        
    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        self.print_section("11. ANALYTICS API")
        
        if not self.admin_token:
            self.print_test("Skipped - No admin token", False, "Admin authentication required")
            return
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get sales analytics
        status, data = self.make_request("GET", "/api/v1/analytics/sales", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/analytics/sales",
            success,
            f"Status: {status}"
        )
        
        # Get product analytics
        status, data = self.make_request("GET", "/api/v1/analytics/products", headers=headers)
        success = status == 200
        self.print_test(
            "GET /api/v1/analytics/products",
            success,
            f"Status: {status}"
        )
        
        # Get user analytics
        status, data = self.make_request("GET", "/api/v1/analytics/users", headers=headers)
        self.print_test(
            "GET /api/v1/analytics/users",
            status == 200,
            f"Status: {status}"
        )
        
    def print_summary(self):
        """Print test summary"""
        self.print_section("TEST SUMMARY")
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["success"])
        failed = total - passed
        
        print(f"\nTotal Tests: {total}")
        print(f"\033[92mPassed: {passed}\033[0m")
        print(f"\033[91mFailed: {failed}\033[0m")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n\033[91mFailed Tests:\033[0m")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['name']}")
                    if result["details"]:
                        print(f"    {result['details']}")
                        
    def run_all_tests(self):
        """Run all API tests"""
        print("\n" + "=" * 80)
        print("  E-COMMERCE API COMPREHENSIVE TEST SUITE")
        print("  Testing all endpoints systematically")
        print("=" * 80)
        
        try:
            self.test_health_check()
            self.test_auth_endpoints()
            product_id = self.test_products_endpoints()
            self.test_cart_endpoints(product_id)
            order_id = self.test_orders_endpoints()
            self.test_reviews_endpoints(product_id)
            self.test_wishlist_endpoints(product_id)
            self.test_payments_endpoints(order_id)
            self.test_admin_endpoints()
            self.test_seller_endpoints()
            self.test_analytics_endpoints()
            
            self.print_summary()
            
        except KeyboardInterrupt:
            print("\n\nTests interrupted by user")
            self.print_summary()
            sys.exit(1)
        except Exception as e:
            print(f"\n\033[91mUnexpected error: {str(e)}\033[0m")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    print("Starting API tests...")
    print("Make sure the backend server is running on http://localhost:8001")
    print("")
    
    tester = APITester("http://localhost:8001")
    tester.run_all_tests()
