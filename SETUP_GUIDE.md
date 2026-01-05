# 🚀 Complete E-Commerce Project - Setup Guide

This guide provides complete instructions for setting up and running the full-stack e-commerce application.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Testing the Application](#testing-the-application)
- [API Documentation](#api-documentation)
- [Common Issues](#common-issues)

## ✅ Prerequisites

### Required Software
- **Python 3.11 or 3.12** (NOT 3.13 - incompatible with SQLAlchemy)
- **Node.js 18+** and npm
- **Git** for version control

### Check Your Versions
```bash
python --version  # Should show 3.11.x or 3.12.x
node --version    # Should show v18.x or higher
npm --version     # Should show 9.x or higher
```

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bibarys
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (already created, verify it exists)
# File should have SECRET_KEY, DATABASE_URL, etc.

# Seed database with test data
python seed_database.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 3. Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Create .env file (already created, verify it exists)
# File should have VITE_API_BASE_URL

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📝 Detailed Setup

### Backend Setup

#### 1. Environment Configuration

The backend `.env` file should contain:

```env
# Application
APP_NAME=E-Commerce API
APP_VERSION=1.0.0
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./ecommerce.db

# JWT Security
SECRET_KEY=your-secret-key-change-in-production-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (optional - commented out if not using)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASSWORD=password
# EMAILS_FROM_EMAIL=noreply@example.com

# Payment (optional - commented out if not using)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 2. Database Initialization

The database is automatically created when the backend starts for the first time. To populate it with test data:

```bash
python seed_database.py
```

This creates:
- **1 Admin** user
- **3 Seller** users
- **3 Customer** users
- **8 Sample** products

#### 3. Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/api/docs  # or visit in browser
```

### Frontend Setup

#### 1. Environment Configuration

The frontend `.env` file should contain:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=E-Commerce Shop
```

#### 2. Build for Production (Optional)

```bash
npm run build
npm run preview  # Preview production build
```

## 🧪 Testing the Application

### Test Accounts

After running the database seeder, you can use these test accounts:

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@example.com        | admin123      |
| Seller 1 | seller1@example.com      | seller123     |
| Seller 2 | seller2@example.com      | seller123     |
| Seller 3 | seller3@example.com      | seller123     |
| Customer 1 | customer1@example.com  | customer123   |
| Customer 2 | customer2@example.com  | customer123   |
| Customer 3 | customer3@example.com  | customer123   |

### Testing Workflow

1. **Open the application**: http://localhost:3000
2. **Browse products** without logging in
3. **Register a new account** or login with test accounts
4. **Add products to cart**
5. **Create an order**
6. **Test seller features** by logging in as a seller
7. **Test admin features** by logging in as admin

### API Testing

Use the Swagger UI for interactive API testing:
- URL: http://localhost:8000/api/docs

Example API calls:

```bash
# Login as admin
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get products (no auth required)
curl http://localhost:8000/api/v1/products

# Get products with filters
curl "http://localhost:8000/api/v1/products?category=electronics&min_price=100"
```

## 📚 API Documentation

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

#### Products
- `GET /api/v1/products` - List products (with filters)
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products` - Create product (seller/admin)
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

#### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart` - Add item to cart
- `PUT /api/v1/cart/{item_id}` - Update quantity
- `DELETE /api/v1/cart/{item_id}` - Remove from cart

#### Orders
- `GET /api/v1/orders` - List user's orders
- `GET /api/v1/orders/{id}` - Get order details
- `POST /api/v1/orders` - Create order from cart
- `POST /api/v1/orders/{id}/cancel` - Cancel order

#### Reviews
- `GET /api/v1/reviews/product/{id}` - Get product reviews
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/{id}` - Update review
- `DELETE /api/v1/reviews/{id}` - Delete review

#### Wishlist
- `GET /api/v1/wishlist` - Get wishlist
- `POST /api/v1/wishlist/{product_id}` - Add to wishlist
- `DELETE /api/v1/wishlist/{product_id}` - Remove from wishlist

#### Admin
- `GET /api/v1/admin/dashboard` - Admin statistics
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/orders` - List all orders

#### Seller
- `GET /api/v1/seller/dashboard` - Seller dashboard
- `GET /api/v1/seller/products` - My products
- `GET /api/v1/seller/orders` - My orders

## ❗ Common Issues

### Python Version Issues

**Problem**: `AssertionError in SQLAlchemy TypingOnly`

**Solution**: Use Python 3.11 or 3.12, NOT 3.13

```bash
# Check your version
python --version

# If 3.13, install Python 3.12 or 3.11
# Then recreate virtual environment
```

### Port Already in Use

**Problem**: `Port 8000 is already in use`

**Solution**:

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### CORS Errors

**Problem**: Frontend can't access backend API

**Solution**: Ensure CORS_ORIGINS in backend `.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Database Locked

**Problem**: `database is locked`

**Solution**:
```bash
# Stop all running servers
# Delete the database file
rm backend/ecommerce.db

# Restart backend (database will be recreated)
# Re-run seeder
python seed_database.py
```

### TypeScript Errors

**Problem**: Frontend build fails with type errors

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Module Not Found

**Problem**: `ModuleNotFoundError` in backend

**Solution**:
```bash
# Make sure virtual environment is activated
# Should see (venv) in terminal prompt

# Reinstall dependencies
pip install -r requirements.txt
```

## 🔧 Development Tools

### Backend

```bash
# Run linter
pylint app/

# Format code
black app/

# Run tests (if available)
pytest
```

### Frontend

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Production Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

#### Backend
```bash
# Install production dependencies
pip install -r requirements.txt

# Set environment variables
export DEBUG=False
export DATABASE_URL=postgresql://user:pass@localhost/dbname

# Run with gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or other web server
# Files are in dist/ directory
```

## 🎉 Success!

Your e-commerce application is now running!

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## 📞 Support

For issues or questions:
1. Check the [Common Issues](#common-issues) section
2. Review the [API Documentation](#api-documentation)
3. Check the main README.md
4. Open an issue on GitHub
