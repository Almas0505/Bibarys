"""
Скрипт для проверки пользователей в базе данных
"""
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.config import settings

# Берём путь из настроек приложения (тот же файл, с которым работает API)
db_path = settings.DATABASE_URL.replace('sqlite:///', '', 1)
print(f"📍 DB path: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Проверяем таблицы
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("=" * 60)
print("📋 Таблицы в базе данных:")
print("=" * 60)
for table in tables:
    print(f"  - {table[0]}")

print("\n" + "=" * 60)
print("👥 Пользователи в системе:")
print("=" * 60)

# Проверяем пользователей
try:
    cursor.execute("SELECT id, email, first_name, last_name, role, is_active FROM users")
    users = cursor.fetchall()
    
    if users:
        for user in users:
            user_id, email, first_name, last_name, role, is_active = user
            status = "✅ Активен" if is_active else "❌ Заблокирован"
            print(f"\n  ID: {user_id}")
            print(f"  Email: {email}")
            print(f"  Имя: {first_name} {last_name}")
            print(f"  Роль: {role}")
            print(f"  Статус: {status}")
            print("  " + "-" * 50)
    else:
        print("\n  ⚠️  База данных пустая! Пользователей нет.")
        print("\n  💡 Создайте первого пользователя через API:")
        print("     POST http://localhost:8000/api/v1/auth/register")
        
except sqlite3.OperationalError as e:
    print(f"\n  ❌ Ошибка: {e}")
    print("  Возможно, таблица users еще не создана.")

print("\n" + "=" * 60)

# Проверяем количество записей в других таблицах
try:
    cursor.execute("SELECT COUNT(*) FROM products")
    products_count = cursor.fetchone()[0]
    print(f"📦 Товаров в каталоге: {products_count}")
    
    cursor.execute("SELECT COUNT(*) FROM orders")
    orders_count = cursor.fetchone()[0]
    print(f"🛒 Заказов: {orders_count}")
except:
    pass

print("=" * 60)

conn.close()

print("\n✅ Проверка завершена!")
print("\n💡 ВАЖНО: Пароли НЕ хранятся в открытом виде!")
print("   В базе сохранены только bcrypt-хеши (например: $2b$12$...)")
