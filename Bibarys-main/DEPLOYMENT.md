# 🚀 Production Deployment Guide

Complete guide for deploying the Bibarys E-Commerce platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Security Checklist](#security-checklist)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## 🔧 Prerequisites

### Required Software
- **Docker** 24.0+ and **Docker Compose** 2.0+
- **Node.js** 18+ (for frontend build)
- **Python** 3.11+ (for backend)
- **PostgreSQL** 15+ (production database)
- **Nginx** (reverse proxy)
- **SSL Certificate** (Let's Encrypt recommended)

### Server Requirements
- **Minimum**: 2 vCPUs, 4GB RAM, 20GB SSD
- **Recommended**: 4 vCPUs, 8GB RAM, 50GB SSD
- **OS**: Ubuntu 22.04 LTS or similar

## 🌍 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Almas0505/Bibarys.git
cd Bibarys
```

### 2. Configure Environment Variables

Create production environment file:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with production values:

```env
# Application
APP_NAME=Bibarys E-Commerce
APP_VERSION=1.0.0
DEBUG=False
HOST=0.0.0.0
PORT=8000

# Database - Use strong password!
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@db:5432/bibarys
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD

# Security - CRITICAL: Generate secure keys!
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=YOUR_SECURE_RANDOM_KEY_MIN_32_CHARS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS - Set to your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-app-password
EMAIL_FROM=noreply@yourdomain.com

# Storage
UPLOAD_DIR=./static/uploads
MAX_UPLOAD_SIZE=10485760

# Redis
REDIS_URL=redis://redis:6379/0

# Logging
LOG_LEVEL=INFO
```

### 3. Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate POSTGRES_PASSWORD
openssl rand -base64 32
```

## 🐳 Docker Deployment

### Quick Start (Recommended)

1. **Build and start services:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

2. **Check services status:**

```bash
docker-compose -f docker-compose.prod.yml ps
```

3. **View logs:**

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Service Configuration

#### Backend Service
- **Port**: 8000 (internal)
- **Database**: PostgreSQL
- **Health Check**: `/health` endpoint
- **Auto-restart**: Yes

#### Database Service
- **Port**: 5432 (internal only)
- **Data**: Persistent volume `postgres_data`
- **Backup**: Configure periodic backups

#### Nginx Service
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Config**: `nginx/nginx.conf`
- **SSL**: Mount certificates to `/etc/nginx/ssl/`

#### Redis Service
- **Port**: 6379 (internal)
- **Use**: Caching and WebSocket sessions

## 🔧 Backend Deployment

### Manual Backend Deployment (Without Docker)

1. **Install Python dependencies:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Create static directory:**

```bash
mkdir -p static/uploads
```

3. **Initialize database:**

```bash
# Database will be created automatically on first run
# or run migrations if using Alembic
```

4. **Run with Gunicorn (production server):**

```bash
pip install gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Systemd Service (Linux)

Create `/etc/systemd/system/bibarys-backend.service`:

```ini
[Unit]
Description=Bibarys E-Commerce Backend
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/Bibarys/backend
Environment="PATH=/path/to/Bibarys/backend/venv/bin"
ExecStart=/path/to/Bibarys/backend/venv/bin/gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable bibarys-backend
sudo systemctl start bibarys-backend
sudo systemctl status bibarys-backend
```

## 🎨 Frontend Deployment

### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates optimized production build in `frontend/dist/`.

### 2. Configure Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com/api/v1/ws
```

### 3. Deploy Static Files

The `dist` folder contains all frontend files. Nginx serves them directly.

## 🗄️ Database Setup

### PostgreSQL Production Configuration

1. **Install PostgreSQL:**

```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
```

2. **Create database and user:**

```sql
sudo -u postgres psql

CREATE DATABASE bibarys;
CREATE USER bibarys_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE bibarys TO bibarys_user;
ALTER DATABASE bibarys OWNER TO bibarys_user;
\q
```

3. **Configure PostgreSQL:**

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

4. **Backup Strategy:**

```bash
# Create backup script
cat > /opt/backup-bibarys.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/bibarys"
mkdir -p $BACKUP_DIR
pg_dump -U bibarys_user bibarys | gzip > $BACKUP_DIR/bibarys_$TIMESTAMP.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "bibarys_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-bibarys.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup-bibarys.sh" | crontab -
```

## 🔒 Security Checklist

### Pre-Deployment

- [ ] Change all default passwords
- [ ] Generate strong `SECRET_KEY` (min 32 characters)
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Set `DEBUG=False` in production
- [ ] Configure `CORS_ORIGINS` to your domain only
- [ ] Review all environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting (already configured)
- [ ] Enable logging

### SSL/TLS Setup with Let's Encrypt

1. **Install Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Get certificate:**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update Nginx config** (`nginx/nginx.conf`):

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

4. **Auto-renewal:**

```bash
sudo certbot renew --dry-run
```

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## 📊 Monitoring and Maintenance

### Health Checks

Backend provides `/health` endpoint:

```bash
curl https://yourdomain.com/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "app_name": "Bibarys E-Commerce"
}
```

### Logging

View application logs:

```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f backend

# System logs
sudo journalctl -u bibarys-backend -f
```

### Monitoring Tools (Optional)

Consider setting up:
- **Prometheus** + **Grafana**: Metrics and dashboards
- **Sentry**: Error tracking
- **UptimeRobot**: Uptime monitoring
- **CloudFlare**: CDN and DDoS protection

### Database Maintenance

```bash
# Vacuum database
docker-compose -f docker-compose.prod.yml exec db \
  psql -U postgres -d bibarys -c "VACUUM ANALYZE;"

# Check database size
docker-compose -f docker-compose.prod.yml exec db \
  psql -U postgres -d bibarys -c "\l+"
```

### Updating the Application

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL in .env.production
   - Verify PostgreSQL is running
   - Check firewall rules

2. **CORS errors**
   - Update CORS_ORIGINS in .env.production
   - Restart backend service

3. **Static files not loading**
   - Check Nginx configuration
   - Verify file permissions
   - Check Nginx error logs

4. **WebSocket connection issues**
   - Verify Nginx WebSocket proxy settings
   - Check WebSocket URL in frontend config
   - Ensure proper SSL configuration for WSS

### Logs Location

```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
docker-compose -f docker-compose.prod.yml logs backend

# Database logs
docker-compose -f docker-compose.prod.yml logs db
```

## 📞 Support

For issues and questions:
- **GitHub Issues**: https://github.com/Almas0505/Bibarys/issues
- **Documentation**: Check README.md and API docs at `/api/docs`

## 📄 License

See LICENSE file for details.
