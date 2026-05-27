# ER-диаграмма базы данных SaudaFlow

## Структура базы данных (9 таблиц)

```mermaid
erDiagram
    users ||--o{ products : "продает (seller)"
    users ||--o{ orders : "размещает"
    users ||--o{ reviews : "пишет"
    users ||--o{ cart_items : "имеет в корзине"
    users ||--o{ wishlist : "сохраняет"
    users ||--o{ transactions : "совершает"
    users ||--o{ order_items : "продает (seller)"
    
    products ||--o{ order_items : "содержится в"
    products ||--o{ reviews : "получает"
    products ||--o{ cart_items : "добавлен в"
    products ||--o{ wishlist : "добавлен в"
    
    orders ||--|{ order_items : "содержит"
    orders ||--|| payments : "оплачен"
    
    users {
        int id PK
        string email UK
        string password_hash
        enum role
        string first_name
        string last_name
        string phone
        string avatar_url
        boolean is_active
        boolean is_verified
        float balance
        datetime created_at
        datetime updated_at
    }
    
    products {
        int id PK
        string name
        text description
        float price
        int quantity
        enum category
        int seller_id FK
        json image_urls
        float rating
        int review_count
        boolean is_active
        int view_count
        datetime created_at
        datetime updated_at
    }
    
    orders {
        int id PK
        int user_id FK
        enum status
        float total_price
        string delivery_method
        float delivery_cost
        text delivery_address
        string phone
        text notes
        string tracking_number UK
        string estimated_delivery
        datetime created_at
        datetime updated_at
    }
    
    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        float price_at_purchase
        int seller_id FK
        boolean is_delivered
        datetime created_at
    }
    
    reviews {
        int id PK
        int product_id FK
        int user_id FK
        int rating
        string title
        text text
        json images
        int helpful_count
        boolean verified_purchase
        datetime created_at
        datetime updated_at
    }
    
    payments {
        int id PK
        int order_id FK
        float amount
        enum method
        enum status
        string transaction_id UK
        datetime created_at
        datetime updated_at
    }
    
    wishlist {
        int id PK
        int user_id FK
        int product_id FK
        datetime created_at
    }
    
    cart_items {
        int id PK
        int user_id FK
        int product_id FK
        int quantity
        datetime created_at
        datetime updated_at
    }
    
    transactions {
        int id PK
        int user_id FK
        float amount
        string type
        text description
        float balance_after
        datetime created_at
    }
```

## Связи между таблицами

### 1. users (Пользователи)
- **Исходящие связи:**
  - `products.seller_id` → users.id (1:M) - Продавец и его товары
  - `orders.user_id` → users.id (1:M) - Покупатель и его заказы
  - `reviews.user_id` → users.id (1:M) - Автор и его отзывы
  - `cart_items.user_id` → users.id (1:M) - Корзина пользователя
  - `wishlist.user_id` → users.id (1:M) - Избранное пользователя
  - `transactions.user_id` → users.id (1:M) - Транзакции кошелька
  - `order_items.seller_id` → users.id (1:M) - Продавец позиции заказа

### 2. products (Товары)
- **Входящие связи:**
  - seller_id → users.id (M:1) - Принадлежность продавцу
- **Исходящие связи:**
  - `order_items.product_id` → products.id (1:M)
  - `reviews.product_id` → products.id (1:M)
  - `cart_items.product_id` → products.id (1:M)
  - `wishlist.product_id` → products.id (1:M)

### 3. orders (Заказы)
- **Входящие связи:**
  - user_id → users.id (M:1) - Покупатель заказа
- **Исходящие связи:**
  - `order_items.order_id` → orders.id (1:M) - Позиции заказа
  - `payments.order_id` → orders.id (1:1) - Оплата заказа

### 4. order_items (Позиции заказов)
- **Входящие связи:**
  - order_id → orders.id (M:1)
  - product_id → products.id (M:1, RESTRICT) - Нельзя удалить товар если есть в заказах
  - seller_id → users.id (M:1)

### 5. reviews (Отзывы)
- **Входящие связи:**
  - product_id → products.id (M:1, CASCADE)
  - user_id → users.id (M:1, CASCADE)

### 6. payments (Платежи)
- **Входящие связи:**
  - order_id → orders.id (1:1, CASCADE) - Один платеж на один заказ

### 7. wishlist (Избранное)
- **Входящие связи:**
  - user_id → users.id (M:1, CASCADE)
  - product_id → products.id (M:1, CASCADE)
- **Ограничения:**
  - UNIQUE(user_id, product_id) - Один товар один раз в избранном

### 8. cart_items (Корзина)
- **Входящие связи:**
  - user_id → users.id (M:1, CASCADE)
  - product_id → products.id (M:1, CASCADE)

### 9. transactions (Транзакции кошелька)
- **Входящие связи:**
  - user_id → users.id (M:1, CASCADE)

## Enums (Перечисления)

### UserRole
- `customer` - Покупатель
- `seller` - Продавец
- `admin` - Администратор

### OrderStatus
- `pending` - Ожидает обработки
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменен

### PaymentMethod
- `card` - Банковская карта
- `wallet` - Виртуальный кошелек
- `cash` - Наличные

### PaymentStatus
- `pending` - Ожидает
- `completed` - Завершен
- `failed` - Ошибка
- `refunded` - Возврат

### ProductCategory
- `electronics` - Электроника
- `clothing` - Одежда
- `food` - Продукты
- `books` - Книги
- `other` - Другое

## Индексы

Для оптимизации производительности созданы индексы на:
- `users.email` (UNIQUE)
- `products.name`
- `products.category`
- `products.seller_id`
- `orders.user_id`
- `orders.status`
- `order_items.order_id`
- `order_items.product_id`
- `reviews.product_id`
- `reviews.user_id`
- `payments.order_id` (UNIQUE)
- `wishlist.user_id`
- `wishlist.product_id`
- `cart_items.user_id`
- `cart_items.product_id`
- `transactions.user_id`

## Каскадное удаление (CASCADE)

При удалении пользователя (users):
- Удаляются его отзывы (reviews)
- Удаляется его корзина (cart_items)
- Удаляется его избранное (wishlist)
- Удаляются его транзакции (transactions)
- Удаляются его заказы (orders) → что удаляет позиции (order_items) и платежи (payments)
- НО товары (products) НЕ удаляются (надо отдельно обработать)

## Статистика

- **Всего таблиц:** 9
- **Всего связей:** 13
- **Всего enum типов:** 5
- **Всего индексов:** ~20
