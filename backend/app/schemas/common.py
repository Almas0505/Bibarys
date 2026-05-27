"""
Common schemas used across the application
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints"""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
