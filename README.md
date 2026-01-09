# E-Commerce Full-Stack Application

Полнофункциональное веб-приложение электронной коммерции с FastAPI (Backend) и React (Frontend).

## 📋 Оглавление

- [Возможности](#возможности)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [API Документация](#api-документация)
- [Роли пользователей](#роли-пользователей)

## ✨ Возможности

### Для покупателей (Customer)
- 🛍️ Просмотр товаров с фильтрацией и поиском
- 🛒 Корзина покупок
- ❤️ Избранное (wishlist)
- 📦 Оформление заказов
- ⭐ Отзывы и рейтинги
- 👤 Профиль пользователя

### Для продавцов (Seller)
- 📦 Управление товарами (CRUD)
- 📊 Просмотр заказов со своими товарами
- 💰 Статистика продаж
- 📝 Управление отзывами

### Для администраторов (Admin)
- 👥 Управление пользователями
- 🏪 Управление всеми товарами
- 📋 Управление всеми заказами
- 📈 Аналитика и отчёты
- 🔧 Системные настройки

## 🚀 Технологии

### Backend
- **FastAPI** - современный веб-фреймворк
- **SQLAlchemy** - ORM для работы с БД
- **Pydantic** - валидация данных
- **JWT** - аутентификация
- **SQLite/PostgreSQL** - база данных

### Frontend (будет добавлен)
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Redux Toolkit** - state management
- **Tailwind CSS** - стилизация
- **Axios** - HTTP client

## 📁 Структура проекта

```
Bibarys/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Security, exceptions, constants
│   │   ├── db/              # Database models, session
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/ (будет добавлен)
└── docker-compose.yml
```

## 🛠 Установка и запуск

### Вариант 1: Локальный запуск

#### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv

# Активировать виртуальное окружение
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python -m uvicorn app.main:app --reload
```

Backend будет доступен по адресу: http://localhost:8000

### Вариант 2: Docker

```bash
# Запустить все сервисы
docker-compose up -d

# Остановить
docker-compose down
```

## 📚 API Документация

После запуска backend, документация доступна по адресам:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

### Основные endpoints

#### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/auth/me` - Текущий пользователь
- `POST /api/v1/auth/refresh` - Обновить токен

#### Товары
- `GET /api/v1/products` - Список товаров
- `GET /api/v1/products/{id}` - Товар по ID
- `POST /api/v1/products` - Создать товар (seller/admin)
- `PUT /api/v1/products/{id}` - Обновить товар
- `DELETE /api/v1/products/{id}` - Удалить товар

#### Корзина
- `GET /api/v1/cart` - Получить корзину
- `POST /api/v1/cart` - Добавить в корзину
- `PUT /api/v1/cart/{item_id}` - Изменить количество
- `DELETE /api/v1/cart/{item_id}` - Удалить из корзины

#### Заказы
- `GET /api/v1/orders` - Мои заказы
- `GET /api/v1/orders/{id}` - Заказ по ID
- `POST /api/v1/orders` - Создать заказ
- `PUT /api/v1/orders/{id}/status` - Изменить статус

#### Отзывы
- `GET /api/v1/reviews/product/{id}` - Отзывы товара
- `POST /api/v1/reviews` - Создать отзыв
- `PUT /api/v1/reviews/{id}` - Обновить отзыв
- `DELETE /api/v1/reviews/{id}` - Удалить отзыв

#### Избранное
- `GET /api/v1/wishlist` - Получить избранное
- `POST /api/v1/wishlist/{product_id}` - Добавить в избранное
- `DELETE /api/v1/wishlist/{product_id}` - Удалить из избранного

#### Платежи
- `POST /api/v1/payments` - Создать платёж
- `GET /api/v1/payments/order/{order_id}` - Платёж заказа

#### Админ
- `GET /api/v1/admin/dashboard` - Статистика
- `GET /api/v1/admin/users` - Все пользователи
- `GET /api/v1/admin/orders` - Все заказы
- `PUT /api/v1/admin/users/{id}` - Изменить пользователя

#### Продавец
- `GET /api/v1/seller/analytics` - Моя статистика
- `GET /api/v1/seller/products` - Мои товары
- `GET /api/v1/seller/orders` - Мои заказы

#### Аналитика
- `GET /api/v1/analytics/dashboard` - Дашборд
- `GET /api/v1/analytics/top-products` - Топ товаров
- `GET /api/v1/analytics/revenue` - Выручка

## 👥 Роли пользователей

### Customer (Покупатель)
- Просмотр товаров
- Управление корзиной
- Оформление заказов
- Отзывы на товары
- Избранное

### Seller (Продавец)
- Всё из Customer
- Создание/редактирование товаров
- Просмотр своих заказов
- Статистика продаж

### Admin (Администратор)
- Всё из Customer и Seller
- Управление пользователями
- Управление всеми товарами
- Управление всеми заказами
- Аналитика и отчёты

## 🔐 Аутентификация

Приложение использует JWT (JSON Web Tokens) для аутентификации:

1. Регистрация/вход → получение access и refresh токенов
2. Access token (30 мин) - для API запросов
3. Refresh token (7 дней) - для обновления access token

**Пример использования:**

```bash
# Регистрация
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }'

# Вход
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Использование токена
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Переменные окружения

Создайте файл `.env` в папке `backend/`:

```env
APP_NAME=E-Commerce API
DEBUG=True
SECRET_KEY=your-secret-key-min-32-characters
DATABASE_URL=sqlite:///./ecommerce.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🧪 Тестирование API

Используйте Swagger UI для интерактивного тестирования: http://localhost:8000/api/docs

Или используйте curl/Postman/HTTPie для отправки запросов.

## 📦 База данных

По умолчанию используется SQLite. Для PostgreSQL измените `DATABASE_URL` в `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
```

## 🚧 TODO

- [x] Frontend (React + TypeScript + Redux)
- [x] WebSocket для real-time уведомлений
- [ ] Реальная интеграция платежей (Stripe)
- [ ] Email уведомления (SendGrid)
- [x] Загрузка изображений
- [x] Unit и integration тесты
- [ ] CI/CD pipeline
- [x] Production deployment setup (Docker + Nginx)

## 🚀 Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured (for production)
- SSL certificates (Let's Encrypt recommended)

### Step 1: Configure Environment

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your production values:
- Set a strong `SECRET_KEY` (min 32 characters)
- Configure `DATABASE_URL` for PostgreSQL
- Set your domain in `CORS_ORIGINS`
- Configure email settings (optional)

### Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/dist/`.

### Step 3: Deploy with Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Step 4: Configure SSL (Optional but Recommended)

For HTTPS, update `nginx/nginx.conf` to include SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Architecture

```
┌─────────────┐
│   Nginx     │  (Port 80/443)
│  (Reverse   │
│   Proxy)    │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────┐      ┌──────────┐
│ Frontend │      │ Backend  │
│  (Static │      │ (FastAPI)│
│   Files) │      │ Port 8000│
└──────────┘      └─────┬────┘
                        │
                        ├──────┬────────┐
                        │      │        │
                        ▼      ▼        ▼
                   ┌────────┐ ┌─────┐ ┌─────┐
                   │Postgres│ │Redis│ │Files│
                   └────────┘ └─────┘ └─────┘
```

### Production Features

✅ **Backend (FastAPI)**
- 50+ REST API endpoints
- JWT authentication with refresh tokens
- Role-based access control (Admin, Seller, Customer)
- WebSocket support for real-time notifications
- File upload handling
- Rate limiting
- Request logging
- Health check endpoint

✅ **Frontend (React + TypeScript)**
- 25+ reusable UI components
- 14 pages (Home, Products, Cart, Checkout, etc.)
- Redux Toolkit for state management
- Responsive design with Tailwind CSS
- Protected routes
- Form validation

✅ **Features**
- Product management (CRUD)
- Shopping cart
- Wishlist
- Order management
- Product reviews with verified purchase badges
- Payment integration
- User profiles
- Seller dashboard with analytics
- Admin panel

✅ **Security**
- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Rate limiting
- Input validation with Pydantic
- SQL injection protection via ORM

### Monitoring and Maintenance

**Health Check:**
```bash
curl http://localhost/health
```

**View Logs:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx
```

**Database Backup:**
```bash
docker exec -t bibarys-db pg_dump -U postgres bibarys > backup.sql
```

**Database Restore:**
```bash
docker exec -i bibarys-db psql -U postgres bibarys < backup.sql
```

## 📄 Лицензия

MIT License

## 👨‍💻 Автор

Created with ❤️ using FastAPI and React

---

**Статус проекта**: 🟢 Backend готов | 🔴 Frontend в разработке
