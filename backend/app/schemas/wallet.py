"""
Wallet schemas for request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TransactionResponse(BaseModel):
    """Transaction response schema"""
    id: int
    user_id: int
    amount: float
    type: str
    description: Optional[str] = None
    balance_after: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class WalletBalanceResponse(BaseModel):
    """Wallet balance response"""
    balance: float


class DepositRequest(BaseModel):
    """Deposit request schema"""
    amount: float = Field(..., gt=0, description="Amount to deposit (must be positive)")


class WithdrawRequest(BaseModel):
    """Withdraw request schema"""
    amount: float = Field(..., gt=0, description="Amount to withdraw (must be positive)")


class TransactionListResponse(BaseModel):
    """Transaction list response"""
    transactions: list[TransactionResponse]
    total: int
