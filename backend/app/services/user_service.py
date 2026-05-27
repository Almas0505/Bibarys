"""
User service - Business logic for user operations
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.models import User
from app.schemas.user import UserCreate, UserUpdate, UserAdminUpdate
from app.core.security import hash_password, verify_password
from app.core.exceptions import NotFoundException, ConflictException, BadRequestException


class UserService:
    """Service for user-related operations"""
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user with this email already exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ConflictException(detail="User with this email already exists")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password"""
        user = UserService.get_user_by_email(db, email)
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User:
        """Update user profile"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise NotFoundException(detail="User not found")
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update_user_by_admin(db: Session, user_id: int, user_data: UserAdminUpdate) -> User:
        """Update user by admin (can change role, active status)"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise NotFoundException(detail="User not found")
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> User:
        """Change user password"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise NotFoundException(detail="User not found")
        
        # Verify old password
        if not verify_password(old_password, user.password_hash):
            raise BadRequestException(detail="Old password is incorrect")
        
        # Hash and set new password
        user.password_hash = hash_password(new_password)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> tuple[List[User], int]:
        """Get all users (admin only)"""
        total = db.query(User).count()
        users = db.query(User).offset(skip).limit(limit).all()
        return users, total
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> None:
        """Delete user (admin only)"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise NotFoundException(detail="User not found")
        
        db.delete(user)
        db.commit()
