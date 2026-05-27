"""
Custom exception classes for application
"""
from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """Base exception for API errors"""
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(BaseAPIException):
    """Resource not found exception"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedException(BaseAPIException):
    """Unauthorized access exception"""
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(BaseAPIException):
    """Forbidden access exception"""
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)


class BadRequestException(BaseAPIException):
    """Bad request exception"""
    def __init__(self, detail: str = "Bad request"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class ConflictException(BaseAPIException):
    """Conflict exception (e.g., duplicate resource)"""
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)


class ValidationException(BaseAPIException):
    """Validation error exception"""
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class InsufficientStockException(BaseAPIException):
    """Insufficient product stock exception"""
    def __init__(self, detail: str = "Insufficient stock"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class PaymentFailedException(BaseAPIException):
    """Payment processing failed exception"""
    def __init__(self, detail: str = "Payment failed"):
        super().__init__(detail=detail, status_code=status.HTTP_402_PAYMENT_REQUIRED)
