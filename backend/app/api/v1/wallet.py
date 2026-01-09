"""
Wallet endpoints - Virtual wallet functionality
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Transaction
from app.schemas.wallet import (
    WalletBalanceResponse, 
    DepositRequest, 
    TransactionResponse,
    TransactionListResponse
)
from app.api.v1 import get_current_user
from typing import List

router = APIRouter()


@router.get("/balance", response_model=WalletBalanceResponse)
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current wallet balance
    
    Returns the user's current virtual wallet balance
    """
    return WalletBalanceResponse(balance=current_user.balance)


@router.post("/deposit", response_model=WalletBalanceResponse)
def deposit(
    request: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deposit money into wallet (virtual/demo)
    
    In production, this would integrate with a real payment gateway
    For demo purposes, this directly adds money to the wallet
    """
    # Update user balance
    current_user.balance += request.amount
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        amount=request.amount,
        type="deposit",
        description=f"Пополнение кошелька на {request.amount} ₸",
        balance_after=current_user.balance
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(current_user)
    
    return WalletBalanceResponse(balance=current_user.balance)


@router.get("/transactions", response_model=TransactionListResponse)
def get_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get transaction history
    
    Returns a list of all wallet transactions for the current user
    """
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        Transaction.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    total = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).count()
    
    return TransactionListResponse(
        transactions=transactions,
        total=total
    )
