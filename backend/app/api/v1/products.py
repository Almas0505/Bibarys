"""
Product endpoints
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import User
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductFilter
)
from app.schemas.common import MessageResponse
from app.services.product_service import ProductService
from app.core.constants import UserRole, ProductCategory
from app.core.exceptions import NotFoundException
from app.api.v1 import get_current_user, require_seller_or_admin
import math

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None, description="Product category"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = None,
    seller_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """
    Get all products with filtering, search, and pagination
    
    - **category**: Filter by product category
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **search**: Search in product name and description
    - **seller_id**: Filter by seller
    - **is_active**: Show only active products (default: true)
    - **sort_by**: Sort field (created_at, price, rating, name)
    - **sort_order**: Sort order (asc, desc)
    - **page**: Page number
    - **page_size**: Items per page
    """
    # Convert category string to enum if provided
    category_enum = None
    if category is not None:
        try:
            category_enum = ProductCategory(category) if isinstance(category, str) else category
        except ValueError:
            # Invalid category, ignore it
            pass
    
    # Create filter object
    filters = ProductFilter(
        category=category_enum,
        min_price=min_price,
        max_price=max_price,
        search=search,
        seller_id=seller_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    # Calculate skip
    skip = (page - 1) * page_size
    
    # Get products
    products, total = ProductService.get_products(db, filters, skip, page_size)
    
    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product by ID
    
    Increments view count
    """
    product = ProductService.get_product_by_id(db, product_id)
    
    if not product:
        raise NotFoundException(detail="Product not found")
    
    # Increment view count
    ProductService.increment_view_count(db, product_id)
    
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new product
    
    Requires seller or admin role
    """
    product = ProductService.create_product(db, product_data, current_user.id)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Update a product
    
    Sellers can only update their own products
    Admins can update any product
    """
    is_admin = current_user.role == UserRole.ADMIN
    product = ProductService.update_product(db, product_id, product_data, current_user.id, is_admin)
    return product


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a product
    
    Sellers can only delete their own products
    Admins can delete any product
    """
    is_admin = current_user.role == UserRole.ADMIN
    ProductService.delete_product(db, product_id, current_user.id, is_admin)
    return MessageResponse(message="Product deleted successfully")
