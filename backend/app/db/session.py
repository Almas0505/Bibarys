"""
Database session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings


# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting database session
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database (create all tables)
    """
    from app.db.base import Base
    from app.db import models  # Import all models
    
    Base.metadata.create_all(bind=engine)
    
    # Migration: add expiry_date column to products table if it doesn't exist
    _run_migrations()


def _run_migrations() -> None:
    """
    Run manual schema migrations for existing databases.
    Safe to run multiple times (idempotent).
    """
    with engine.connect() as conn:
        # Check if expiry_date column exists in products table
        if "sqlite" in str(engine.url):
            from sqlalchemy import text
            result = conn.execute(text("PRAGMA table_info(products)"))
            columns = [row[1] for row in result.fetchall()]
            
            if "expiry_date" not in columns:
                conn.execute(text("ALTER TABLE products ADD COLUMN expiry_date DATE"))
                conn.commit()

