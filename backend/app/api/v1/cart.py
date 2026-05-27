"""
Shopping cart endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, CartItem, Product
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException, BadRequestException
from app.api.v1 import get_current_user
from pydantic import BaseModel

router = APIRouter()


class CartItemAdd(BaseModel):
    """Schema for adding item to cart"""
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""
    quantity: int


class CartItemResponse(BaseModel):
    """Schema for cart item response"""
    id: int
    product_id: int
    quantity: int
    product_name: str
    product_price: float
    product_image: str
    subtotal: float
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """Schema for cart response"""
    items: List[CartItemResponse]
    total_items: int
    total_price: float


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's shopping cart
    """
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    # Build response
    items = []
    total_price = 0.0
    total_items = 0
    
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        
        if product:
            subtotal = product.price * cart_item.quantity
            total_price += subtotal
            total_items += cart_item.quantity
            
            items.append(CartItemResponse(
                id=cart_item.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                product_name=product.name,
                product_price=product.price,
                product_image=product.image_urls[0] if product.image_urls else "",
                subtotal=subtotal
            ))
    
    return CartResponse(
        items=items,
        total_items=total_items,
        total_price=total_price
    )


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add product to cart
    
    If product already in cart, increase quantity
    """
    # Check if product exists and is active
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    
    if not product:
        raise NotFoundException(detail="Product not found")
    
    if not product.is_active:
        raise BadRequestException(detail="Product is not available")
    
    if item_data.quantity <= 0:
        raise BadRequestException(detail="Quantity must be positive")
    
    if item_data.quantity > product.quantity:
        raise BadRequestException(detail=f"Only {product.quantity} items available in stock")
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item_data.quantity
        
        if new_quantity > product.quantity:
            raise BadRequestException(detail=f"Only {product.quantity} items available in stock")
        
        existing_item.quantity = new_quantity
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
    
    db.commit()
    
    return MessageResponse(message="Product added to cart successfully")


@router.put("/{item_id}", response_model=MessageResponse)
def update_cart_item(
    item_id: int,
    update_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update cart item quantity
    """
    # Get cart item
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise NotFoundException(detail="Cart item not found")
    
    # Check product availability
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    
    if not product:
        raise NotFoundException(detail="Product not found")
    
    if update_data.quantity <= 0:
        raise BadRequestException(detail="Quantity must be positive")
    
    if update_data.quantity > product.quantity:
        raise BadRequestException(detail=f"Only {product.quantity} items available in stock")
    
    # Update quantity
    cart_item.quantity = update_data.quantity
    db.commit()
    
    return MessageResponse(message="Cart item updated successfully")


@router.delete("/{item_id}", response_model=MessageResponse)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove item from cart
    """
    # Get cart item
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise NotFoundException(detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    
    return MessageResponse(message="Item removed from cart successfully")


@router.delete("", response_model=MessageResponse)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all items from cart
    """
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return MessageResponse(message="Cart cleared successfully")
