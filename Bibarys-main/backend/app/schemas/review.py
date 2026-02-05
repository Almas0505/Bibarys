"""
Review schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class ReviewBase(BaseModel):
    """Base review schema"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    title: Optional[str] = Field(None, max_length=255)
    text: Optional[str] = None
    images: List[str] = Field(default_factory=list)


class ReviewCreate(ReviewBase):
    """Schema for creating a review"""
    product_id: int


class ReviewUpdate(BaseModel):
    """Schema for updating a review"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    text: Optional[str] = None
    images: Optional[List[str]] = None


class ReviewResponse(ReviewBase):
    """Schema for review response"""
    id: int
    product_id: int
    user_id: int
    helpful_count: int
    verified_purchase: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """Schema for review list"""
    items: List[ReviewResponse]
    total: int
    average_rating: float
