"""
Скрипт для создания тестовых пользователей
Запустите этот скрипт ОДИН РАЗ после первого запуска сервера
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, init_db
from app.db.models import User
from app.core.security import hash_password
from app.db.base import Base

def create_users():
    """Создание тестовых пользователей"""
    
    # Инициализируем базу данных (создаем таблицы)
    print("🔧 Инициализация базы данных...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Проверяем, есть ли уже пользователи
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  В базе уже есть {existing_users} пользователей!")
            response = input("❓ Хотите добавить еще пользователей? (y/n): ")
            if response.lower() != 'y':
                print("❌ Отменено.")
                return
        
        print("\n" + "=" * 60)
        print("👥 Создание тестовых пользователей...")
        print("=" * 60)
        
        # 1. Администратор
        admin = User(
            email="admin@test.com",
            password_hash=hash_password("password123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        print("\n✅ Создан: Администратор")
        print("   Email: admin@test.com")
        print("   Пароль: password123")
        print("   Роль: admin")
        
        # 2. Продавец
        seller = User(
            email="seller@test.com",
            password_hash=hash_password("password123"),
            first_name="Seller",
            last_name="User",
            role="seller",
            is_active=True,
            is_verified=True
        )
        db.add(seller)
        print("\n✅ Создан: Продавец")
        print("   Email: seller@test.com")
        print("   Пароль: password123")
        print("   Роль: seller")
        
        # 3. Покупатель
        customer = User(
            email="customer@test.com",
            password_hash=hash_password("password123"),
            first_name="Customer",
            last_name="User",
            role="customer",
            is_active=True,
            is_verified=True
        )
        db.add(customer)
        print("\n✅ Создан: Покупатель")
        print("   Email: customer@test.com")
        print("   Пароль: password123")
        print("   Роль: customer")
        
        # Сохраняем в базу
        db.commit()
        
        print("\n" + "=" * 60)
        print("🎉 Пользователи успешно созданы!")
        print("=" * 60)
        
        # Показываем итоговую информацию
        total_users = db.query(User).count()
        print(f"\n📊 Всего пользователей в базе: {total_users}")
        
        print("\n" + "=" * 60)
        print("📝 СОХРАНИТЕ ЭТИ ДАННЫЕ:")
        print("=" * 60)
        print("\n1. АДМИНИСТРАТОР:")
        print("   Email: admin@test.com")
        print("   Пароль: password123\n")
        
        print("2. ПРОДАВЕЦ:")
        print("   Email: seller@test.com")
        print("   Пароль: password123\n")
        
        print("3. ПОКУПАТЕЛЬ:")
        print("   Email: customer@test.com")
        print("   Пароль: password123\n")
        
        print("=" * 60)
        print("🚀 Теперь можете войти в систему!")
        print("   API: http://localhost:8000/api/docs")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Ошибка при создании пользователей: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_users()
