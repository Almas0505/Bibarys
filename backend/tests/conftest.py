"""
Test configuration and fixtures
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.models import User, Product
from app.core.security import hash_password
from app.core.constants import UserRole, ProductCategory


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create test database and tables"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create test client"""
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    """Create test user"""
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpassword"),
        first_name="Test",
        last_name="User",
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def test_seller(test_db):
    """Create test seller"""
    seller = User(
        email="seller@example.com",
        password_hash=hash_password("sellerpassword"),
        first_name="Test",
        last_name="Seller",
        role=UserRole.SELLER,
        is_active=True,
        is_verified=True
    )
    test_db.add(seller)
    test_db.commit()
    test_db.refresh(seller)
    return seller


@pytest.fixture
def test_product(test_db, test_seller):
    """Create test product"""
    product = Product(
        name="Test Product",
        description="Test Description",
        price=99.99,
        quantity=10,
        category=ProductCategory.ELECTRONICS,
        seller_id=test_seller.id,
        image_urls=["https://example.com/image.jpg"],
        rating=4.5,
        review_count=10,
        is_active=True
    )
    test_db.add(product)
    test_db.commit()
    test_db.refresh(product)
    return product


@pytest.fixture
def auth_token(client, test_user):
    """Get authentication token for test user"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    return response.json()["access_token"]
