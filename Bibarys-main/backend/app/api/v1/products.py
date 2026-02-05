"""
Product endpoints
"""
from fastapi import APIRouter, Depends, Query, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
import logging
import os
import shutil
from datetime import datetime
from app.db.session import get_db
from app.db.models import User, Product
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
logger = logging.getLogger(__name__)


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


@router.get("/search", response_model=ProductListResponse)
def search_products(
    q: str = Query(..., min_length=2, description="Search query"),
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Advanced product search with filters.
    
    - **q**: Search query (minimum 2 characters) - searches in name and description
    - **category**: Filter by product category
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **in_stock**: Filter by stock availability (true for in stock, false for out of stock)
    - **skip**: Number of items to skip for pagination
    - **limit**: Maximum number of items to return (max 100)
    """
    query = db.query(Product)
    
    # Full-text search
    search_filter = or_(
        Product.name.ilike(f"%{q}%"),
        Product.description.ilike(f"%{q}%")
    )
    query = query.filter(search_filter)
    
    # Category filter
    if category:
        try:
            category_enum = ProductCategory(category)
            query = query.filter(Product.category == category_enum)
        except ValueError:
            # Invalid category, skip filter and log warning
            logger.warning(f"Invalid category filter attempted: {category}")
    
    # Price range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Stock filter
    if in_stock is not None:
        if in_stock:
            query = query.filter(Product.quantity > 0)
        else:
            query = query.filter(Product.quantity == 0)
    
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    # Calculate pagination info
    page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = math.ceil(total / limit) if limit > 0 and total > 0 else 0
    
    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=limit,
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
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    category: str = Form(...),
    image_urls: str = Form("[]"),
    images: List[UploadFile] = File(None),
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new product with optional image uploads
    
    Requires seller or admin role
    """
    import json
    
    # Parse existing image URLs
    existing_urls = json.loads(image_urls) if image_urls else []
    
    # Handle uploaded images
    uploaded_urls = []
    if images:
        # Create upload directory if it doesn't exist
        upload_dir = "static/products"
        os.makedirs(upload_dir, exist_ok=True)
        
        for image in images:
            if image and image.filename:
                # Generate unique filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = os.path.splitext(image.filename)[1]
                filename = f"{timestamp}_{current_user.id}_{image.filename}"
                filepath = os.path.join(upload_dir, filename)
                
                # Save file
                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                
                # Add URL (relative path for serving via /static)
                uploaded_urls.append(f"/static/products/{filename}")
    
    # Combine all image URLs
    all_image_urls = existing_urls + uploaded_urls
    
    # Create product data
    product_data = ProductCreate(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
        category=ProductCategory(category),
        image_urls=all_image_urls if all_image_urls else []
    )
    
    product = ProductService.create_product(db, product_data, current_user.id)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    quantity: int = Form(None),
    category: str = Form(None),
    image_urls: str = Form(None),
    images: List[UploadFile] = File(None),
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Update a product with optional new image uploads
    
    Sellers can only update their own products
    Admins can update any product
    """
    import json
    
    # Parse existing image URLs
    existing_urls = json.loads(image_urls) if image_urls else []
    
    # Handle uploaded images
    uploaded_urls = []
    if images:
        # Create upload directory if it doesn't exist
        upload_dir = "static/products"
        os.makedirs(upload_dir, exist_ok=True)
        
        for image in images:
            if image and image.filename:
                # Generate unique filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = os.path.splitext(image.filename)[1]
                filename = f"{timestamp}_{current_user.id}_{image.filename}"
                filepath = os.path.join(upload_dir, filename)
                
                # Save file
                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                
                # Add URL (relative path for serving via /static)
                uploaded_urls.append(f"/static/products/{filename}")
    
    # Combine all image URLs if any were provided
    all_image_urls = existing_urls + uploaded_urls if (existing_urls or uploaded_urls) else None
    
    # Create update data
    update_dict = {}
    if name is not None:
        update_dict['name'] = name
    if description is not None:
        update_dict['description'] = description
    if price is not None:
        update_dict['price'] = price
    if quantity is not None:
        update_dict['quantity'] = quantity
    if category is not None:
        update_dict['category'] = ProductCategory(category)
    if all_image_urls is not None:
        update_dict['image_urls'] = all_image_urls
    
    product_data = ProductUpdate(**update_dict)
    
    is_admin = current_user.role == UserRole.ADMIN
    product = ProductService.update_product(db, product_id, product_data, current_user.id, is_admin)
    return product


@router.patch("/{product_id}/toggle-active", response_model=ProductResponse)
def toggle_product_active(
    product_id: int,
    current_user: User = Depends(require_seller_or_admin),
    db: Session = Depends(get_db)
):
    """
    Toggle product active status
    
    Automatically switches between active and inactive states.
    Sellers can only toggle their own products
    Admins can toggle any product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise NotFoundException(detail="Product not found")
    
    # Check permissions
    is_admin = current_user.role == UserRole.ADMIN
    if not is_admin and product.seller_id != current_user.id:
        raise NotFoundException(detail="Product not found")
    
    # Toggle active status
    product.is_active = not product.is_active
    db.commit()
    db.refresh(product)
    
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
