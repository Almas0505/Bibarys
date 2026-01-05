"""
Create test users for each role
"""
from app.db.session import SessionLocal, init_db
from app.db.models import User
from app.core.security import hash_password
from app.core.constants import UserRole


def create_test_users():
    """Create test users for admin, seller, and customer roles"""
    
    # Initialize database (create tables if they don't exist)
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Common password for all test users
        password = "password123"
        hashed_password = hash_password(password)
        
        test_users = [
            {
                "email": "admin@test.com",
                "role": UserRole.ADMIN,
                "first_name": "Admin",
                "last_name": "User"
            },
            {
                "email": "seller@test.com",
                "role": UserRole.SELLER,
                "first_name": "Seller",
                "last_name": "User"
            },
            {
                "email": "customer@test.com",
                "role": UserRole.CUSTOMER,
                "first_name": "Customer",
                "last_name": "User"
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"✓ User {user_data['email']} already exists")
                continue
            
            # Create new user
            new_user = User(
                email=user_data["email"],
                password_hash=hashed_password,
                role=user_data["role"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                is_active=True,
                is_verified=True
            )
            
            db.add(new_user)
            created_users.append(user_data)
            print(f"✓ Created user: {user_data['email']} (role: {user_data['role'].value})")
        
        # Commit all changes
        db.commit()
        
        print("\n" + "="*60)
        print("Test Users Created Successfully!")
        print("="*60)
        print(f"\nPassword for all users: {password}\n")
        print("Login credentials:")
        print("-" * 60)
        for user in test_users:
            print(f"  {user['role'].value.upper():10} | {user['email']:20} | {password}")
        print("-" * 60)
        
    except Exception as e:
        print(f"Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Creating test users...")
    create_test_users()
