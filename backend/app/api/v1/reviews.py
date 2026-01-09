"""
Product reviews endpoints
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models import User, Review, Product, Order, OrderItem
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.api.v1 import get_current_user
from pydantic import BaseModel, Field
from datetime import datetime
from sqlalchemy import func
import math

router = APIRouter()


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    text: Optional[str] = None
    images: List[str] = Field(default_factory=list)


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: Optional[str]
    text: Optional[str]
    images: List[str]
    helpful_count: int
    verified_purchase: bool
    created_at: datetime
    user_first_name: str
    user_last_name: str
    
    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    items: List[ReviewResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("/product/{product_id}", response_model=ReviewListResponse)
def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    rating_filter: Optional[int] = Query(None, ge=1, le=5),
    db: Session = Depends(get_db)
):
    """Get reviews for a product with pagination and filters"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise NotFoundException(detail="Product not found")
    
    # Build query
    query = db.query(Review).filter(Review.product_id == product_id)
    
    # Apply rating filter
    if rating_filter:
        query = query.filter(Review.rating == rating_filter)
    
    # Order by created_at desc
    query = query.order_by(Review.created_at.desc())
    
    # Count total
    total = query.count()
    
    # Pagination
    offset = (page - 1) * page_size
    reviews = query.offset(offset).limit(page_size).all()
    
    # Build response with user data
    items = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        items.append(ReviewResponse(
            id=review.id,
            product_id=review.product_id,
            user_id=review.user_id,
            rating=review.rating,
            title=review.title,
            text=review.text,
            images=review.images,
            helpful_count=review.helpful_count,
            verified_purchase=review.verified_purchase,
            created_at=review.created_at,
            user_first_name=user.first_name if user else "Unknown",
            user_last_name=user.last_name if user else "User"
        ))
    
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0
    )


@router.post("/product/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new review for a product"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise NotFoundException(detail="Product not found")
    
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing:
        raise BadRequestException(detail="You have already reviewed this product")
    
    # Check if user purchased this product (verified purchase)
    verified_purchase = False
    user_orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    for order in user_orders:
        order_items = db.query(OrderItem).filter(
            OrderItem.order_id == order.id,
            OrderItem.product_id == product_id
        ).first()
        if order_items:
            verified_purchase = True
            break
    
    # Create review
    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=review_data.rating,
        title=review_data.title,
        text=review_data.text,
        images=review_data.images,
        verified_purchase=verified_purchase
    )
    
    db.add(review)
    db.commit()
    
    # Update product rating using SQL aggregation for better performance
    rating_stats = db.query(
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).filter(Review.product_id == product_id).first()
    
    if rating_stats and rating_stats.avg_rating:
        product.rating = round(float(rating_stats.avg_rating), 2)
        product.review_count = rating_stats.review_count
    else:
        product.rating = 0.0
        product.review_count = 0
    
    db.commit()
    db.refresh(review)
    
    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        rating=review.rating,
        title=review.title,
        text=review.text,
        images=review.images,
        helpful_count=0,
        verified_purchase=verified_purchase,
        created_at=review.created_at,
        user_first_name=current_user.first_name,
        user_last_name=current_user.last_name
    )


@router.delete("/{review_id}", response_model=MessageResponse)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review (only by author or admin)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise NotFoundException(detail="Review not found")
    
    # Check permissions
    from app.core.constants import UserRole
    if review.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException(detail="You can only delete your own reviews")
    
    product_id = review.product_id
    
    db.delete(review)
    db.commit()
    
    # Update product rating using SQL aggregation for better performance
    rating_stats = db.query(
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).filter(Review.product_id == product_id).first()
    
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if rating_stats and rating_stats.avg_rating:
        product.rating = round(float(rating_stats.avg_rating), 2)
        product.review_count = rating_stats.review_count
    else:
        product.rating = 0.0
        product.review_count = 0
    
    db.commit()
    
    return MessageResponse(message="Review deleted successfully")
