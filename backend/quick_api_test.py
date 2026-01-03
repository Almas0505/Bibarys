"""
Quick API Test - с существующими пользователями
"""
import requests
import json

BASE_URL = "http://localhost:8001"

print("=" * 70)
print("БЫСТРЫЙ ТЕСТ API")
print("=" * 70)

# Логинимся с существующими данными
print("\n1. Логин существующего пользователя...")
login_data = {"email": "customer@test.com", "password": "Password123!"}
resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
print(f"   Status: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    token = data.get("access_token")
    print(f"   ✓ Token получен: {token[:50]}...")
    
    # Проверяем /me
    print("\n2. Проверка /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        user = resp.json()
        print(f"   ✓ User: {user.get('email')} ({user.get('role')})")
    else:
        print(f"   ✗ Error: {resp.text}")
        
    # Проверяем корзину
    print("\n3. Проверка корзины...")
    resp = requests.get(f"{BASE_URL}/api/v1/cart", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        cart = resp.json()
        print(f"   ✓ Корзина: {len(cart.get('items', []))} товаров")
    else:
        print(f"   ✗ Error: {resp.text}")
        
else:
    print(f"   ✗ Ошибка логина: {resp.text}")

# Логин продавца
print("\n4. Логин продавца...")
seller_login = {"email": "seller@test.com", "password": "Password123!"}
resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=seller_login)
print(f"   Status: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    seller_token = data.get("access_token")
    print(f"   ✓ Seller token получен")
    
    # Создаем товар
    print("\n5. Создание товара...")
    product_data = {
        "name": "iPhone 15 Pro",
        "description": "Новейший смартфон от Apple",
        "price": 599999,
        "quantity": 50,
        "category": "electronics",
        "image_urls": ["https://example.com/iphone15.jpg"]
    }
    headers = {"Authorization": f"Bearer {seller_token}"}
    resp = requests.post(f"{BASE_URL}/api/v1/products", json=product_data, headers=headers)
    print(f"   Status: {resp.status_code}")
    
    if resp.status_code in [200, 201]:
        product = resp.json()
        product_id = product.get("id")
        print(f"   ✓ Товар создан: ID {product_id}")
        
        # Проверяем список товаров
        print("\n6. Список товаров...")
        resp = requests.get(f"{BASE_URL}/api/v1/products")
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✓ Товаров в базе: {data.get('total', 0)}")
    else:
        print(f"   ✗ Error: {resp.text}")
else:
    print(f"   ✗ Ошибка логина продавца: {resp.text}")

# Логин админа
print("\n7. Логин админа...")
admin_login = {"email": "admin@test.com", "password": "Password123!"}
resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=admin_login)
print(f"   Status: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    admin_token = data.get("access_token")
    print(f"   ✓ Admin token получен")
    
    # Статистика
    print("\n8. Админ статистика...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/api/v1/admin/stats", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        stats = resp.json()
        print(f"   ✓ Пользователей: {stats.get('total_users', 0)}")
        print(f"   ✓ Товаров: {stats.get('total_products', 0)}")
        print(f"   ✓ Заказов: {stats.get('total_orders', 0)}")
    else:
        print(f"   ✗ Error: {resp.text}")
else:
    print(f"   ✗ Ошибка логина админа: {resp.text}")

print("\n" + "=" * 70)
print("ТЕСТ ЗАВЕРШЕН")
print("=" * 70)
