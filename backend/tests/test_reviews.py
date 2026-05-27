"""
Tests for Reviews API endpoints
"""
import pytest
from fastapi.testclient import TestClient


def test_get_product_reviews_empty(client, test_product):
    """Test getting reviews for a product with no reviews"""
    response = client.get(f"/api/v1/reviews/product/{test_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["items"]) == 0
    assert data["page"] == 1
    assert data["total_pages"] == 0


def test_create_review(client, auth_token, test_product, test_user):
    """Test creating a review"""
    review_data = {
        "rating": 5,
        "title": "Great product!",
        "text": "This is an excellent product. Highly recommended.",
        "images": []
    }
    
    response = client.post(
        f"/api/v1/reviews/product/{test_product.id}",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 5
    assert data["title"] == "Great product!"
    assert data["product_id"] == test_product.id
    assert data["user_id"] == test_user.id
    assert data["verified_purchase"] == False  # User hasn't purchased
    assert data["user_first_name"] == test_user.first_name


def test_get_product_reviews(client, auth_token, test_product):
    """Test getting reviews after creating one"""
    # Create a review first
    review_data = {
        "rating": 4,
        "title": "Good product",
        "text": "Nice quality",
        "images": []
    }
    client.post(
        f"/api/v1/reviews/product/{test_product.id}",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Get reviews
    response = client.get(f"/api/v1/reviews/product/{test_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["rating"] == 4


def test_create_duplicate_review(client, auth_token, test_product):
    """Test that user cannot review the same product twice"""
    review_data = {
        "rating": 5,
        "title": "First review",
        "text": "Great!",
        "images": []
    }
    
    # Create first review
    response = client.post(
        f"/api/v1/reviews/product/{test_product.id}",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    
    # Try to create second review
    response = client.post(
        f"/api/v1/reviews/product/{test_product.id}",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 400
    assert "already reviewed" in response.json()["detail"]


def test_review_pagination(client, auth_token, test_product, test_db, test_user):
    """Test review pagination"""
    # Create multiple reviews (need multiple users)
    from app.db.models import User, Review
    from app.core.security import hash_password
    from app.core.constants import UserRole
    
    # Create additional users and reviews
    for i in range(15):
        user = User(
            email=f"user{i}@example.com",
            password_hash=hash_password("password"),
            first_name=f"User{i}",
            last_name="Test",
            role=UserRole.CUSTOMER,
            is_active=True
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        review = Review(
            product_id=test_product.id,
            user_id=user.id,
            rating=4,
            title=f"Review {i}",
            text=f"Text {i}",
            verified_purchase=False
        )
        test_db.add(review)
    
    test_db.commit()
    
    # Test pagination - page 1
    response = client.get(f"/api/v1/reviews/product/{test_product.id}?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 10
    assert data["page"] == 1
    assert data["total_pages"] == 2
    
    # Test pagination - page 2
    response = client.get(f"/api/v1/reviews/product/{test_product.id}?page=2&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5


def test_review_rating_filter(client, auth_token, test_product, test_db):
    """Test filtering reviews by rating"""
    from app.db.models import User, Review
    from app.core.security import hash_password
    from app.core.constants import UserRole
    
    # Create users with different ratings
    for rating in [5, 5, 4, 4, 3]:
        user = User(
            email=f"user_rating{rating}_{id(rating)}@example.com",
            password_hash=hash_password("password"),
            first_name="User",
            last_name="Test",
            role=UserRole.CUSTOMER,
            is_active=True
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        review = Review(
            product_id=test_product.id,
            user_id=user.id,
            rating=rating,
            title=f"Review {rating}",
            text="Text",
            verified_purchase=False
        )
        test_db.add(review)
    
    test_db.commit()
    
    # Filter by 5 stars
    response = client.get(f"/api/v1/reviews/product/{test_product.id}?rating_filter=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert all(item["rating"] == 5 for item in data["items"])
    
    # Filter by 4 stars
    response = client.get(f"/api/v1/reviews/product/{test_product.id}?rating_filter=4")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2


def test_delete_review(client, auth_token, test_product):
    """Test deleting a review"""
    # Create a review
    review_data = {
        "rating": 5,
        "title": "Test",
        "text": "Test",
        "images": []
    }
    response = client.post(
        f"/api/v1/reviews/product/{test_product.id}",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    review_id = response.json()["id"]
    
    # Delete the review
    response = client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Review deleted successfully"
    
    # Verify review is deleted
    response = client.get(f"/api/v1/reviews/product/{test_product.id}")
    assert response.json()["total"] == 0


def test_review_nonexistent_product(client, auth_token):
    """Test creating a review for non-existent product"""
    review_data = {
        "rating": 5,
        "title": "Test",
        "text": "Test",
        "images": []
    }
    
    response = client.post(
        f"/api/v1/reviews/product/99999",
        json=review_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404


def test_review_requires_auth(client, test_product):
    """Test that review endpoints require authentication"""
    review_data = {
        "rating": 5,
        "title": "Test",
        "text": "Test"
    }
    
    response = client.post(f"/api/v1/reviews/product/{test_product.id}", json=review_data)
    assert response.status_code == 403
