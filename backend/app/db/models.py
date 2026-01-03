"""
SQLAlchemy ORM models for all database tables
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import BaseModel
from app.core.constants import UserRole, OrderStatus, PaymentMethod, PaymentStatus, ProductCategory


class User(BaseModel):
    """User model - supports Admin, Seller, Customer roles"""
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="seller", foreign_keys="Product.seller_id")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


class Product(BaseModel):
    """Product model"""
    __tablename__ = "products"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)  # Price in dollars (or main currency unit)
    quantity = Column(Integer, default=0, nullable=False)  # Stock quantity
    category = Column(SQLEnum(ProductCategory), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_urls = Column(JSON, default=list, nullable=False)  # List of image URLs
    rating = Column(Float, default=0.0, nullable=False)  # Average rating 0-5
    review_count = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    seller = relationship("User", back_populates="products", foreign_keys=[seller_id])
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")


class Order(BaseModel):
    """Order model"""
    __tablename__ = "orders"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    total_price = Column(Float, nullable=False)  # Total including delivery
    delivery_method = Column(String(50), nullable=False)
    delivery_cost = Column(Float, nullable=False)
    delivery_address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    tracking_number = Column(String(100), nullable=True, unique=True)
    estimated_delivery = Column(String(100), nullable=True)  # Date string or range
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(BaseModel):
    """Order item model - products in an order"""
    __tablename__ = "order_items"
    
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False)  # Price at time of purchase
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # For seller tracking
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    seller = relationship("User", foreign_keys=[seller_id])


class Review(BaseModel):
    """Product review model"""
    __tablename__ = "reviews"
    
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255), nullable=True)
    text = Column(Text, nullable=True)
    images = Column(JSON, default=list, nullable=False)  # List of image URLs
    helpful_count = Column(Integer, default=0, nullable=False)
    verified_purchase = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Payment(BaseModel):
    """Payment model"""
    __tablename__ = "payments"
    
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True, index=True)
    amount = Column(Float, nullable=False)
    method = Column(SQLEnum(PaymentMethod), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    transaction_id = Column(String(255), nullable=True, unique=True)  # External payment ID
    
    # Relationships
    order = relationship("Order", back_populates="payment")


class Wishlist(BaseModel):
    """Wishlist model - user's favorite products"""
    __tablename__ = "wishlist"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")


class CartItem(BaseModel):
    """Shopping cart item model"""
    __tablename__ = "cart_items"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
