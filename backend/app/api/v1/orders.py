"""
Order endpoints
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
from app.schemas.common import MessageResponse
from app.services.order_service import OrderService
from app.core.constants import UserRole
from app.core.exceptions import NotFoundException
from app.api.v1 import get_current_user
import math

router = APIRouter()


@router.get("", response_model=OrderListResponse)
def get_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's orders
    """
    skip = (page - 1) * page_size
    orders, total = OrderService.get_user_orders(db, current_user.id, skip, page_size)
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get order by ID
    
    Users can only see their own orders
    Admins can see all orders
    """
    order = OrderService.get_order_by_id(db, order_id)
    
    if not order:
        raise NotFoundException(detail="Order not found")
    
    # Check permissions
    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        # Check if user is a seller with products in this order
        from app.db.models import OrderItem
        seller_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order_id, OrderItem.seller_id == current_user.id)
            .first()
        )
        
        if not seller_items:
            raise NotFoundException(detail="Order not found")
    
    return order


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create order from cart
    
    Clears cart after creating order
    """
    order = OrderService.create_order_from_cart(db, order_data, current_user.id)
    
    # Send order confirmation email (placeholder)
    from app.services.email_service import EmailService
    EmailService.send_order_confirmation_email(
        current_user.email,
        order.id,
        order.tracking_number
    )
    
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update order status
    
    Admins can update any order
    Sellers can update orders with their products
    """
    is_admin = current_user.role == UserRole.ADMIN
    order = OrderService.update_order_status(db, order_id, order_data, current_user.id, is_admin)
    
    return order


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel order
    
    Only pending orders can be cancelled
    """
    order = OrderService.cancel_order(db, order_id, current_user.id)
    return order
