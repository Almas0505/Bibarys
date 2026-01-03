"""
Database Inspector - проверяет структуру БД
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect
from app.db.session import engine
from app.db.models import User, Product, Order, OrderItem, Review, CartItem, Wishlist, Payment

def inspect_database():
    """Проверяет структуру базы данных"""
    print("=" * 70)
    print("DATABASE INSPECTION")
    print("=" * 70)
    
    inspector = inspect(engine)
    
    # Получаем список таблиц
    tables = inspector.get_table_names()
    
    print(f"\n✓ Найдено таблиц: {len(tables)}")
    print(f"\nСписок таблиц:")
    for table in sorted(tables):
        print(f"  - {table}")
    
    # Ожидаемые таблицы
    expected_tables = ['users', 'products', 'orders', 'order_items', 'reviews', 'cart_items', 'wishlist', 'payments']
    
    print(f"\n{'=' * 70}")
    print("ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦ")
    print("=" * 70)
    
    for table_name in expected_tables:
        if table_name in tables:
            columns = inspector.get_columns(table_name)
            indexes = inspector.get_indexes(table_name)
            foreign_keys = inspector.get_foreign_keys(table_name)
            
            print(f"\n✓ Таблица: {table_name}")
            print(f"  Колонок: {len(columns)}")
            print(f"  Индексов: {len(indexes)}")
            print(f"  Foreign Keys: {len(foreign_keys)}")
            
            print(f"\n  Колонки:")
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"    - {col['name']}: {col['type']} ({nullable})")
                
            if foreign_keys:
                print(f"\n  Foreign Keys:")
                for fk in foreign_keys:
                    print(f"    - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
        else:
            print(f"\n✗ Таблица {table_name} НЕ НАЙДЕНА!")
    
    # Проверяем количество записей
    print(f"\n{'=' * 70}")
    print("КОЛИЧЕСТВО ЗАПИСЕЙ")
    print("=" * 70)
    
    from sqlalchemy.orm import Session
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        models = [
            ('users', User),
            ('products', Product),
            ('orders', Order),
            ('order_items', OrderItem),
            ('reviews', Review),
            ('cart_items', CartItem),
            ('wishlist', Wishlist),
            ('payments', Payment),
        ]
        
        for name, model in models:
            count = db.query(model).count()
            print(f"  {name}: {count} записей")
            
    finally:
        db.close()
    
    print(f"\n{'=' * 70}")
    print("✓ База данных настроена правильно!")
    print("=" * 70)

if __name__ == "__main__":
    inspect_database()
