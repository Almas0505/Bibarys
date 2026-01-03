"""
Order schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.core.constants import OrderStatus, DeliveryMethod


class OrderItemCreate(BaseModel):
    """Schema for creating an order item"""
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    """Schema for order item response"""
    id: int
    order_id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    seller_id: int
    
    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order"""
    delivery_method: str
    delivery_address: str = Field(..., min_length=5)
    phone: str = Field(..., min_length=5, max_length=20)
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    """Schema for updating order (admin/seller only)"""
    status: Optional[OrderStatus] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[str] = None


class OrderResponse(BaseModel):
    """Schema for order response"""
    id: int
    user_id: int
    status: OrderStatus
    total_price: float
    delivery_method: str
    delivery_cost: float
    delivery_address: str
    phone: str
    notes: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Schema for order list with pagination"""
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderFilter(BaseModel):
    """Schema for order filtering"""
    status: Optional[OrderStatus] = None
    user_id: Optional[int] = None
    seller_id: Optional[int] = None
