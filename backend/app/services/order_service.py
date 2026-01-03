"""
Order service - Business logic for order operations
"""
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
import uuid
from app.db.models import Order, OrderItem, CartItem, Product
from app.schemas.order import OrderCreate, OrderUpdate, OrderFilter
from app.core.constants import OrderStatus, DELIVERY_COSTS
from app.core.exceptions import NotFoundException, BadRequestException, InsufficientStockException, ForbiddenException


class OrderService:
    """Service for order-related operations"""
    
    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
        """Get order by ID"""
        return db.query(Order).filter(Order.id == order_id).first()
    
    @staticmethod
    def create_order_from_cart(db: Session, order_data: OrderCreate, user_id: int) -> Order:
        """Create order from user's cart"""
        # Get user's cart items
        cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
        
        if not cart_items:
            raise BadRequestException(detail="Cart is empty")
        
        # Calculate total price and validate stock
        total_price = 0.0
        order_items_data = []
        
        for cart_item in cart_items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            
            if not product:
                raise NotFoundException(detail=f"Product {cart_item.product_id} not found")
            
            if not product.is_active:
                raise BadRequestException(detail=f"Product '{product.name}' is not available")
            
            if product.quantity < cart_item.quantity:
                raise InsufficientStockException(
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}"
                )
            
            item_total = product.price * cart_item.quantity
            total_price += item_total
            
            order_items_data.append({
                "product_id": product.id,
                "quantity": cart_item.quantity,
                "price_at_purchase": product.price,
                "seller_id": product.seller_id,
            })
        
        # Add delivery cost
        delivery_cost = DELIVERY_COSTS.get(order_data.delivery_method, 0)
        total_price += delivery_cost
        
        # Generate tracking number
        tracking_number = f"TRK-{uuid.uuid4().hex[:12].upper()}"
        
        # Estimate delivery date
        if order_data.delivery_method == "express":
            estimated_delivery = f"{(datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')}"
        elif order_data.delivery_method == "standard":
            estimated_delivery = f"{(datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')}"
        else:
            estimated_delivery = "Ready for pickup"
        
        # Create order
        order = Order(
            user_id=user_id,
            status=OrderStatus.PENDING,
            total_price=total_price,
            delivery_method=order_data.delivery_method,
            delivery_cost=delivery_cost,
            delivery_address=order_data.delivery_address,
            phone=order_data.phone,
            notes=order_data.notes,
            tracking_number=tracking_number,
            estimated_delivery=estimated_delivery,
        )
        
        db.add(order)
        db.flush()  # Get order ID
        
        # Create order items and update product quantities
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            db.add(order_item)
            
            # Decrease product quantity
            product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
            product.quantity -= item_data["quantity"]
        
        # Clear user's cart
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    def get_user_orders(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Order], int]:
        """Get user's orders"""
        total = db.query(Order).filter(Order.user_id == user_id).count()
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return orders, total
    
    @staticmethod
    def get_all_orders(
        db: Session,
        filters: OrderFilter,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Order], int]:
        """Get all orders with filters (admin only)"""
        query = db.query(Order)
        
        # Apply filters
        if filters.status:
            query = query.filter(Order.status == filters.status)
        
        if filters.user_id:
            query = query.filter(Order.user_id == filters.user_id)
        
        if filters.seller_id:
            # Orders containing products from specific seller
            query = query.join(OrderItem).filter(OrderItem.seller_id == filters.seller_id)
        
        # Count total
        total = query.count()
        
        # Get orders with pagination
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        
        return orders, total
    
    @staticmethod
    def get_seller_orders(
        db: Session,
        seller_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Order], int]:
        """Get orders containing seller's products"""
        # Get orders that have items from this seller
        query = (
            db.query(Order)
            .join(OrderItem)
            .filter(OrderItem.seller_id == seller_id)
            .distinct()
        )
        
        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        
        return orders, total
    
    @staticmethod
    def update_order_status(
        db: Session,
        order_id: int,
        order_data: OrderUpdate,
        user_id: int,
        is_admin: bool = False
    ) -> Order:
        """Update order status"""
        order = OrderService.get_order_by_id(db, order_id)
        
        if not order:
            raise NotFoundException(detail="Order not found")
        
        # Check permissions
        if not is_admin:
            # Sellers can update orders with their products
            seller_order_items = (
                db.query(OrderItem)
                .filter(OrderItem.order_id == order_id, OrderItem.seller_id == user_id)
                .first()
            )
            
            if not seller_order_items:
                raise ForbiddenException(detail="You don't have permission to update this order")
        
        # Update fields
        update_data = order_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(order, field, value)
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    def cancel_order(db: Session, order_id: int, user_id: int) -> Order:
        """Cancel order (only if pending)"""
        order = OrderService.get_order_by_id(db, order_id)
        
        if not order:
            raise NotFoundException(detail="Order not found")
        
        if order.user_id != user_id:
            raise ForbiddenException(detail="You don't have permission to cancel this order")
        
        if order.status != OrderStatus.PENDING:
            raise BadRequestException(detail="Only pending orders can be cancelled")
        
        # Restore product quantities
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity
        
        order.status = OrderStatus.CANCELLED
        
        db.commit()
        db.refresh(order)
        
        return order
