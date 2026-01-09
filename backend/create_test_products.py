"""
Create test products with realistic data in Tenge (₸)
Run this script to populate the database with sample products
"""
from app.db.session import SessionLocal, init_db
from app.db.models import User, Product
from app.core.constants import UserRole, ProductCategory
import random

def create_test_products():
    """Create 20+ test products with realistic data in Tenge"""
    
    # Initialize database
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Get a seller user (or create one)
        seller = db.query(User).filter(User.role == UserRole.SELLER).first()
        
        if not seller:
            print("⚠️  No seller found. Creating default seller...")
            from app.core.security import hash_password
            seller = User(
                email="seller@test.com",
                password_hash=hash_password("password123"),
                role=UserRole.SELLER,
                first_name="Test",
                last_name="Seller",
                is_active=True,
                is_verified=True
            )
            db.add(seller)
            db.commit()
            db.refresh(seller)
            print(f"✓ Created seller: {seller.email}")
        
        products_data = [
            # Electronics
            {
                "name": "iPhone 15 Pro Max 256GB",
                "description": "Новейший флагманский смартфон от Apple с A17 Pro чипом, титановым корпусом и улучшенной камерой",
                "price": 649990,
                "quantity": 25,
                "category": ProductCategory.ELECTRONICS,
                "image_urls": ["https://via.placeholder.com/400x400?text=iPhone+15+Pro"],
                "rating": 4.8
            },
            {
                "name": "MacBook Air M3 13 дюймов",
                "description": "Легкий и мощный ноутбук с чипом M3, до 18 часов автономной работы",
                "price": 899990,
                "quantity": 15,
                "category": ProductCategory.ELECTRONICS,
                "image_urls": ["https://via.placeholder.com/400x400?text=MacBook+Air"],
                "rating": 4.9
            },
            {
                "name": "Sony WH-1000XM5 Наушники",
                "description": "Беспроводные наушники с активным шумоподавлением премиум класса",
                "price": 199990,
                "quantity": 40,
                "category": ProductCategory.ELECTRONICS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Sony+WH-1000XM5"],
                "rating": 4.7
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "Флагманский смартфон Samsung с AI функциями и S Pen",
                "price": 599990,
                "quantity": 30,
                "category": ProductCategory.ELECTRONICS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Galaxy+S24"],
                "rating": 4.6
            },
            {
                "name": "iPad Pro 12.9 M2",
                "description": "Профессиональный планшет с чипом M2 и Liquid Retina XDR дисплеем",
                "price": 749990,
                "quantity": 20,
                "category": ProductCategory.ELECTRONICS,
                "image_urls": ["https://via.placeholder.com/400x400?text=iPad+Pro"],
                "rating": 4.8
            },
            
            # Clothing
            {
                "name": "Nike Air Max 90",
                "description": "Классические кроссовки Nike с культовым дизайном и Air подушкой",
                "price": 89990,
                "quantity": 50,
                "category": ProductCategory.CLOTHING,
                "image_urls": ["https://via.placeholder.com/400x400?text=Nike+Air+Max"],
                "rating": 4.5
            },
            {
                "name": "Levi's 501 Original Jeans",
                "description": "Оригинальные джинсы Levi's прямого кроя, 100% хлопок",
                "price": 45990,
                "quantity": 60,
                "category": ProductCategory.CLOTHING,
                "image_urls": ["https://via.placeholder.com/400x400?text=Levis+501"],
                "rating": 4.6
            },
            {
                "name": "The North Face Куртка",
                "description": "Зимняя пуховая куртка с водоотталкивающим покрытием",
                "price": 129990,
                "quantity": 35,
                "category": ProductCategory.CLOTHING,
                "image_urls": ["https://via.placeholder.com/400x400?text=North+Face"],
                "rating": 4.7
            },
            {
                "name": "Adidas Originals Hoodie",
                "description": "Классическое худи с трилистником Adidas",
                "price": 39990,
                "quantity": 70,
                "category": ProductCategory.CLOTHING,
                "image_urls": ["https://via.placeholder.com/400x400?text=Adidas+Hoodie"],
                "rating": 4.4
            },
            
            # Books
            {
                "name": "Clean Code - Robert Martin",
                "description": "Руководство по написанию чистого и поддерживаемого кода",
                "price": 15990,
                "quantity": 100,
                "category": ProductCategory.BOOKS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Clean+Code"],
                "rating": 4.9
            },
            {
                "name": "Atomic Habits - James Clear",
                "description": "Как выработать хорошие привычки и избавиться от плохих",
                "price": 12990,
                "quantity": 80,
                "category": ProductCategory.BOOKS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Atomic+Habits"],
                "rating": 4.8
            },
            {
                "name": "Sapiens - Yuval Noah Harari",
                "description": "Краткая история человечества от каменного века до XXI века",
                "price": 14990,
                "quantity": 90,
                "category": ProductCategory.BOOKS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Sapiens"],
                "rating": 4.7
            },
            {
                "name": "1984 - George Orwell",
                "description": "Культовая антиутопия о тоталитарном обществе",
                "price": 8990,
                "quantity": 120,
                "category": ProductCategory.BOOKS,
                "image_urls": ["https://via.placeholder.com/400x400?text=1984"],
                "rating": 4.8
            },
            
            # Home
            {
                "name": "Dyson V15 Detect Пылесос",
                "description": "Беспроводной пылесос с лазерным обнаружением пыли",
                "price": 449990,
                "quantity": 12,
                "category": ProductCategory.HOME,
                "image_urls": ["https://via.placeholder.com/400x400?text=Dyson+V15"],
                "rating": 4.7
            },
            {
                "name": "KitchenAid Миксер",
                "description": "Профессиональный кухонный миксер с чашей 4.8л",
                "price": 189990,
                "quantity": 18,
                "category": ProductCategory.HOME,
                "image_urls": ["https://via.placeholder.com/400x400?text=KitchenAid"],
                "rating": 4.8
            },
            {
                "name": "Philips Hue Smart Лампы",
                "description": "Умные лампочки с RGB подсветкой, набор из 3 штук",
                "price": 49990,
                "quantity": 45,
                "category": ProductCategory.HOME,
                "image_urls": ["https://via.placeholder.com/400x400?text=Philips+Hue"],
                "rating": 4.6
            },
            
            # Sports
            {
                "name": "Wilson NBA Баскетбольный мяч",
                "description": "Официальный мяч NBA, размер 7, для зала и улицы",
                "price": 25990,
                "quantity": 55,
                "category": ProductCategory.SPORTS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Wilson+NBA"],
                "rating": 4.5
            },
            {
                "name": "Yoga Mat Premium",
                "description": "Профессиональный коврик для йоги, экологичный TPE материал",
                "price": 19990,
                "quantity": 65,
                "category": ProductCategory.SPORTS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Yoga+Mat"],
                "rating": 4.6
            },
            {
                "name": "Набор гантелей 20кг",
                "description": "Регулируемые гантели с подставкой для домашних тренировок",
                "price": 59990,
                "quantity": 28,
                "category": ProductCategory.SPORTS,
                "image_urls": ["https://via.placeholder.com/400x400?text=Dumbbells"],
                "rating": 4.7
            },
            
            # Beauty
            {
                "name": "Clinique Moisture Surge",
                "description": "Увлажняющий крем для лица 72-часового действия",
                "price": 29990,
                "quantity": 40,
                "category": ProductCategory.BEAUTY,
                "image_urls": ["https://via.placeholder.com/400x400?text=Clinique"],
                "rating": 4.6
            },
            {
                "name": "L'Oréal Paris Набор для волос",
                "description": "Шампунь, кондиционер и маска для восстановления волос",
                "price": 15990,
                "quantity": 75,
                "category": ProductCategory.BEAUTY,
                "image_urls": ["https://via.placeholder.com/400x400?text=LOreal"],
                "rating": 4.4
            },
            
            # Food
            {
                "name": "Казахстанский горный мёд",
                "description": "Натуральный мёд из горных районов Казахстана, 1кг",
                "price": 12990,
                "quantity": 85,
                "category": ProductCategory.FOOD,
                "image_urls": ["https://via.placeholder.com/400x400?text=Honey"],
                "rating": 4.9
            },
            {
                "name": "Кумыс натуральный",
                "description": "Традиционный казахский напиток из кобыльего молока, 1л",
                "price": 3990,
                "quantity": 50,
                "category": ProductCategory.FOOD,
                "image_urls": ["https://via.placeholder.com/400x400?text=Kumis"],
                "rating": 4.7
            },
            {
                "name": "Шубат",
                "description": "Напиток из верблюжьего молока, 1л",
                "price": 4990,
                "quantity": 45,
                "category": ProductCategory.FOOD,
                "image_urls": ["https://via.placeholder.com/400x400?text=Shubat"],
                "rating": 4.6
            },
        ]
        
        created_count = 0
        
        for product_data in products_data:
            # Check if product already exists
            existing_product = db.query(Product).filter(
                Product.name == product_data["name"]
            ).first()
            
            if existing_product:
                print(f"  ⚠️  Product '{product_data['name']}' already exists")
                continue
            
            # Create new product
            new_product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                quantity=product_data["quantity"],
                category=product_data["category"],
                seller_id=seller.id,
                image_urls=product_data["image_urls"],
                rating=product_data["rating"],
                review_count=random.randint(10, 200),
                is_active=True,
                view_count=random.randint(100, 5000)
            )
            
            db.add(new_product)
            created_count += 1
            print(f"  ✓ Created: {product_data['name']} - {product_data['price']:,} ₸")
        
        # Commit all changes
        db.commit()
        
        print("\n" + "="*80)
        print(f"✅ Successfully created {created_count} test products!")
        print("="*80)
        print(f"\nAll prices are in Tenge (₸)")
        print(f"Seller: {seller.email}")
        print(f"Total products in database: {db.query(Product).count()}")
        print("="*80)
        
    except Exception as e:
        print(f"❌ Error creating test products: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Creating test products with Tenge prices...\n")
    create_test_products()
