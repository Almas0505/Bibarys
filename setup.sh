#!/bin/bash

# 🚀 E-Commerce Project Setup Script
# Автоматический запуск проекта одной командой

set -e  # Exit on error

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Проверка Python версии
check_python() {
    print_info "Проверка Python..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if [[ "$PYTHON_VERSION" == "3.11" ]] || [[ "$PYTHON_VERSION" == "3.12" ]]; then
            print_status "Python $PYTHON_VERSION найден"
            return 0
        else
            print_warning "Python $PYTHON_VERSION обнаружен. Рекомендуется 3.11 или 3.12"
            return 0
        fi
    else
        print_error "Python 3 не найден! Установите Python 3.11 или 3.12"
        exit 1
    fi
}

# Проверка Node.js
check_node() {
    print_info "Проверка Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js $NODE_VERSION найден"
    else
        print_error "Node.js не найден! Установите Node.js 18+"
        exit 1
    fi
}

# Установка backend
setup_backend() {
    print_info "Настройка Backend..."
    
    cd backend
    
    # Создание виртуального окружения
    if [ ! -d "venv" ]; then
        print_info "Создание виртуального окружения..."
        python3 -m venv venv
        print_status "Виртуальное окружение создано"
    fi
    
    # Активация и установка зависимостей
    print_info "Установка Python пакетов..."
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    print_status "Python пакеты установлены"
    
    # Создание .env если не существует
    if [ ! -f ".env" ]; then
        print_info "Создание .env файла..."
        cp .env.example .env
        print_status ".env файл создан"
    fi
    
    # Инициализация базы данных
    if [ ! -f "ecommerce.db" ]; then
        print_info "Инициализация базы данных..."
        python -c "from app.db.base import Base; from app.db.session import engine; from app.db import models; Base.metadata.create_all(bind=engine)"
        print_status "База данных создана"
        
        print_info "Загрузка тестовых данных..."
        python seed_database.py > /dev/null 2>&1
        print_status "Тестовые данные загружены"
    fi
    
    cd ..
    print_status "Backend настроен!"
}

# Установка frontend
setup_frontend() {
    print_info "Настройка Frontend..."
    
    cd frontend
    
    # Установка npm пакетов
    if [ ! -d "node_modules" ]; then
        print_info "Установка npm пакетов..."
        npm install -q
        print_status "npm пакеты установлены"
    fi
    
    # Создание .env если не существует
    if [ ! -f ".env" ]; then
        print_info "Создание .env файла..."
        cp .env.example .env
        print_status ".env файл создан"
    fi
    
    cd ..
    print_status "Frontend настроен!"
}

# Запуск backend
start_backend() {
    print_info "Запуск Backend сервера..."
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

# Запуск frontend
start_frontend() {
    print_info "Запуск Frontend сервера..."
    cd frontend
    npm run dev
}

# Главное меню
show_menu() {
    echo ""
    echo "=================================="
    echo "  🛒 E-Commerce Project Manager"
    echo "=================================="
    echo "1. Полная установка (setup)"
    echo "2. Запуск Backend"
    echo "3. Запуск Frontend"
    echo "4. Запуск обоих серверов"
    echo "5. Выход"
    echo "=================================="
    echo -n "Выберите опцию [1-5]: "
}

# Основная функция
main() {
    clear
    echo "=================================="
    echo "🛒 E-Commerce Project Setup"
    echo "=================================="
    echo ""
    
    # Если передан аргумент
    if [ $# -gt 0 ]; then
        case "$1" in
            setup)
                check_python
                check_node
                setup_backend
                setup_frontend
                print_status "Проект полностью настроен!"
                echo ""
                print_info "Для запуска используйте:"
                echo "  Backend:  ./setup.sh backend"
                echo "  Frontend: ./setup.sh frontend"
                echo "  Оба:      ./setup.sh start"
                ;;
            backend)
                start_backend
                ;;
            frontend)
                start_frontend
                ;;
            start)
                print_info "Запуск Backend и Frontend..."
                print_warning "Backend будет запущен на http://localhost:8000"
                print_warning "Frontend будет запущен на http://localhost:3000"
                echo ""
                
                # Запуск в фоне
                gnome-terminal --tab --title="Backend" -- bash -c "cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; exec bash" 2>/dev/null || \
                osascript -e 'tell app "Terminal" to do script "cd '$PWD'/backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"' 2>/dev/null || \
                (cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &)
                
                sleep 3
                
                gnome-terminal --tab --title="Frontend" -- bash -c "cd frontend && npm run dev; exec bash" 2>/dev/null || \
                osascript -e 'tell app "Terminal" to do script "cd '$PWD'/frontend && npm run dev"' 2>/dev/null || \
                (cd frontend && npm run dev &)
                
                print_status "Серверы запускаются..."
                sleep 5
                print_status "Готово!"
                print_info "Backend: http://localhost:8000"
                print_info "Frontend: http://localhost:3000"
                print_info "API Docs: http://localhost:8000/api/docs"
                ;;
            *)
                print_error "Неизвестная команда: $1"
                echo "Использование: ./setup.sh [setup|backend|frontend|start]"
                exit 1
                ;;
        esac
    else
        # Интерактивное меню
        while true; do
            show_menu
            read choice
            case $choice in
                1)
                    check_python
                    check_node
                    setup_backend
                    setup_frontend
                    print_status "Установка завершена!"
                    ;;
                2)
                    start_backend
                    ;;
                3)
                    start_frontend
                    ;;
                4)
                    print_info "Откройте два терминала и запустите:"
                    echo "  Терминал 1: ./setup.sh backend"
                    echo "  Терминал 2: ./setup.sh frontend"
                    ;;
                5)
                    print_info "До свидания!"
                    exit 0
                    ;;
                *)
                    print_error "Неверный выбор. Попробуйте снова."
                    ;;
            esac
            echo ""
            read -p "Нажмите Enter для продолжения..."
            clear
        done
    fi
}

# Запуск
main "$@"
