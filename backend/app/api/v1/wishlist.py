"""
Wishlist endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, Wishlist, Product
from app.schemas.product import ProductResponse
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException, BadRequestException
from app.api.v1 import get_current_user

router = APIRouter()


@router.get("", response_model=List[ProductResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's wishlist
    
    Returns list of products
    """
    wishlist_items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    
    products = []
    for item in wishlist_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            products.append(product)
    
    return products


@router.post("/{product_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add product to wishlist
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise NotFoundException(detail="Product not found")
    
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if existing:
        raise BadRequestException(detail="Product already in wishlist")
    
    # Add to wishlist
    wishlist_item = Wishlist(
        user_id=current_user.id,
        product_id=product_id
    )
    
    db.add(wishlist_item)
    db.commit()
    
    return MessageResponse(message="Product added to wishlist successfully")


@router.delete("/{product_id}", response_model=MessageResponse)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove product from wishlist
    """
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if not wishlist_item:
        raise NotFoundException(detail="Product not in wishlist")
    
    db.delete(wishlist_item)
    db.commit()
    
    return MessageResponse(message="Product removed from wishlist successfully")


@router.get("/check/{product_id}")
def check_in_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if product is in wishlist
    """
    exists = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first() is not None
    
    return {"in_wishlist": exists}
