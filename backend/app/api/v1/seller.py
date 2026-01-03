"""
Seller endpoints - Seller-specific functions
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, Product, Order, OrderItem
from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse, OrderListResponse
from app.api.v1 import require_seller_or_admin
from pydantic import BaseModel
import math

router = APIRouter()


class SellerStats(BaseModel):
    """Seller statistics"""
    total_products: int
    active_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int


@router.get("/analytics", response_model=SellerStats)
def get_seller_analytics(
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get seller analytics and statistics
    
    Requires seller or admin role
    """
    from app.core.constants import OrderStatus
    from sqlalchemy import func
    
    # Get products stats
    total_products = db.query(Product).filter(Product.seller_id == current_user.id).count()
    active_products = db.query(Product).filter(
        Product.seller_id == current_user.id,
        Product.is_active == True
    ).count()
    
    # Get orders with seller's products
    seller_order_items = db.query(OrderItem).filter(OrderItem.seller_id == current_user.id).all()
    order_ids = list(set(item.order_id for item in seller_order_items))
    
    total_orders = len(order_ids)
    
    # Calculate revenue from completed orders
    revenue = 0.0
    pending_orders_count = 0
    
    for order_id in order_ids:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            if order.status in [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED]:
                # Calculate seller's portion of this order
                seller_items = db.query(OrderItem).filter(
                    OrderItem.order_id == order_id,
                    OrderItem.seller_id == current_user.id
                ).all()
                
                for item in seller_items:
                    revenue += item.price_at_purchase * item.quantity
            
            if order.status == OrderStatus.PENDING:
                pending_orders_count += 1
    
    return SellerStats(
        total_products=total_products,
        active_products=active_products,
        total_orders=total_orders,
        total_revenue=revenue,
        pending_orders=pending_orders_count
    )


@router.get("/products", response_model=List[ProductResponse])
def get_seller_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get seller's products
    
    Requires seller or admin role
    """
    products = (
        db.query(Product)
        .filter(Product.seller_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return products


@router.get("/orders", response_model=OrderListResponse)
def get_seller_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get orders containing seller's products
    
    Requires seller or admin role
    """
    from app.services.order_service import OrderService
    
    skip = (page - 1) * page_size
    orders, total = OrderService.get_seller_orders(db, current_user.id, skip, page_size)
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
