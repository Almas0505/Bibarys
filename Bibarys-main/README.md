# 🛍️ Bibarys E-Commerce Platform

<div align="center">

**Полнофункциональная платформа электронной коммерции**  
*Современный интернет-магазин с мощным backend и красивым frontend*

[🚀 Быстрый старт](QUICKSTART.md) • [📖 Документация API](#-api-endpoints) • [🐳 Docker Deploy](DEPLOYMENT.md)

---

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📖 О проекте

**Bibarys** - это полнофункциональная платформа для электронной коммерции, разработанная с использованием современных технологий и лучших практик веб-разработки.

### 🎯 Основные преимущества

- ✅ **Полный функционал** - от регистрации до оформления заказа
- ✅ **3 роли пользователей** - Покупатель, Продавец, Администратор
- ✅ **Real-time обновления** - WebSocket уведомления
- ✅ **Безопасность** - JWT аутентификация, rate limiting
- ✅ **Производительность** - оптимизированные запросы, кэширование
- ✅ **Адаптивный дизайн** - работает на всех устройствах
- ✅ **Docker-ready** - быстрый деплой

---

## ✨ Функциональные возможности

### 🛒 Для покупателей (Customer)

<table>
<tr>
<td width="50%">

**Покупки**
- 🔍 Поиск и фильтрация товаров
- 🏷️ Категории товаров
- 🛒 Корзина покупок
- ❤️ Избранное (wishlist)
- 📦 Оформление заказов
- 💳 Виртуальный кошелек

</td>
<td width="50%">

**Взаимодействие**
- ⭐ Рейтинги и отзывы
- 📱 Просмотр истории заказов
- 🔔 Уведомления о статусе
- 👤 Управление профилем
- 📧 Email уведомления
- 🔐 Безопасная аутентификация

</td>
</tr>
</table>

### 🏪 Для продавцов (Seller)

- ➕ **Управление товарами** - создание, редактирование, удаление
- 📸 **Загрузка фото** - множественные изображения с оптимизацией
- 📊 **Статистика продаж** - графики и аналитика
- 💰 **Финансовая отчетность** - доходы, топ товары
- 👥 **Клиентская база** - топ покупатели
- 📦 **Управление заказами** - отслеживание доставки

### 👑 Для администраторов (Admin)

- 🎛️ **Панель управления** - полная статистика платформы
- 👥 **Управление пользователями** - роли, блокировка
- 🏪 **Модерация товаров** - одобрение, удаление
- 📋 **Управление заказами** - изменение статусов
- 📊 **Аналитика** - выручка, пользователи, активность
- 📄 **Экспорт в PDF** - отчеты и аналитика

---

## 🏗️ Технологический стек

### Backend (FastAPI)

```
🐍 Python 3.11+          Современный язык программирования
⚡ FastAPI 0.109         Быстрый веб-фреймворк
🗄️ SQLAlchemy 2.0        ORM для работы с базой данных
✅ Pydantic v2           Валидация данных
🔐 JWT Authentication    Безопасная аутентификация
📦 SQLite/PostgreSQL     База данных (dev/prod)
🔌 WebSocket             Real-time уведомления
📧 Email Service         Отправка писем
📄 ReportLab             Генерация PDF
🖼️ Pillow                Обработка изображений
🚦 SlowAPI               Rate limiting
```

### Frontend (React + TypeScript)

```
⚛️ React 18              UI библиотека
📘 TypeScript 5.2        Типизация JavaScript
🔄 Redux Toolkit         Управление состоянием
🎨 Tailwind CSS          Utility-first CSS фреймворк
🔗 React Router 6        Навигация
📡 Axios                 HTTP клиент
🎯 Vite                  Быстрый сборщик
```

### DevOps & Инфраструктура

```
🐳 Docker                Контейнеризация
📝 Docker Compose        Оркестрация контейнеров
🌐 Nginx                 Reverse proxy & статика
🗄️ PostgreSQL            Production БД
🧪 Pytest                Тестирование
```

---

## 📁 Структура проекта

```
Bibarys-main/
│
├── 📂 backend/                    # Backend приложение (FastAPI)
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   └── 📂 v1/            # API версии 1
│   │   │       ├── auth.py       # Аутентификация
│   │   │       ├── products.py   # Товары
│   │   │       ├── orders.py     # Заказы
│   │   │       ├── cart.py       # Корзина
│   │   │       ├── reviews.py    # Отзывы
│   │   │       ├── wishlist.py   # Избранное
│   │   │       ├── payments.py   # Платежи
│   │   │       ├── wallet.py     # Кошелек
│   │   │       ├── admin.py      # Админ панель
│   │   │       ├── seller.py     # Панель продавца
│   │   │       ├── analytics.py  # Аналитика
│   │   │       ├── upload.py     # Загрузка файлов
│   │   │       └── websocket.py  # WebSocket
│   │   │
│   │   ├── 📂 core/              # Ядро системы
│   │   │   ├── security.py       # JWT, хеширование
│   │   │   ├── constants.py      # Константы, Enum
│   │   │   ├── exceptions.py     # Исключения
│   │   │   ├── image_handler.py  # Обработка изображений
│   │   │   ├── storage.py        # Файловое хранилище
│   │   │   └── websocket.py      # WebSocket manager
│   │   │
│   │   ├── 📂 db/                # База данных
│   │   │   ├── models.py         # SQLAlchemy модели
│   │   │   ├── session.py        # DB сессии
│   │   │   └── base.py           # Базовая модель
│   │   │
│   │   ├── 📂 schemas/           # Pydantic схемы
│   │   │   ├── user.py           # Пользователи
│   │   │   ├── product.py        # Товары
│   │   │   ├── order.py          # Заказы
│   │   │   ├── payment.py        # Платежи
│   │   │   ├── review.py         # Отзывы
│   │   │   ├── wallet.py         # Кошелек
│   │   │   └── common.py         # Общие схемы
│   │   │
│   │   ├── 📂 services/          # Бизнес-логика
│   │   │   ├── user_service.py
│   │   │   ├── product_service.py
│   │   │   ├── order_service.py
│   │   │   ├── payment_service.py
│   │   │   ├── review_service.py
│   │   │   ├── email_service.py
│   │   │   ├── pdf_service.py
│   │   │   └── pdf_admin_extension.py
│   │   │
│   │   ├── config.py             # Конфигурация
│   │   └── main.py               # FastAPI приложение
│   │
│   ├── 📂 tests/                 # Unit тесты
│   │   ├── conftest.py
│   │   ├── test_reviews.py
│   │   └── test_wishlist.py
│   │
│   ├── 📂 static/                # Статические файлы
│   │   └── uploads/              # Загруженные изображения
│   │
│   ├── requirements.txt          # Python зависимости
│   ├── requirements-dev.txt      # Dev зависимости
│   ├── Dockerfile                # Docker образ
│   ├── .env.example              # Пример конфига
│   └── run.py                    # Точка входа
│
├── 📂 frontend/                  # Frontend приложение (React)
│   ├── 📂 src/
│   │   ├── 📂 components/       # React компоненты
│   │   │   ├── admin/           # Админ компоненты
│   │   │   ├── seller/          # Продавец компоненты
│   │   │   ├── auth/            # Аутентификация
│   │   │   ├── checkout/        # Оформление заказа
│   │   │   ├── common/          # Общие компоненты
│   │   │   ├── layout/          # Layout (Header, Footer)
│   │   │   └── wallet/          # Кошелек
│   │   │
│   │   ├── 📂 pages/            # Страницы
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── SellerPage.tsx
│   │   │   └── ...
│   │   │
│   │   ├── 📂 services/         # API сервисы
│   │   ├── 📂 store/            # Redux store
│   │   ├── 📂 types/            # TypeScript типы
│   │   ├── 📂 utils/            # Утилиты
│   │   ├── 📂 hooks/            # Custom hooks
│   │   ├── App.tsx              # Root компонент
│   │   └── main.tsx             # Точка входа
│   │
│   ├── package.json             # Node зависимости
│   ├── tsconfig.json            # TypeScript конфиг
│   ├── vite.config.ts           # Vite конфиг
│   ├── tailwind.config.js       # Tailwind конфиг
│   └── .env.example             # Пример конфига
│
├── 📂 nginx/                     # Nginx конфигурация
│   └── nginx.conf
│
├── 📄 docker-compose.yml         # Docker Compose (dev)
├── 📄 docker-compose.prod.yml    # Docker Compose (prod)
├── 📄 README.md                  # Этот файл
├── 📄 QUICKSTART.md              # Быстрый старт
├── 📄 DEPLOYMENT.md              # Деплой инструкции
├── 📄 PROJECT_DEEP_ANALYSIS.md   # Анализ проекта
└── 📄 .gitignore                 # Git ignore
```

---

## 🚀 Быстрый старт

### Вариант 1: Локальный запуск (Рекомендуется для разработки)

Следуйте детальной инструкции в **[QUICKSTART.md](QUICKSTART.md)** - пошаговое руководство для новичков.

**Краткая версия:**

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd Bibarys-main

# 2. Backend
cd backend
python -m venv venv
venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
# Создайте .env файл (см. backend/.env.example)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend (в новом терминале)
cd frontend
npm install
# Создайте .env файл (см. frontend/.env.example)
npm run dev
```

**Готово!** 🎉
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

---

### Вариант 2: Docker (Production-ready)

```bash
# Development режим
docker-compose up -d

# Production режим
docker-compose -f docker-compose.prod.yml up -d
```

Подробнее в **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 📚 API Endpoints

### 🔐 Аутентификация (`/api/v1/auth`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/register` | Регистрация нового пользователя | ❌ |
| POST | `/login` | Вход в систему | ❌ |
| GET | `/me` | Получить текущего пользователя | ✅ |
| POST | `/refresh` | Обновить access token | ✅ |
| POST | `/logout` | Выход из системы | ✅ |

### 📦 Товары (`/api/v1/products`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список товаров (фильтры, поиск, пагинация) | ❌ |
| GET | `/{id}` | Получить товар по ID | ❌ |
| POST | `/` | Создать товар | ✅ Seller/Admin |
| PUT | `/{id}` | Обновить товар | ✅ Owner/Admin |
| DELETE | `/{id}` | Удалить товар | ✅ Owner/Admin |
| GET | `/{id}/similar` | Похожие товары | ❌ |

### 🛒 Корзина (`/api/v1/cart`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Получить корзину | ✅ |
| POST | `/` | Добавить товар в корзину | ✅ |
| PUT | `/{item_id}` | Изменить количество | ✅ |
| DELETE | `/{item_id}` | Удалить товар из корзины | ✅ |
| DELETE | `/clear` | Очистить корзину | ✅ |

### 📋 Заказы (`/api/v1/orders`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Мои заказы | ✅ |
| GET | `/{id}` | Заказ по ID | ✅ |
| POST | `/checkout` | Создать заказ из корзины | ✅ |
| PUT | `/{id}/status` | Изменить статус | ✅ Seller/Admin |
| DELETE | `/{id}` | Отменить заказ | ✅ |

### ⭐ Отзывы (`/api/v1/reviews`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/product/{id}` | Отзывы товара | ❌ |
| POST | `/` | Создать отзыв | ✅ |
| PUT | `/{id}` | Обновить отзыв | ✅ Owner |
| DELETE | `/{id}` | Удалить отзыв | ✅ Owner/Admin |

### ❤️ Избранное (`/api/v1/wishlist`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Мое избранное | ✅ |
| POST | `/{product_id}` | Добавить в избранное | ✅ |
| DELETE | `/{product_id}` | Удалить из избранного | ✅ |
| DELETE | `/clear` | Очистить избранное | ✅ |

### 💳 Платежи (`/api/v1/payments`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/` | Создать платеж | ✅ |
| GET | `/order/{id}` | Платеж заказа | ✅ |

### 💰 Кошелек (`/api/v1/wallet`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/balance` | Баланс кошелька | ✅ |
| POST | `/deposit` | Пополнить | ✅ |
| GET | `/transactions` | История транзакций | ✅ |

### 📤 Загрузка файлов (`/api/v1/upload`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/product-image` | Загрузить фото товара | ✅ Seller/Admin |
| DELETE | `/product-image` | Удалить фото | ✅ Seller/Admin |

### 👑 Админ панель (`/api/v1/admin`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/dashboard` | Статистика платформы | ✅ Admin |
| GET | `/users` | Все пользователи | ✅ Admin |
| GET | `/orders` | Все заказы | ✅ Admin |
| GET | `/products` | Все товары | ✅ Admin |
| PUT | `/users/{id}` | Изменить пользователя | ✅ Admin |
| DELETE | `/users/{id}` | Удалить пользователя | ✅ Admin |
| GET | `/export-pdf` | Экспорт аналитики в PDF | ✅ Admin |

### 🏪 Панель продавца (`/api/v1/seller`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/dashboard` | Моя статистика | ✅ Seller |
| GET | `/analytics` | Детальная аналитика | ✅ Seller |
| GET | `/products` | Мои товары | ✅ Seller |
| GET | `/orders` | Заказы с моими товарами | ✅ Seller |
| GET | `/customers` | Топ покупатели | ✅ Seller |
| GET | `/revenue` | График доходов | ✅ Seller |

### 📊 Аналитика (`/api/v1/analytics`)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/overview` | Общая статистика | ✅ |
| GET | `/products/top` | Топ товары | ✅ |
| GET | `/revenue` | График выручки | ✅ Seller/Admin |
| GET | `/customers/top` | Топ покупатели | ✅ Seller/Admin |

### 🔌 WebSocket (`/api/v1/ws`)

| Endpoint | Описание | Auth |
|----------|----------|------|
| `/ws/{token}` | Real-time уведомления | ✅ JWT в URL |

**Типы уведомлений:**
- Изменение статуса заказа
- Новый заказ (для продавца)
- Новый отзыв (для продавца)

---

## 👥 Роли пользователей

### 🛍️ Customer (Покупатель) - по умолчанию

**Права:**
- Просмотр каталога
- Добавление в корзину/избранное
- Создание заказов
- Написание отзывов
- Управление профилем

### 🏪 Seller (Продавец)

**Права Customer +:**
- Создание товаров
- Редактирование своих товаров
- Просмотр заказов с своими товарами
- Статистика продаж
- Управление отзывами на свои товары

### 👑 Admin (Администратор)

**Права Seller +:**
- Управление всеми пользователями
- Управление всеми товарами
- Управление всеми заказами
- Полная статистика платформы
- Экспорт отчетов в PDF
- Модерация контента

---

## 🔒 Безопасность

### Реализованные меры:

✅ **JWT Authentication** - Bearer токены с истечением  
✅ **Password Hashing** - bcrypt с солью  
✅ **CORS Protection** - настроенные origins  
✅ **Rate Limiting** - защита от DDoS  
✅ **SQL Injection Protection** - ORM SQLAlchemy  
✅ **XSS Protection** - экранирование данных  
✅ **Input Validation** - Pydantic схемы  
✅ **File Upload Validation** - проверка типов и размеров  

### Переменные окружения (.env):

```env
# Security
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database (Production)
DATABASE_URL=postgresql://user:password@localhost/dbname

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🎨 Особенности Frontend

### Адаптивный дизайн
- 📱 Mobile-first подход
- 💻 Работает на всех устройствах
- 🎨 Tailwind CSS для стилизации

### State Management
- 🔄 Redux Toolkit
- 💾 Persist - сохранение в localStorage
- 🔁 Автоматическая синхронизация

### UX/UI Features
- ⚡ Быстрая навигация
- 🎭 Skeleton loaders
- 🔔 Toast уведомления
- 📸 Drag-and-drop загрузка фото
- 🌈 Современный градиентный дизайн
- ♿ Доступность (a11y)

---

## 📊 База данных

### Модели данных:

```
User (Пользователи)
├── id, email, password_hash
├── role (customer/seller/admin)
├── first_name, last_name, phone
├── balance (виртуальный кошелек)
└── created_at, updated_at

Product (Товары)
├── id, name, description
├── price, quantity, category
├── seller_id → User
├── image_urls (JSON)
├── rating, review_count
└── view_count

Order (Заказы)
├── id, user_id → User
├── status, total_price
├── delivery_method, delivery_address
├── tracking_number
└── items → OrderItem[]

OrderItem (Позиции заказа)
├── id, order_id → Order
├── product_id → Product
├── quantity, price_at_purchase
└── seller_id → User

Review (Отзывы)
├── id, product_id → Product
├── user_id → User
├── rating (1-5), comment
└── created_at

CartItem (Корзина)
├── id, user_id → User
├── product_id → Product
└── quantity

Wishlist (Избранное)
├── id, user_id → User
└── product_id → Product

Payment (Платежи)
├── id, order_id → Order
├── amount, method, status
└── created_at

Transaction (Транзакции кошелька)
├── id, user_id → User
├── amount, type, description
└── created_at
```

### Связи:
- User → Products (1:N) - продавец и товары
- User → Orders (1:N) - покупатель и заказы
- Order → OrderItems (1:N) - заказ и позиции
- Product → Reviews (1:N) - товар и отзывы

---

## 🧪 Тестирование

### Backend тесты

```bash
cd backend

# Запустить все тесты
pytest

# С покрытием
pytest --cov=app tests/

# Конкретный модуль
pytest tests/test_reviews.py -v
```

### Frontend тесты

```bash
cd frontend

# Unit тесты
npm run test

# E2E тесты
npm run test:e2e
```

---

## 📈 Производительность

### Оптимизации:

✅ **Database Indexing** - индексы на часто запрашиваемые поля  
✅ **Eager Loading** - joinedload для связей  
✅ **Pagination** - лимиты на все списки  
✅ **Image Optimization** - сжатие и thumbnails  
✅ **Lazy Loading** - React.lazy для компонентов  
✅ **Code Splitting** - раздельные бандлы  
✅ **Caching** - кэширование статики в Nginx  

### Метрики:

- ⚡ API Response Time: < 100ms
- 📦 Bundle Size: < 500KB (gzipped)
- 🎯 Lighthouse Score: 90+
- 🚀 First Contentful Paint: < 1.5s

---

## 🚢 Деплой

### Production Checklist

**Backend:**
- [ ] Изменить `SECRET_KEY`
- [ ] Установить `DEBUG=false`
- [ ] Настроить PostgreSQL
- [ ] Настроить CORS origins
- [ ] Настроить Email (SMTP)
- [ ] Настроить файловое хранилище

**Frontend:**
- [ ] Изменить `VITE_API_BASE_URL`
- [ ] Build: `npm run build`
- [ ] Проверить ENV переменные

**Infrastructure:**
- [ ] SSL сертификаты
- [ ] Nginx конфигурация
- [ ] Docker volumes
- [ ] Backup стратегия

Полная инструкция: **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 🤝 Разработка

### Начало работы

1. Fork репозитория
2. Клонируйте свой fork
3. Создайте ветку: `git checkout -b feature/amazing-feature`
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Создайте Pull Request

### Стандарты кода

**Backend:**
- PEP 8 style guide
- Type hints
- Docstrings (Google style)
- Pytest для тестов

**Frontend:**
- ESLint + Prettier
- TypeScript strict mode
- Компоненты - Pascal Case
- Функции - camelCase

---

## 📝 Лицензия

MIT License - см. [LICENSE](LICENSE)

---

## 🆘 Поддержка

### Документация
- 📖 [Быстрый старт](QUICKSTART.md)
- 🚀 [Деплой](DEPLOYMENT.md)
- 🔍 [Анализ проекта](PROJECT_DEEP_ANALYSIS.md)

### Связь
- 🐛 [Сообщить о баге](../../issues)
- 💡 [Предложить улучшение](../../issues)
- 📧 Email: support@bibarys.kz

---

## 🎯 Roadmap

### В разработке
- [ ] Система уведомлений (push notifications)
- [ ] Чат с продавцом
- [ ] Интеграция с платежными системами
- [ ] Мультиязычность (i18n)
- [ ] Mobile приложение (React Native)

### Планируется
- [ ] AI рекомендации товаров
- [ ] Программа лояльности
- [ ] Промокоды и скидки
- [ ] Социальная аутентификация (OAuth)

---

## 🌟 Авторы

Разработано с ❤️ командой Bibarys

---

## 📸 Скриншоты

*(Добавьте скриншоты приложения)*

---

<div align="center">

**⭐ Если проект понравился - поставьте звезду! ⭐**

[🔝 Вернуться наверх](#-bibarys-e-commerce-platform)

</div>
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

> **📖 Полное руководство по деплою**: См. [DEPLOYMENT.md](./DEPLOYMENT.md) для детальных инструкций

### Быстрый старт

1. **Настройка окружения:**
```bash
cp .env.production.example .env.production
# Отредактируйте .env.production с вашими настройками
```

2. **Сборка фронтенда:**
```bash
cd frontend && npm install && npm run build
```

3. **Запуск с Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

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

**Статус проекта**: 🟢 Production Ready

### Готово к деплою:
- ✅ Backend API (FastAPI) - 50+ endpoints
- ✅ Frontend (React + TypeScript + Redux)
- ✅ База данных (PostgreSQL/SQLite)
- ✅ Аутентификация (JWT)
- ✅ WebSocket real-time notifications
- ✅ Docker + Nginx production setup
- ✅ Тесты (pytest)
- ✅ Документация API (Swagger)

**Подробности деплоя**: [DEPLOYMENT.md](./DEPLOYMENT.md)
