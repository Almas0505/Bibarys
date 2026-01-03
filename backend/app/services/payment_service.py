"""
Payment service - Demo payment processing
"""
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.db.models import Payment, Order
from app.schemas.payment import PaymentCreate
from app.core.constants import PaymentStatus, OrderStatus
from app.core.exceptions import NotFoundException, BadRequestException, PaymentFailedException


class PaymentService:
    """Service for payment operations (demo implementation)"""
    
    @staticmethod
    def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    @staticmethod
    def get_payment_by_order_id(db: Session, order_id: int) -> Optional[Payment]:
        """Get payment by order ID"""
        return db.query(Payment).filter(Payment.order_id == order_id).first()
    
    @staticmethod
    def create_payment(db: Session, payment_data: PaymentCreate, user_id: int) -> Payment:
        """Create and process a payment (demo)"""
        # Get order
        order = db.query(Order).filter(Order.id == payment_data.order_id).first()
        
        if not order:
            raise NotFoundException(detail="Order not found")
        
        # Check if user owns this order
        if order.user_id != user_id:
            raise BadRequestException(detail="You don't have permission to pay for this order")
        
        # Check if order is already paid
        existing_payment = PaymentService.get_payment_by_order_id(db, order.id)
        if existing_payment and existing_payment.status == PaymentStatus.SUCCESS:
            raise BadRequestException(detail="Order is already paid")
        
        # Generate transaction ID
        transaction_id = f"TXN-{uuid.uuid4().hex[:16].upper()}"
        
        # Demo payment processing
        # In production, integrate with real payment gateway (Stripe, PayPal, etc.)
        payment_success = PaymentService._process_demo_payment(
            amount=order.total_price,
            method=payment_data.method,
            transaction_id=transaction_id
        )
        
        # Create payment record
        payment = Payment(
            order_id=order.id,
            amount=order.total_price,
            method=payment_data.method,
            status=PaymentStatus.SUCCESS if payment_success else PaymentStatus.FAILED,
            transaction_id=transaction_id,
        )
        
        db.add(payment)
        
        # Update order status if payment successful
        if payment_success:
            order.status = OrderStatus.PROCESSING
        
        db.commit()
        db.refresh(payment)
        
        if not payment_success:
            raise PaymentFailedException(detail="Payment processing failed")
        
        return payment
    
    @staticmethod
    def _process_demo_payment(amount: float, method: str, transaction_id: str) -> bool:
        """
        Demo payment processing
        In production, this would integrate with real payment gateway
        
        Returns:
            True if payment successful, False otherwise
        """
        # Demo: always succeed for amounts < $10000
        # This is just for demonstration purposes
        if amount < 10000:
            return True
        else:
            return False
    
    @staticmethod
    def refund_payment(db: Session, payment_id: int) -> Payment:
        """Refund a payment (demo)"""
        payment = PaymentService.get_payment_by_id(db, payment_id)
        
        if not payment:
            raise NotFoundException(detail="Payment not found")
        
        if payment.status != PaymentStatus.SUCCESS:
            raise BadRequestException(detail="Only successful payments can be refunded")
        
        # Demo refund (in production, call payment gateway API)
        # For demo, we just mark as failed/refunded
        payment.status = PaymentStatus.FAILED
        
        # Update order status
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = OrderStatus.CANCELLED
        
        db.commit()
        db.refresh(payment)
        
        return payment
