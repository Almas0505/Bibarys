"""
Tests for Wishlist API endpoints
"""
import pytest
from fastapi.testclient import TestClient


def test_add_to_wishlist(client, auth_token, test_product):
    """Test adding a product to wishlist"""
    response = client.post(
        f"/api/v1/wishlist/{test_product.id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Product added to wishlist"


def test_get_wishlist(client, auth_token, test_product):
    """Test getting wishlist"""
    product_id = test_product.id
    product_name = test_product.name
    product_price = test_product.price
    
    # Add product to wishlist first
    client.post(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Get wishlist
    response = client.get(
        "/api/v1/wishlist",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["product_id"] == product_id
    assert data[0]["product_name"] == product_name
    assert data[0]["product_price"] == product_price


def test_add_duplicate_to_wishlist(client, auth_token, test_product):
    """Test adding the same product twice to wishlist"""
    product_id = test_product.id
    
    # Add product first time
    client.post(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Try to add same product again
    response = client.post(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Product already in wishlist"


def test_remove_from_wishlist(client, auth_token, test_product):
    """Test removing a product from wishlist"""
    product_id = test_product.id
    
    # Add product first
    client.post(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Remove product
    response = client.delete(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Product removed from wishlist"
    
    # Verify wishlist is empty
    response = client.get(
        "/api/v1/wishlist",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert len(response.json()) == 0


def test_clear_wishlist(client, auth_token, test_product, test_db, test_seller):
    """Test clearing entire wishlist"""
    product_id = test_product.id
    seller_id = test_seller.id
    
    # Add multiple products
    from app.db.models import Product
    from app.core.constants import ProductCategory
    
    product2 = Product(
        name="Test Product 2",
        description="Test Description 2",
        price=199.99,
        quantity=5,
        category=ProductCategory.ELECTRONICS,
        seller_id=seller_id,
        image_urls=["https://example.com/image2.jpg"],
        is_active=True
    )
    test_db.add(product2)
    test_db.commit()
    test_db.refresh(product2)
    product2_id = product2.id
    
    client.post(
        f"/api/v1/wishlist/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    client.post(
        f"/api/v1/wishlist/{product2_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Clear wishlist
    response = client.delete(
        "/api/v1/wishlist",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Wishlist cleared"
    
    # Verify wishlist is empty
    response = client.get(
        "/api/v1/wishlist",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert len(response.json()) == 0


def test_add_nonexistent_product(client, test_db):
    """Test adding a non-existent product to wishlist"""
    # Create a fresh login for this test
    from app.db.models import User
    from app.core.security import hash_password
    from app.core.constants import UserRole
    
    # Create unique user for this test
    import random
    email = f"test_{random.randint(10000, 99999)}@example.com"
    user = User(
        email=email,
        password_hash=hash_password("testpassword"),
        first_name="Test",
        last_name="User",
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True
    )
    test_db.add(user)
    test_db.commit()
    
    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    
    # Test adding non-existent product
    response = client.post(
        "/api/v1/wishlist/99999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_remove_nonexistent_product(client, test_db):
    """Test removing a product that's not in wishlist"""
    # Create a fresh login for this test
    from app.db.models import User
    from app.core.security import hash_password
    from app.core.constants import UserRole
    
    # Create unique user for this test
    import random
    email = f"test_{random.randint(10000, 99999)}@example.com"
    user = User(
        email=email,
        password_hash=hash_password("testpassword"),
        first_name="Test",
        last_name="User",
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True
    )
    test_db.add(user)
    test_db.commit()
    
    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    
    # Test removing non-existent product
    response = client.delete(
        "/api/v1/wishlist/99999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not in wishlist"


def test_wishlist_requires_auth(client, test_product):
    """Test that wishlist endpoints require authentication"""
    response = client.get("/api/v1/wishlist")
    assert response.status_code == 403
    
    response = client.post(f"/api/v1/wishlist/{test_product.id}")
    assert response.status_code == 403
    
    response = client.delete(f"/api/v1/wishlist/{test_product.id}")
    assert response.status_code == 403
