"""
Payment endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService
from app.core.exceptions import NotFoundException
from app.api.v1 import get_current_user

router = APIRouter()


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create and process a payment
    
    Demo payment system - automatically succeeds for amounts < $10,000
    In production, integrate with real payment gateway (Stripe, PayPal, etc.)
    """
    payment = PaymentService.create_payment(db, payment_data, current_user.id)
    return payment


@router.get("/order/{order_id}", response_model=PaymentResponse)
def get_payment_by_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment for an order
    """
    from app.services.order_service import OrderService
    from app.core.constants import UserRole
    
    # Check if user has access to this order
    order = OrderService.get_order_by_id(db, order_id)
    
    if not order:
        raise NotFoundException(detail="Order not found")
    
    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise NotFoundException(detail="Order not found")
    
    # Get payment
    payment = PaymentService.get_payment_by_order_id(db, order_id)
    
    if not payment:
        raise NotFoundException(detail="Payment not found")
    
    return payment
