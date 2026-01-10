"""
Create test food products for grocery store
"""
from app.db.session import SessionLocal, init_db
from app.db.models import Product, User
from app.core.constants import ProductCategory


def create_food_products():
    """Create test food products for grocery store"""
    
    # Initialize database
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Get seller user
        seller = db.query(User).filter(User.email == "seller@test.com").first()
        if not seller:
            print("❌ Seller user not found. Please run create_test_users.py first")
            return
        
        # Food products data
        products_data = [
            # Dairy products
            {
                "name": "Молоко 3.2% 1л",
                "description": "Свежее пастеризованное молоко высшего качества",
                "price": 450,
                "quantity": 50,
                "category": ProductCategory.DAIRY,
                "image_urls": ["https://placehold.co/400x400/e3f2fd/1976d2?text=Молоко"]
            },
            {
                "name": "Сметана 20% 500г",
                "description": "Натуральная сметана из свежих сливок",
                "price": 650,
                "quantity": 30,
                "category": ProductCategory.DAIRY,
                "image_urls": ["https://placehold.co/400x400/e3f2fd/1976d2?text=Сметана"]
            },
            {
                "name": "Творог 9% 200г",
                "description": "Домашний творог из цельного молока",
                "price": 380,
                "quantity": 40,
                "category": ProductCategory.DAIRY,
                "image_urls": ["https://placehold.co/400x400/e3f2fd/1976d2?text=Творог"]
            },
            
            # Bakery
            {
                "name": "Хлеб белый нарезной",
                "description": "Свежий пшеничный хлеб высшего сорта",
                "price": 180,
                "quantity": 100,
                "category": ProductCategory.BAKERY,
                "image_urls": ["https://placehold.co/400x400/fff3e0/f57c00?text=Хлеб"]
            },
            {
                "name": "Батон нарезной",
                "description": "Мягкий батон из пшеничной муки",
                "price": 150,
                "quantity": 80,
                "category": ProductCategory.BAKERY,
                "image_urls": ["https://placehold.co/400x400/fff3e0/f57c00?text=Батон"]
            },
            {
                "name": "Булочки с маком 6 шт",
                "description": "Свежие сдобные булочки с маком",
                "price": 320,
                "quantity": 25,
                "category": ProductCategory.BAKERY,
                "image_urls": ["https://placehold.co/400x400/fff3e0/f57c00?text=Булочки"]
            },
            
            # Beverages
            {
                "name": "Coca-Cola 2л",
                "description": "Классическая кола",
                "price": 380,
                "quantity": 60,
                "category": ProductCategory.BEVERAGES,
                "image_urls": ["https://placehold.co/400x400/fce4ec/c2185b?text=Coca-Cola"]
            },
            {
                "name": "Сок яблочный 1л",
                "description": "100% натуральный яблочный сок",
                "price": 420,
                "quantity": 45,
                "category": ProductCategory.BEVERAGES,
                "image_urls": ["https://placehold.co/400x400/fff9c4/fbc02d?text=Сок"]
            },
            {
                "name": "Минеральная вода 1.5л",
                "description": "Газированная минеральная вода",
                "price": 120,
                "quantity": 120,
                "category": ProductCategory.BEVERAGES,
                "image_urls": ["https://placehold.co/400x400/e0f2f1/00897b?text=Вода"]
            },
            
            # Meat
            {
                "name": "Куриное филе 1кг",
                "description": "Свежее охлажденное куриное филе",
                "price": 1200,
                "quantity": 35,
                "category": ProductCategory.MEAT,
                "image_urls": ["https://placehold.co/400x400/ffebee/d32f2f?text=Курица"]
            },
            {
                "name": "Колбаса вареная 500г",
                "description": "Докторская колбаса высшего сорта",
                "price": 890,
                "quantity": 40,
                "category": ProductCategory.MEAT,
                "image_urls": ["https://placehold.co/400x400/ffebee/d32f2f?text=Колбаса"]
            },
            
            # Fruits & Vegetables
            {
                "name": "Яблоки красные 1кг",
                "description": "Свежие сочные яблоки",
                "price": 350,
                "quantity": 80,
                "category": ProductCategory.FRUITS_VEGETABLES,
                "image_urls": ["https://placehold.co/400x400/f1f8e9/7cb342?text=Яблоки"]
            },
            {
                "name": "Картофель 2кг",
                "description": "Молодой картофель",
                "price": 280,
                "quantity": 100,
                "category": ProductCategory.FRUITS_VEGETABLES,
                "image_urls": ["https://placehold.co/400x400/f1f8e9/7cb342?text=Картофель"]
            },
            {
                "name": "Помидоры 1кг",
                "description": "Свежие спелые помидоры",
                "price": 520,
                "quantity": 60,
                "category": ProductCategory.FRUITS_VEGETABLES,
                "image_urls": ["https://placehold.co/400x400/f1f8e9/7cb342?text=Помидоры"]
            },
            
            # Frozen
            {
                "name": "Пельмени домашние 1кг",
                "description": "Замороженные пельмени с мясом",
                "price": 980,
                "quantity": 50,
                "category": ProductCategory.FROZEN,
                "image_urls": ["https://placehold.co/400x400/e8eaf6/3f51b5?text=Пельмени"]
            },
            {
                "name": "Мороженое пломбир",
                "description": "Классическое пломбир 500г",
                "price": 420,
                "quantity": 35,
                "category": ProductCategory.FROZEN,
                "image_urls": ["https://placehold.co/400x400/e8eaf6/3f51b5?text=Мороженое"]
            },
            
            # Grocery
            {
                "name": "Рис круглозерный 1кг",
                "description": "Высококачественный белый рис",
                "price": 380,
                "quantity": 70,
                "category": ProductCategory.GROCERY,
                "image_urls": ["https://placehold.co/400x400/efebe9/6d4c41?text=Рис"]
            },
            {
                "name": "Гречка 1кг",
                "description": "Гречневая крупа высшего сорта",
                "price": 320,
                "quantity": 80,
                "category": ProductCategory.GROCERY,
                "image_urls": ["https://placehold.co/400x400/efebe9/6d4c41?text=Гречка"]
            },
            {
                "name": "Макароны спагетти 500г",
                "description": "Макароны из твердых сортов пшеницы",
                "price": 220,
                "quantity": 90,
                "category": ProductCategory.GROCERY,
                "image_urls": ["https://placehold.co/400x400/efebe9/6d4c41?text=Макароны"]
            },
            
            # Sweets
            {
                "name": "Шоколад молочный 100г",
                "description": "Классический молочный шоколад",
                "price": 280,
                "quantity": 100,
                "category": ProductCategory.SWEETS,
                "image_urls": ["https://placehold.co/400x400/f3e5f5/8e24aa?text=Шоколад"]
            },
            {
                "name": "Печенье сдобное 400г",
                "description": "Вкусное домашнее печенье",
                "price": 350,
                "quantity": 60,
                "category": ProductCategory.SWEETS,
                "image_urls": ["https://placehold.co/400x400/f3e5f5/8e24aa?text=Печенье"]
            },
            {
                "name": "Чипсы картофельные 150г",
                "description": "Хрустящие картофельные чипсы",
                "price": 180,
                "quantity": 80,
                "category": ProductCategory.SWEETS,
                "image_urls": ["https://placehold.co/400x400/f3e5f5/8e24aa?text=Чипсы"]
            },
            
            # Canned
            {
                "name": "Тушенка говяжья 500г",
                "description": "Высококачественная мясная тушенка",
                "price": 850,
                "quantity": 40,
                "category": ProductCategory.CANNED,
                "image_urls": ["https://placehold.co/400x400/fafafa/616161?text=Тушенка"]
            },
            {
                "name": "Консервированная кукуруза 340г",
                "description": "Сладкая кукуруза в собственном соку",
                "price": 180,
                "quantity": 70,
                "category": ProductCategory.CANNED,
                "image_urls": ["https://placehold.co/400x400/fafafa/616161?text=Кукуруза"]
            },
        ]
        
        created_count = 0
        for product_data in products_data:
            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                quantity=product_data["quantity"],
                category=product_data["category"],
                seller_id=seller.id,
                image_urls=product_data["image_urls"]
            )
            db.add(product)
            created_count += 1
            print(f"  ✓ Создан: {product.name} - {product.price} ₸")
        
        db.commit()
        
        print("\n" + "="*80)
        print(f"✅ Успешно создано {created_count} продуктовых товаров!")
        print("="*80)
        print(f"\nВсего товаров в базе: {db.query(Product).count()}")
        print("="*80)
        
    except Exception as e:
        print(f"\n❌ Ошибка при создании товаров: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Создание продуктовых товаров для магазина...\n")
    create_food_products()
