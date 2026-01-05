"""
Database seeder script
Creates test users, products, and other data for development
"""
import asyncio
import sys
from datetime import datetime

from app.db.session import SessionLocal
from app.db.models import User, Product, UserRole, ProductCategory
from app.core.security import hash_password

async def seed_database():
    """Seed the database with test data"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Database already has {existing_users} users. Skipping seed.")
            return
        
        # Create admin user
        admin = User(
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        print("✅ Created admin user: admin@example.com / admin123")
        
        # Create seller users
        sellers = []
        for i in range(1, 4):
            seller = User(
                email=f"seller{i}@example.com",
                password_hash=hash_password("seller123"),
                first_name=f"Seller {i}",
                last_name="Shop",
                role=UserRole.SELLER,
                is_active=True,
            )
            db.add(seller)
            sellers.append(seller)
            print(f"✅ Created seller user: seller{i}@example.com / seller123")
        
        # Create customer users
        for i in range(1, 4):
            customer = User(
                email=f"customer{i}@example.com",
                password_hash=hash_password("customer123"),
                first_name=f"Customer {i}",
                last_name="User",
                role=UserRole.CUSTOMER,
                is_active=True,
            )
            db.add(customer)
            print(f"✅ Created customer user: customer{i}@example.com / customer123")
        
        db.commit()
        
        # Refresh to get IDs
        db.refresh(admin)
        for seller in sellers:
            db.refresh(seller)
        
        # Create sample products
        products_data = [
            {
                "name": "MacBook Pro 16",
                "description": "Мощный ноутбук для профессионалов с M3 Pro чипом",
                "price": 2499.99,
                "category": ProductCategory.ELECTRONICS,
                "quantity": 10,
                "seller_id": sellers[0].id,
                "image_urls": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
            },
            {
                "name": "iPhone 15 Pro",
                "description": "Последний флагманский смартфон от Apple",
                "price": 1199.99,
                "category": ProductCategory.ELECTRONICS,
                "quantity": 25,
                "seller_id": sellers[0].id,
                "image_urls": ["https://images.unsplash.com/photo-1592286927505-6597e66e3c98?w=400"],
            },
            {
                "name": "Nike Air Max",
                "description": "Классические спортивные кроссовки",
                "price": 129.99,
                "category": ProductCategory.CLOTHING,
                "quantity": 50,
                "seller_id": sellers[1].id,
                "image_urls": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
            },
            {
                "name": "Python Programming",
                "description": "Полное руководство по программированию на Python",
                "price": 39.99,
                "category": ProductCategory.BOOKS,
                "quantity": 100,
                "seller_id": sellers[1].id,
                "image_urls": ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400"],
            },
            {
                "name": "Gaming Chair",
                "description": "Эргономичное кресло для геймеров",
                "price": 299.99,
                "category": ProductCategory.HOME,
                "quantity": 15,
                "seller_id": sellers[2].id,
                "image_urls": ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400"],
            },
            {
                "name": "Yoga Mat",
                "description": "Профессиональный коврик для йоги",
                "price": 29.99,
                "category": ProductCategory.SPORTS,
                "quantity": 75,
                "seller_id": sellers[2].id,
                "image_urls": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400"],
            },
            {
                "name": "LEGO City Set",
                "description": "Большой набор LEGO для детей от 6 лет",
                "price": 79.99,
                "category": ProductCategory.TOYS,
                "quantity": 30,
                "seller_id": sellers[0].id,
                "image_urls": ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400"],
            },
            {
                "name": "Skincare Set",
                "description": "Комплект средств по уходу за кожей",
                "price": 89.99,
                "category": ProductCategory.BEAUTY,
                "quantity": 40,
                "seller_id": sellers[1].id,
                "image_urls": ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"],
            },
        ]
        
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
        
        db.commit()
        print(f"✅ Created {len(products_data)} sample products")
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📋 Test Users:")
        print("   Admin:     admin@example.com / admin123")
        print("   Sellers:   seller1@example.com / seller123")
        print("              seller2@example.com / seller123")
        print("              seller3@example.com / seller123")
        print("   Customers: customer1@example.com / customer123")
        print("              customer2@example.com / customer123")
        print("              customer3@example.com / customer123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
