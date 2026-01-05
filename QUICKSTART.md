# 🚀 Быстрый старт

Это руководство поможет вам быстро запустить приложение E-Commerce.

## ⚠️ Важное примечание о Python версии

**SQLAlchemy 2.0.36 несовместим с Python 3.13.5**

Рекомендуемые версии Python:
- ✅ Python 3.11.x
- ✅ Python 3.12.x
- ❌ Python 3.13.x (не поддерживается)

---

## 📋 Предварительные требования

- Python 3.11 или 3.12
- Node.js 18+
- npm или yarn

---

## 🔧 Установка и запуск

### 1️⃣ Backend (FastAPI)

```bash
# Перейдите в директорию backend
cd backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте окружение
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Создайте файл .env (скопируйте из .env.example)
# Или создайте вручную с содержимым:
```

**Содержимое `.env` файла:**
```env
# App
APP_NAME=E-Commerce API
DEBUG=true
API_V1_PREFIX=/api/v1

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=sqlite:///./ecommerce.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

```bash
# Запустите сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend готов!**
- API: http://localhost:8000
- Документация: http://localhost:8000/docs

---

### 2️⃣ Frontend (React)

Откройте новый терминал:

```bash
# Перейдите в директорию frontend
cd frontend

# Установите зависимости
npm install

# Создайте файл .env
# Или создайте вручную с содержимым:
```

**Содержимое `.env` файла:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=E-Commerce Shop
```

```bash
# Запустите dev сервер
npm run dev
```

✅ **Frontend готов!**
- Приложение: http://localhost:5173

---

## 🎯 Первые шаги

### 1. Откройте приложение
Перейдите по адресу: http://localhost:5173

### 2. Зарегистрируйтесь
- Нажмите "Регистрация"
- Заполните форму
- Войдите в систему

### 3. Начните использовать
- Просмотрите каталог товаров
- Добавьте товары в корзину
- Оформите заказ

---

## 🧪 Тестовые данные

После первого запуска база данных будет пустой. Вы можете:

### Создать администратора через API:

```bash
# POST http://localhost:8000/api/v1/auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin"
}
```

### Создать продавца:

```bash
# POST http://localhost:8000/api/v1/auth/register
{
  "email": "seller@example.com",
  "password": "seller123",
  "first_name": "Seller",
  "last_name": "User",
  "role": "seller"
}
```

---

## 🐋 Docker (альтернативный способ)

Если у вас установлен Docker:

```bash
# Запустите всё приложение
docker-compose up -d

# Backend будет на: http://localhost:8000
# Frontend будет на: http://localhost:3000
```

---

## 🔍 API Документация

После запуска backend, откройте:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

Здесь вы можете:
- Просмотреть все доступные эндпоинты
- Протестировать API прямо в браузере
- Увидеть схемы запросов и ответов

---

## 🛠️ Полезные команды

### Backend:
```bash
# Запуск с auto-reload
uvicorn app.main:app --reload

# Запуск на другом порту
uvicorn app.main:app --port 8001

# Создание миграций (если используете Alembic)
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Frontend:
```bash
# Запуск dev сервера
npm run dev

# Production build
npm run build

# Предпросмотр production build
npm run preview

# Линтинг кода
npm run lint
```

---

## ❓ Решение проблем

### Python 3.13 ошибка:
```
AssertionError in SQLAlchemy TypingOnly
```
**Решение:** Используйте Python 3.11 или 3.12

### Port уже используется:
```
Port 8000 is already in use
```
**Решение:** 
```bash
# Windows: найдите процесс
netstat -ano | findstr :8000
# Убейте процесс по PID
taskkill /PID <pid> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### CORS ошибки:
Убедитесь, что в backend `.env` файле:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### npm install ошибки:
```bash
# Очистите кеш
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Установите заново
npm install
```

---

## 📚 Дополнительная документация

- **Backend README:** `backend/README.md`
- **Frontend README:** `frontend/README.md`
- **API Docs:** http://localhost:8000/docs
- **Основной README:** `README.md`

---

## ✅ Проверка установки

Проверьте, что всё работает:

1. ✅ Backend запущен: http://localhost:8000
2. ✅ API Docs доступны: http://localhost:8000/docs
3. ✅ Frontend запущен: http://localhost:5173
4. ✅ Можно зарегистрироваться
5. ✅ Можно войти в систему

---

**Готово! Приложение работает! 🎉**

Если возникли проблемы, проверьте:
- Версию Python (должна быть 3.11 или 3.12)
- Активировано ли виртуальное окружение
- Созданы ли `.env` файлы
- Установлены ли все зависимости
