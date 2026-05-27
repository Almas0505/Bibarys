"""
Payment schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.core.constants import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    """Schema for creating a payment"""
    order_id: int
    method: PaymentMethod


class PaymentResponse(BaseModel):
    """Schema for payment response"""
    id: int
    order_id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
