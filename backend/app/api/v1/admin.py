"""
Admin endpoints - Administrative functions
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.db.models import User, Order, Product
from app.schemas.user import UserResponse, UserAdminUpdate
from app.schemas.order import OrderResponse, OrderListResponse, OrderFilter
from app.schemas.product import ProductResponse
from app.schemas.common import MessageResponse
from app.services.user_service import UserService
from app.services.order_service import OrderService
from app.core.exceptions import NotFoundException
from app.api.v1 import require_admin
from pydantic import BaseModel
import math

router = APIRouter()


class PlatformStats(BaseModel):
    """Platform-wide statistics"""
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    active_users: int
    active_products: int


@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get platform-wide statistics
    
    Requires admin role
    """
    from app.core.constants import OrderStatus
    from sqlalchemy import func
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    
    # Calculate total revenue
    revenue = db.query(func.sum(Order.total_price)).filter(
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED])
    ).scalar() or 0.0
    
    return PlatformStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=revenue,
        active_users=active_users,
        active_products=active_products
    )


class DashboardStats(BaseModel):
    """Admin dashboard statistics"""
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int
    active_sellers: int


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics
    
    Requires admin role
    """
    from app.core.constants import UserRole, OrderStatus
    
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    # Calculate total revenue from completed orders
    from sqlalchemy import func
    revenue = db.query(func.sum(Order.total_price)).filter(
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED])
    ).scalar() or 0.0
    
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    active_sellers = db.query(User).filter(User.role == UserRole.SELLER, User.is_active == True).count()
    
    return DashboardStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=revenue,
        pending_orders=pending_orders,
        active_sellers=active_sellers
    )


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all users
    
    Requires admin role
    """
    users, total = UserService.get_all_users(db, skip, limit)
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get user by ID
    
    Requires admin role
    """
    user = UserService.get_user_by_id(db, user_id)
    
    if not user:
        raise NotFoundException(detail="User not found")
    
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserAdminUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user (admin can change role, active status, etc.)
    
    Requires admin role
    """
    user = UserService.update_user_by_admin(db, user_id, user_data)
    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user
    
    Requires admin role
    """
    UserService.delete_user(db, user_id)
    return MessageResponse(message="User deleted successfully")


@router.patch("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Toggle user active status
    
    Automatically switches between active and inactive states.
    
    Requires admin role
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise NotFoundException(detail="User not found")
    
    # Toggle active status
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/orders", response_model=OrderListResponse)
def get_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    user_id: int = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all orders with filtering
    
    Requires admin role
    """
    from app.core.constants import OrderStatus
    
    # Parse status
    order_status = None
    if status:
        try:
            order_status = OrderStatus(status)
        except ValueError:
            pass
    
    filters = OrderFilter(
        status=order_status,
        user_id=user_id
    )
    
    skip = (page - 1) * page_size
    orders, total = OrderService.get_all_orders(db, filters, skip, page_size)
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/products", response_model=List[ProductResponse])
def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all products (including inactive)
    
    Requires admin role
    """
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@router.get("/export/pdf")
def export_analytics_pdf(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Export comprehensive analytics data to PDF
    
    Generates a detailed PDF report with platform statistics, seller stats,
    category stats, top sellers, top customers, recent orders, and top products.
    All prices are displayed in Tenge (₸).
    
    Requires admin role
    """
    from fastapi.responses import FileResponse
    from app.services.pdf_service import PDFService
    from app.core.constants import UserRole, OrderStatus
    from sqlalchemy import func
    import os
    
    # Get dashboard statistics
    stats = get_dashboard_stats(current_user, db)
    
    # Get seller statistics
    total_sellers = db.query(User).filter(User.role == UserRole.SELLER).count()
    active_sellers = db.query(User).filter(
        User.role == UserRole.SELLER,
        User.is_active == True
    ).count()
    
    # Get customers statistics
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    active_customers = db.query(User).filter(
        User.role == UserRole.CUSTOMER,
        User.is_active == True
    ).count()
    
    # Category statistics
    category_stats = db.query(
        Product.category,
        func.count(Product.id).label('count'),
        func.sum(Product.quantity).label('total_stock')
    ).group_by(Product.category).all()
    
    # Top sellers by revenue
    top_sellers = db.query(
        User.id,
        User.first_name,
        User.last_name,
        User.email,
        func.count(func.distinct(Product.id)).label('products_count'),
        func.sum(Product.view_count).label('total_views')
    ).join(Product, User.id == Product.seller_id).filter(
        User.role == UserRole.SELLER
    ).group_by(User.id, User.first_name, User.last_name, User.email).order_by(
        func.count(func.distinct(Product.id)).desc()
    ).limit(10).all()
    
    # Top customers by spending
    from app.db.models import OrderItem
    top_customers = db.query(
        User.id,
        User.first_name,
        User.last_name,
        User.email,
        func.count(func.distinct(Order.id)).label('orders_count'),
        func.sum(Order.total_price).label('total_spent')
    ).join(Order, User.id == Order.user_id).filter(
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING])
    ).group_by(User.id, User.first_name, User.last_name, User.email).order_by(
        func.sum(Order.total_price).desc()
    ).limit(10).all()
    
    # Get recent orders
    orders_response = get_all_orders(1, 20, None, None, current_user, db)
    orders = orders_response.items
    
    # Get top products (sorted by rating)
    products = db.query(Product).filter(
        Product.is_active == True
    ).order_by(
        Product.rating.desc()
    ).limit(20).all()
    
    # Compile all stats
    extended_stats = {
        **stats.dict(),
        'total_sellers': total_sellers,
        'active_sellers_count': active_sellers,
        'total_customers': total_customers,
        'active_customers': active_customers,
        'category_stats': [
            {
                'category': cat.category,
                'count': cat.count,
                'total_stock': cat.total_stock or 0
            }
            for cat in category_stats
        ],
        'top_sellers': [
            {
                'name': f"{seller.first_name} {seller.last_name}",
                'email': seller.email,
                'products_count': seller.products_count,
                'total_views': seller.total_views or 0
            }
            for seller in top_sellers
        ],
        'top_customers': [
            {
                'name': f"{customer.first_name} {customer.last_name}",
                'email': customer.email,
                'orders_count': customer.orders_count,
                'total_spent': float(customer.total_spent or 0)
            }
            for customer in top_customers
        ]
    }
    
    # Generate PDF
    pdf_path = PDFService.generate_admin_report(
        stats=extended_stats,
        orders=orders,
        products=products
    )
    
    # Return PDF file with CORS headers
    response = FileResponse(
        pdf_path,
        media_type='application/pdf',
        filename=f"bibarys_admin_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
    )
    
    # Add CORS headers explicitly for file downloads
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

