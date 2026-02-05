"""
Order service - Business logic for order operations
"""
from sqlalchemy.orm import Session, joinedload
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
        
        # If paying with wallet, check balance and deduct amount
        if order_data.payment_method == 'wallet':
            from app.db.models import User, Transaction
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise NotFoundException(detail="User not found")
            
            if user.balance < total_price:
                raise BadRequestException(
                    detail=f"Insufficient balance. Required: {total_price}, Available: {user.balance}"
                )
            
            # Deduct amount from user's balance
            user.balance -= total_price
            
            # Create debit transaction
            transaction = Transaction(
                user_id=user_id,
                amount=-total_price,
                type='debit',
                description=f'Оплата заказа (заказ будет создан)',
                balance_after=user.balance
            )
            db.add(transaction)
        
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
            status=OrderStatus.PROCESSING,  # Заказ сразу в обработке
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
        
        # Update transaction description with order ID if paid with wallet
        if order_data.payment_method == 'wallet':
            from app.db.models import Transaction
            # Find the transaction we just created
            latest_transaction = (
                db.query(Transaction)
                .filter(Transaction.user_id == user_id, Transaction.type == 'debit')
                .order_by(Transaction.created_at.desc())
                .first()
            )
            if latest_transaction and 'заказ будет создан' in latest_transaction.description:
                latest_transaction.description = f'Оплата заказа #{order.id}'
        
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
        query = db.query(Order).options(joinedload(Order.user))
        
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
            # Sellers can only mark their own items as delivered
            seller_order_items = (
                db.query(OrderItem)
                .filter(OrderItem.order_id == order_id, OrderItem.seller_id == user_id)
                .all()
            )
            
            if not seller_order_items:
                raise ForbiddenException(detail="You don't have permission to update this order")
            
            # Seller is marking their items as delivered
            if order_data.status == OrderStatus.DELIVERED:
                from app.db.models import Transaction, User
                
                # Mark only seller's items as delivered
                total_amount = 0
                for item in seller_order_items:
                    if not item.is_delivered:  # Only if not already delivered
                        item.is_delivered = True
                        total_amount += item.price_at_purchase * item.quantity
                
                # Credit seller's balance only for their items
                if total_amount > 0:
                    seller = db.query(User).filter(User.id == user_id).first()
                    if seller:
                        seller.balance += total_amount
                        
                        # Create transaction record
                        transaction = Transaction(
                            user_id=user_id,
                            amount=total_amount,
                            type='credit',
                            description=f'Оплата за товары в заказе #{order_id}',
                            balance_after=seller.balance
                        )
                        db.add(transaction)
                
                # Check if all items in the order are delivered
                all_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
                if all(item.is_delivered for item in all_items):
                    # All items delivered, mark entire order as delivered
                    order.status = OrderStatus.DELIVERED
                elif order.status == OrderStatus.PENDING:
                    # Some items delivered, move to processing if still pending
                    order.status = OrderStatus.PROCESSING
            else:
                # Non-delivery status updates (admin only for now)
                raise ForbiddenException(detail="Sellers can only mark items as delivered")
        else:
            # Admin can update order status directly
            old_status = order.status
            new_status = order_data.status if hasattr(order_data, 'status') else None
            
            # Update fields
            update_data = order_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(order, field, value)
            
            # If admin marks as delivered, credit all sellers who haven't been paid
            if new_status == OrderStatus.DELIVERED and old_status != OrderStatus.DELIVERED:
                from app.db.models import Transaction, User
                
                order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
                
                # Group items by seller
                seller_earnings = {}
                for item in order_items:
                    if not item.is_delivered:  # Only unpaid items
                        seller_id = item.seller_id
                        amount = item.price_at_purchase * item.quantity
                        
                        if seller_id in seller_earnings:
                            seller_earnings[seller_id] += amount
                        else:
                            seller_earnings[seller_id] = amount
                        
                        item.is_delivered = True
                
                # Credit each seller's balance
                for seller_id, amount in seller_earnings.items():
                    seller = db.query(User).filter(User.id == seller_id).first()
                    if seller:
                        seller.balance += amount
                        
                        transaction = Transaction(
                            user_id=seller_id,
                            amount=amount,
                            type='credit',
                            description=f'Оплата за заказ #{order_id}',
                            balance_after=seller.balance
                        )
                        db.add(transaction)
        
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
