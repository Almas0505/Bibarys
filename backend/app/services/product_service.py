"""
Product service - Business logic for product operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import Optional, List, Tuple
from app.db.models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductFilter
from app.core.exceptions import NotFoundException, ForbiddenException


class ProductService:
    """Service for product-related operations"""
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate, seller_id: int) -> Product:
        """Create a new product"""
        product = Product(
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            quantity=product_data.quantity,
            category=product_data.category,
            image_urls=product_data.image_urls,
            seller_id=seller_id,
        )
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_data: ProductUpdate,
        user_id: int,
        is_admin: bool = False
    ) -> Product:
        """Update product (only by seller/admin)"""
        product = ProductService.get_product_by_id(db, product_id)
        
        if not product:
            raise NotFoundException(detail="Product not found")
        
        # Check if user is the seller or admin
        if not is_admin and product.seller_id != user_id:
            raise ForbiddenException(detail="You don't have permission to update this product")
        
        # Update fields
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int, user_id: int, is_admin: bool = False) -> None:
        """Delete product (only by seller/admin)"""
        product = ProductService.get_product_by_id(db, product_id)
        
        if not product:
            raise NotFoundException(detail="Product not found")
        
        # Check if user is the seller or admin
        if not is_admin and product.seller_id != user_id:
            raise ForbiddenException(detail="You don't have permission to delete this product")
        
        db.delete(product)
        db.commit()
    
    @staticmethod
    def get_products(
        db: Session,
        filters: ProductFilter,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Product], int]:
        """Get products with filtering and pagination"""
        query = db.query(Product)
        
        # Apply filters
        if filters.category:
            query = query.filter(Product.category == filters.category)
        
        if filters.min_price is not None:
            query = query.filter(Product.price >= filters.min_price)
        
        if filters.max_price is not None:
            query = query.filter(Product.price <= filters.max_price)
        
        if filters.seller_id:
            query = query.filter(Product.seller_id == filters.seller_id)
        
        if filters.is_active is not None:
            query = query.filter(Product.is_active == filters.is_active)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )
        
        # Count total before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Product, filters.sort_by, Product.created_at)
        if filters.sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        products = query.offset(skip).limit(limit).all()
        
        return products, total
    
    @staticmethod
    def increment_view_count(db: Session, product_id: int) -> None:
        """Increment product view count"""
        product = ProductService.get_product_by_id(db, product_id)
        
        if product:
            product.view_count += 1
            db.commit()
    
    @staticmethod
    def update_product_rating(db: Session, product_id: int) -> None:
        """Update product rating based on reviews"""
        from app.db.models import Review
        
        product = ProductService.get_product_by_id(db, product_id)
        
        if not product:
            return
        
        # Calculate average rating
        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        
        if reviews:
            product.rating = sum(r.rating for r in reviews) / len(reviews)
            product.review_count = len(reviews)
        else:
            product.rating = 0.0
            product.review_count = 0
        
        db.commit()
