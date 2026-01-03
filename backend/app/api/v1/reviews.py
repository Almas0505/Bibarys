"""
Review endpoints
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewListResponse
from app.schemas.common import MessageResponse
from app.services.review_service import ReviewService
from app.core.constants import UserRole
from app.api.v1 import get_current_user

router = APIRouter()


@router.get("/product/{product_id}", response_model=ReviewListResponse)
def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all reviews for a product
    """
    reviews, total, average_rating = ReviewService.get_product_reviews(
        db, product_id, skip, limit
    )
    
    return ReviewListResponse(
        items=reviews,
        total=total,
        average_rating=average_rating
    )


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new review
    
    Users can only review a product once
    """
    review = ReviewService.create_review(db, review_data, current_user.id)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a review
    
    Users can only update their own reviews
    """
    review = ReviewService.update_review(db, review_id, review_data, current_user.id)
    return review


@router.delete("/{review_id}", response_model=MessageResponse)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review
    
    Users can delete their own reviews
    Admins can delete any review
    """
    is_admin = current_user.role == UserRole.ADMIN
    ReviewService.delete_review(db, review_id, current_user.id, is_admin)
    return MessageResponse(message="Review deleted successfully")


@router.post("/{review_id}/helpful", response_model=ReviewResponse)
def mark_review_helpful(
    review_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark review as helpful
    
    Increments helpful count
    """
    review = ReviewService.increment_helpful_count(db, review_id)
    return review
