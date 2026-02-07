"""
Автоматическая генерация ER-диаграммы из SQLAlchemy моделей
Использует библиотеку eralchemy
"""
import sys
from pathlib import Path

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent))

try:
    from eralchemy import render_er
    from app.db.base import Base
    from app.db import models  # Импортируем все модели
    
    # Генерируем ER-диаграмму в PNG
    output_file = Path(__file__).parent / "database_erd.png"
    
    print("Генерация ER-диаграммы...")
    print(f"Файл будет сохранен: {output_file}")
    
    # Рендерим диаграмму из SQLAlchemy Base
    render_er(Base, str(output_file))
    
    print(f"✅ ER-диаграмма успешно создана: {output_file}")
    print("\nТаблицы в базе данных:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")
    
except ImportError:
    print("❌ Ошибка: библиотека eralchemy не установлена")
    print("\nУстановите зависимости:")
    print("  pip install eralchemy")
    print("  pip install pygraphviz")
    print("\nИли используйте онлайн-инструменты (см. комментарии в файле)")
    print("\n" + "="*60)
    print("АЛЬТЕРНАТИВА: Используйте онлайн-инструмент")
    print("="*60)
    print("\n1. Перейдите на https://dbdiagram.io/")
    print("2. Скопируйте код ниже:\n")
    print("""
// SaudaFlow Database Schema

Table users {
  id integer [primary key, increment]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  role enum('customer', 'seller', 'admin') [not null]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  phone varchar(20)
  avatar_url varchar(500)
  is_active boolean [default: true]
  is_verified boolean [default: false]
  balance float [default: 0.0, note: 'Virtual wallet']
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table products {
  id integer [primary key, increment]
  name varchar(255) [not null]
  description text
  price float [not null]
  quantity integer [default: 0, note: 'Stock']
  category enum('electronics', 'clothing', 'food', 'books', 'other')
  seller_id integer [not null, ref: > users.id]
  image_urls json
  rating float [default: 0.0]
  review_count integer [default: 0]
  is_active boolean [default: true]
  view_count integer [default: 0]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table orders {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  status enum('pending', 'processing', 'shipped', 'delivered', 'cancelled')
  total_price float [not null]
  delivery_method varchar(50) [not null]
  delivery_cost float [not null]
  delivery_address text [not null]
  phone varchar(20) [not null]
  notes text
  tracking_number varchar(100) [unique]
  estimated_delivery varchar(100)
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table order_items {
  id integer [primary key, increment]
  order_id integer [not null, ref: > orders.id]
  product_id integer [not null, ref: > products.id]
  quantity integer [not null]
  price_at_purchase float [not null]
  seller_id integer [not null, ref: > users.id]
  is_delivered boolean [default: false]
  created_at timestamp [default: `now()`]
}

Table reviews {
  id integer [primary key, increment]
  product_id integer [not null, ref: > products.id]
  user_id integer [not null, ref: > users.id]
  rating integer [not null, note: '1-5 stars']
  title varchar(255)
  text text
  images json
  helpful_count integer [default: 0]
  verified_purchase boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table payments {
  id integer [primary key, increment]
  order_id integer [unique, not null, ref: - orders.id]
  amount float [not null]
  method enum('card', 'wallet', 'cash')
  status enum('pending', 'completed', 'failed', 'refunded')
  transaction_id varchar(255) [unique]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table wishlist {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  product_id integer [not null, ref: > products.id]
  created_at timestamp [default: `now()`]
  
  indexes {
    (user_id, product_id) [unique]
  }
}

Table cart_items {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  product_id integer [not null, ref: > products.id]
  quantity integer [not null, default: 1]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table transactions {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  amount float [not null, note: 'Positive for deposits, negative for withdrawals']
  type varchar(50) [not null, note: 'deposit, withdraw, purchase, refund']
  description text
  balance_after float [not null]
  created_at timestamp [default: `now()`]
}
""")
    print("\n3. Нажмите 'Import' и диаграмма будет создана автоматически")
    print("4. Экспортируйте в PNG/PDF через меню Export")

except Exception as e:
    print(f"❌ Ошибка при генерации: {e}")
    import traceback
    traceback.print_exc()
