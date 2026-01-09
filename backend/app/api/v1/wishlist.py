"""
Wishlist endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, Wishlist, Product
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException
from app.api.v1 import get_current_user
from pydantic import BaseModel

router = APIRouter()


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_image: str
    product_rating: float
    product_quantity: int
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's wishlist"""
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    
    result = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            result.append(WishlistItemResponse(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                product_image=product.image_urls[0] if product.image_urls else "",
                product_rating=product.rating,
                product_quantity=product.quantity
            ))
    
    return result


@router.post("/{product_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add product to wishlist"""
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
        return MessageResponse(message="Product already in wishlist")
    
    # Add to wishlist
    wishlist_item = Wishlist(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(wishlist_item)
    db.commit()
    
    return MessageResponse(message="Product added to wishlist")


@router.delete("/{product_id}", response_model=MessageResponse)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove product from wishlist"""
    item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if not item:
        raise NotFoundException(detail="Product not in wishlist")
    
    db.delete(item)
    db.commit()
    
    return MessageResponse(message="Product removed from wishlist")


@router.delete("", response_model=MessageResponse)
def clear_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all items from wishlist"""
    db.query(Wishlist).filter(Wishlist.user_id == current_user.id).delete()
    db.commit()
    
    return MessageResponse(message="Wishlist cleared")
