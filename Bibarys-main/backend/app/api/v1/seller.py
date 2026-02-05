"""
Seller endpoints - Seller-specific functions
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, Product, Order, OrderItem
from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse, OrderListResponse
from app.api.v1 import require_seller_or_admin
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func
import math
import os

router = APIRouter()


class TopProduct(BaseModel):
    id: int
    name: str
    total_sold: int


class SellerStats(BaseModel):
    """Seller statistics"""
    total_products: int
    active_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int


class SellerAnalytics(BaseModel):
    """Enhanced seller analytics"""
    total_products: int
    total_sales: float
    pending_orders: int
    low_stock_count: int
    monthly_sales: float
    top_products: List[TopProduct]


@router.get("/analytics", response_model=SellerAnalytics)
def get_seller_analytics(
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get seller analytics and statistics
    
    Requires seller or admin role
    """
    from app.core.constants import OrderStatus
    
    # Total products
    total_products = db.query(Product).filter(Product.seller_id == current_user.id).count()
    
    # Total sales (from completed orders)
    total_sales = db.query(func.sum(OrderItem.price_at_purchase * OrderItem.quantity)).join(
        Order
    ).filter(
        OrderItem.seller_id == current_user.id,
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
    ).scalar() or 0.0
    
    # Pending orders count
    pending_orders = db.query(OrderItem).join(Order).filter(
        OrderItem.seller_id == current_user.id,
        Order.status == OrderStatus.PENDING
    ).count()
    
    # Low stock products (quantity < 10)
    low_stock_count = db.query(Product).filter(
        Product.seller_id == current_user.id,
        Product.quantity < 10,
        Product.is_active == True
    ).count()
    
    # Sales this month
    first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_sales = db.query(func.sum(OrderItem.price_at_purchase * OrderItem.quantity)).join(
        Order
    ).filter(
        OrderItem.seller_id == current_user.id,
        Order.created_at >= first_day_of_month,
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
    ).scalar() or 0.0
    
    # Top selling products (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    top_products = db.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem).join(Order).filter(
        Product.seller_id == current_user.id,
        Order.created_at >= thirty_days_ago
    ).group_by(Product.id, Product.name).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(5).all()
    
    return SellerAnalytics(
        total_products=total_products,
        total_sales=total_sales,
        pending_orders=pending_orders,
        low_stock_count=low_stock_count,
        monthly_sales=monthly_sales,
        top_products=[
            TopProduct(id=p.id, name=p.name, total_sold=p.total_sold)
            for p in top_products
        ]
    )


@router.get("/stats", response_model=SellerStats)
def get_seller_stats(
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get basic seller statistics (legacy endpoint)
    
    Requires seller or admin role
    """
    from app.core.constants import OrderStatus
    
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


class TopCustomer(BaseModel):
    """Top customer response"""
    user_id: int
    name: str
    email: str
    orders_count: int
    total_spent: float


@router.get("/top-customers", response_model=List[TopCustomer])
def get_top_customers(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get top customers by total spending on seller's products
    
    Returns the top customers who have purchased the most from this seller,
    sorted by total amount spent.
    
    Requires seller or admin role
    """
    from app.core.constants import OrderStatus
    from sqlalchemy import and_
    
    # Get all orders with seller's products
    top_customers_query = db.query(
        User.id.label('user_id'),
        User.first_name,
        User.last_name,
        User.email,
        func.count(func.distinct(Order.id)).label('orders_count'),
        func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('total_spent')
    ).join(
        Order, User.id == Order.user_id
    ).join(
        OrderItem, Order.id == OrderItem.order_id
    ).filter(
        and_(
            OrderItem.seller_id == current_user.id,
            Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED])
        )
    ).group_by(
        User.id, User.first_name, User.last_name, User.email
    ).order_by(
        func.sum(OrderItem.price_at_purchase * OrderItem.quantity).desc()
    ).limit(limit).all()
    
    # Format response
    top_customers = [
        TopCustomer(
            user_id=customer.user_id,
            name=f"{customer.first_name} {customer.last_name}",
            email=customer.email,
            orders_count=customer.orders_count,
            total_spent=float(customer.total_spent or 0)
        )
        for customer in top_customers_query
    ]
    
    return top_customers


@router.get("/export-pdf")
async def export_seller_pdf(
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Export seller analytics to PDF
    
    Requires seller or admin role
    """
    from app.services.pdf_service import PDFService
    from app.core.constants import OrderStatus
    
    # Get seller statistics
    stats = {
        'seller_name': f"{current_user.first_name} {current_user.last_name}",
        'total_products': db.query(Product).filter(Product.seller_id == current_user.id).count(),
        'active_products': db.query(Product).filter(
            Product.seller_id == current_user.id,
            Product.is_active == True
        ).count(),
        'total_balance': current_user.balance or 0,
    }
    
    # Get orders with seller's products
    seller_orders = db.query(Order).join(OrderItem).filter(
        OrderItem.seller_id == current_user.id
    ).order_by(Order.created_at.desc()).limit(20).all()
    
    # Get seller's products
    seller_products = db.query(Product).filter(
        Product.seller_id == current_user.id
    ).order_by(Product.rating.desc()).limit(10).all()
    
    # Generate PDF
    pdf_path = PDFService.generate_seller_report(stats, seller_orders, seller_products)
    
    # Return with CORS headers
    response = FileResponse(
        pdf_path,
        media_type='application/pdf',
        filename=f'seller_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
    )
    
    # Add CORS headers explicitly for file downloads
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

