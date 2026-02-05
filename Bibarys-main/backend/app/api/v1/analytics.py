"""
Analytics endpoints - Business intelligence and reporting
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db.session import get_db
from app.db.models import User, Product, Order, OrderItem
from app.api.v1 import require_admin
from pydantic import BaseModel

router = APIRouter()


class TopProduct(BaseModel):
    """Top product statistics"""
    product_id: int
    product_name: str
    total_sold: int
    total_revenue: float


class RevenueByPeriod(BaseModel):
    """Revenue statistics by time period"""
    period: str
    revenue: float
    orders_count: int


class CategoryStats(BaseModel):
    """Statistics by product category"""
    category: str
    products_count: int
    total_revenue: float
    avg_rating: float


@router.get("/dashboard")
def get_analytics_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics dashboard
    
    Requires admin role
    """
    from app.core.constants import OrderStatus, UserRole
    from sqlalchemy import func
    
    # Overall stats
    total_users = db.query(User).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_sellers = db.query(User).filter(User.role == UserRole.SELLER).count()
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    
    # Revenue
    total_revenue = db.query(func.sum(Order.total_price)).filter(
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED])
    ).scalar() or 0.0
    
    # Orders by status
    orders_by_status = {}
    for status in OrderStatus:
        count = db.query(Order).filter(Order.status == status).count()
        orders_by_status[status.value] = count
    
    return {
        "users": {
            "total": total_users,
            "customers": total_customers,
            "sellers": total_sellers
        },
        "products": {
            "total": total_products,
            "active": active_products
        },
        "orders": {
            "total": total_orders,
            "by_status": orders_by_status
        },
        "revenue": {
            "total": total_revenue
        }
    }


@router.get("/top-products", response_model=List[TopProduct])
def get_top_products(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get top selling products
    
    Requires admin role
    """
    from sqlalchemy import func
    
    # Get products with most sales
    top_products = (
        db.query(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('total_revenue')
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    
    return [
        TopProduct(
            product_id=p.id,
            product_name=p.name,
            total_sold=p.total_sold or 0,
            total_revenue=p.total_revenue or 0.0
        )
        for p in top_products
    ]


@router.get("/revenue", response_model=List[RevenueByPeriod])
def get_revenue_by_period(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get revenue statistics by time period
    
    Requires admin role
    """
    from app.core.constants import OrderStatus
    from sqlalchemy import func
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get orders in date range
    orders = db.query(Order).filter(
        Order.created_at >= start_date,
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED])
    ).all()
    
    # Group by day
    revenue_by_day = {}
    
    for order in orders:
        day_key = order.created_at.strftime('%Y-%m-%d')
        
        if day_key not in revenue_by_day:
            revenue_by_day[day_key] = {
                'revenue': 0.0,
                'orders_count': 0
            }
        
        revenue_by_day[day_key]['revenue'] += order.total_price
        revenue_by_day[day_key]['orders_count'] += 1
    
    # Convert to list
    result = [
        RevenueByPeriod(
            period=day,
            revenue=data['revenue'],
            orders_count=data['orders_count']
        )
        for day, data in sorted(revenue_by_day.items())
    ]
    
    return result


@router.get("/categories", response_model=List[CategoryStats])
def get_category_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get statistics by product category
    
    Requires admin role
    """
    from app.core.constants import ProductCategory
    from sqlalchemy import func
    
    stats = []
    
    for category in ProductCategory:
        # Count products
        products_count = db.query(Product).filter(Product.category == category).count()
        
        # Calculate revenue
        revenue = (
            db.query(func.sum(OrderItem.price_at_purchase * OrderItem.quantity))
            .join(Product, OrderItem.product_id == Product.id)
            .filter(Product.category == category)
            .scalar() or 0.0
        )
        
        # Calculate average rating
        avg_rating = (
            db.query(func.avg(Product.rating))
            .filter(Product.category == category)
            .scalar() or 0.0
        )
        
        stats.append(CategoryStats(
            category=category.value,
            products_count=products_count,
            total_revenue=revenue,
            avg_rating=round(avg_rating, 2)
        ))
    
    # Sort by revenue
    stats.sort(key=lambda x: x.total_revenue, reverse=True)
    
    return stats


# Aliases for common endpoint names
@router.get("/sales", response_model=List[RevenueByPeriod])
def get_sales_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Alias for /revenue endpoint"""
    return get_revenue_by_period(days, current_user, db)


@router.get("/products", response_model=List[TopProduct])
def get_product_analytics(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Alias for /top-products endpoint"""
    return get_top_products(limit, current_user, db)


from app.schemas.user import UserResponse

@router.get("/users")
def get_user_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user analytics and statistics"""
    from app.core.constants import UserRole
    from sqlalchemy import func
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    users_by_role = {
        "customers": db.query(User).filter(User.role == UserRole.CUSTOMER).count(),
        "sellers": db.query(User).filter(User.role == UserRole.SELLER).count(),
        "admins": db.query(User).filter(User.role == UserRole.ADMIN).count()
    }
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "users_by_role": users_by_role
    }
