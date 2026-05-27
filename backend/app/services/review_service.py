"""
Review service - Business logic for review operations
"""
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from app.db.models import Review, Order, OrderItem
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException


class ReviewService:
    """Service for review-related operations"""
    
    @staticmethod
    def get_review_by_id(db: Session, review_id: int) -> Optional[Review]:
        """Get review by ID"""
        return db.query(Review).filter(Review.id == review_id).first()
    
    @staticmethod
    def create_review(db: Session, review_data: ReviewCreate, user_id: int) -> Review:
        """Create a new review"""
        # Check if user already reviewed this product
        existing_review = (
            db.query(Review)
            .filter(Review.product_id == review_data.product_id, Review.user_id == user_id)
            .first()
        )
        
        if existing_review:
            raise BadRequestException(detail="You have already reviewed this product")
        
        # Check if user purchased this product (verified purchase)
        purchased = (
            db.query(OrderItem)
            .join(Order)
            .filter(
                Order.user_id == user_id,
                OrderItem.product_id == review_data.product_id
            )
            .first()
        )
        
        # Create review
        review = Review(
            product_id=review_data.product_id,
            user_id=user_id,
            rating=review_data.rating,
            title=review_data.title,
            text=review_data.text,
            images=review_data.images,
            verified_purchase=bool(purchased),
        )
        
        db.add(review)
        db.commit()
        db.refresh(review)
        
        # Update product rating
        from app.services.product_service import ProductService
        ProductService.update_product_rating(db, review_data.product_id)
        
        return review
    
    @staticmethod
    def update_review(db: Session, review_id: int, review_data: ReviewUpdate, user_id: int) -> Review:
        """Update a review"""
        review = ReviewService.get_review_by_id(db, review_id)
        
        if not review:
            raise NotFoundException(detail="Review not found")
        
        if review.user_id != user_id:
            raise ForbiddenException(detail="You don't have permission to update this review")
        
        # Update fields
        update_data = review_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)
        
        db.commit()
        db.refresh(review)
        
        # Update product rating
        from app.services.product_service import ProductService
        ProductService.update_product_rating(db, review.product_id)
        
        return review
    
    @staticmethod
    def delete_review(db: Session, review_id: int, user_id: int, is_admin: bool = False) -> None:
        """Delete a review"""
        review = ReviewService.get_review_by_id(db, review_id)
        
        if not review:
            raise NotFoundException(detail="Review not found")
        
        # Check permissions
        if not is_admin and review.user_id != user_id:
            raise ForbiddenException(detail="You don't have permission to delete this review")
        
        product_id = review.product_id
        
        db.delete(review)
        db.commit()
        
        # Update product rating
        from app.services.product_service import ProductService
        ProductService.update_product_rating(db, product_id)
    
    @staticmethod
    def get_product_reviews(
        db: Session,
        product_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Review], int, float]:
        """Get reviews for a product"""
        total = db.query(Review).filter(Review.product_id == product_id).count()
        
        reviews = (
            db.query(Review)
            .filter(Review.product_id == product_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Calculate average rating
        if reviews:
            all_reviews = db.query(Review).filter(Review.product_id == product_id).all()
            average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        else:
            average_rating = 0.0
        
        return reviews, total, average_rating
    
    @staticmethod
    def increment_helpful_count(db: Session, review_id: int) -> Review:
        """Increment helpful count for a review"""
        review = ReviewService.get_review_by_id(db, review_id)
        
        if not review:
            raise NotFoundException(detail="Review not found")
        
        review.helpful_count += 1
        
        db.commit()
        db.refresh(review)
        
        return review
