"""
API v1 endpoints
Authentication dependency for protected routes
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import User
from app.core.security import verify_access_token
from app.core.exceptions import UnauthorizedException
from app.core.constants import UserRole

# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
    
    Returns:
        Current user
    
    Raises:
        UnauthorizedException: If token is invalid or user not found
    """
    try:
        # Verify token
        payload = verify_access_token(credentials.credentials)
        user_id_str: str = payload.get("sub")
        
        if user_id_str is None:
            raise UnauthorizedException(detail="Could not validate credentials")
        
        # Convert user_id from string to int
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise UnauthorizedException(detail="Invalid user ID in token")
        
    except UnauthorizedException:
        raise
    except Exception as e:
        # Log the actual error for debugging
        import logging
        logging.error(f"Token validation error: {type(e).__name__}: {str(e)}")
        raise UnauthorizedException(detail="Could not validate credentials")
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise UnauthorizedException(detail="User not found")
    
    if not user.is_active:
        raise UnauthorizedException(detail="User is inactive")
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: UserRole):
    """
    Dependency factory to require specific role
    
    Args:
        required_role: Required user role
    
    Returns:
        Dependency function
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return current_user
    
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_seller_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require seller or admin role"""
    if current_user.role not in [UserRole.SELLER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller or admin access required"
        )
    return current_user
