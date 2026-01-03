"""
Application constants and enums
"""
from enum import Enum


class UserRole(str, Enum):
    """User role types"""
    ADMIN = "admin"
    SELLER = "seller"
    CUSTOMER = "customer"


class OrderStatus(str, Enum):
    """Order status types"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    """Payment method types"""
    CARD = "card"
    CASH = "cash"
    WALLET = "wallet"


class PaymentStatus(str, Enum):
    """Payment status types"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class DeliveryMethod(str, Enum):
    """Delivery method types"""
    STANDARD = "standard"
    EXPRESS = "express"
    PICKUP = "pickup"


class ProductCategory(str, Enum):
    """Product category types"""
    ELECTRONICS = "electronics"
    CLOTHING = "clothing"
    BOOKS = "books"
    HOME = "home"
    SPORTS = "sports"
    TOYS = "toys"
    BEAUTY = "beauty"
    FOOD = "food"
    OTHER = "other"


# Delivery costs by method (in cents/smallest currency unit)
DELIVERY_COSTS = {
    DeliveryMethod.STANDARD: 500,  # $5.00
    DeliveryMethod.EXPRESS: 1500,  # $15.00
    DeliveryMethod.PICKUP: 0,      # Free
}
