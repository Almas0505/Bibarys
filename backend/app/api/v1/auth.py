"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.common import TokenResponse, MessageResponse
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.core.security import create_access_token, create_refresh_token, verify_refresh_token
from app.core.exceptions import UnauthorizedException
from app.api.v1 import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - **email**: Valid email address
    - **password**: Minimum 6 characters
    - **first_name**: User's first name
    - **last_name**: User's last name
    - **role**: User role (customer, seller, admin) - defaults to customer
    """
    # Create user
    user = UserService.create_user(db, user_data)
    
    # Send welcome email (placeholder)
    EmailService.send_welcome_email(user.email, user.first_name)
    
    return user


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    Returns JWT access and refresh tokens
    """
    # Authenticate user
    user = UserService.authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise UnauthorizedException(detail="Incorrect email or password")
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    """
    try:
        # Verify refresh token
        payload = verify_refresh_token(refresh_token)
        user_id_str: str = payload.get("sub")
        
        if user_id_str is None:
            raise UnauthorizedException(detail="Invalid refresh token")
        
        # Convert user_id from string to int
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise UnauthorizedException(detail="Invalid user ID in token")
        
        # Get user
        user = UserService.get_user_by_id(db, user_id)
        
        if not user or not user.is_active:
            raise UnauthorizedException(detail="User not found or inactive")
        
        # Create new tokens
        new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except Exception as e:
        raise UnauthorizedException(detail="Invalid refresh token")


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    
    Requires authentication
    """
    return current_user


@router.get("/logout", response_model=MessageResponse)
def logout():
    """
    Logout endpoint (client should delete tokens)
    
    Since JWT is stateless, logout is handled on the client side
    by removing the tokens from storage
    """
    return MessageResponse(message="Logged out successfully. Please delete tokens from client storage.")
