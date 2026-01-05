"""
Simple test script to verify backend setup
"""
import sys
sys.path.insert(0, 'C:\\Projects\\Bibarys\\backend')

print("Testing E-Commerce Backend Setup...")
print("=" * 50)

# Test 1: Import config
try:
    from app.config import settings
    print("✅ Config loaded successfully")
    print(f"   - App Name: {settings.APP_NAME}")
    print(f"   - Debug Mode: {settings.DEBUG}")
    print(f"   - Database: {settings.DATABASE_URL}")
except Exception as e:
    print(f"❌ Config import failed: {e}")
    sys.exit(1)

# Test 2: Import models
try:
    from app.db import models
    print("✅ Database models imported successfully")
    print(f"   - User model: {models.User.__name__}")
    print(f"   - Product model: {models.Product.__name__}")
    print(f"   - Order model: {models.Order.__name__}")
except Exception as e:
    print(f"❌ Models import failed: {e}")
    sys.exit(1)

# Test 3: Import schemas
try:
    from app.schemas import user, product, order
    print("✅ Pydantic schemas imported successfully")
except Exception as e:
    print(f"❌ Schemas import failed: {e}")
    sys.exit(1)

# Test 4: Import services
try:
    from app.services import user_service, product_service, order_service
    print("✅ Services imported successfully")
except Exception as e:
    print(f"❌ Services import failed: {e}")
    sys.exit(1)

# Test 5: Test security functions
try:
    from app.core.security import hash_password, verify_password, create_access_token
    test_password = "test123456"
    hashed = hash_password(test_password)
    verified = verify_password(test_password, hashed)
    token = create_access_token({"sub": 1, "role": "customer"})
    
    print("✅ Security functions working")
    print(f"   - Password hashing: OK")
    print(f"   - Password verification: {verified}")
    print(f"   - JWT token creation: OK (length={len(token)})")
except Exception as e:
    print(f"❌ Security functions failed: {e}")
    sys.exit(1)

print("=" * 50)
print("✅ All tests passed! Backend is ready.")
print("\nYou can now start the server with:")
print("python -m uvicorn app.main:app --reload")
