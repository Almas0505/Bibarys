"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict, AliasChoices
from typing import Optional
from datetime import datetime
from app.core.constants import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
    
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    role: Optional[UserRole] = UserRole.CUSTOMER
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
    
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None


class UserChangePassword(BaseModel):
    """Schema for changing password"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserAdminUpdate(BaseModel):
    """Schema for admin updating user (can change role, active status)"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
