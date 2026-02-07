# SaudaFlow - Frontend

React + TypeScript фронтенд для интернет-магазина.

## Технологии

- **React 18** - библиотека для построения UI
- **TypeScript** - типизированный JavaScript
- **Vite** - современный сборщик
- **Redux Toolkit** - управление состоянием
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Tailwind CSS** - утилитный CSS фреймворк

## Структура проекта

```
frontend/
├── src/
│   ├── components/     # React компоненты
│   │   ├── common/     # Общие компоненты (LoadingSpinner, etc.)
│   │   ├── auth/       # Компоненты аутентификации
│   │   └── layout/     # Компоненты макета (Header, Footer)
│   ├── pages/          # Страницы приложения
│   ├── services/       # API сервисы
│   ├── store/          # Redux store и slices
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript типы
│   ├── utils/          # Утилиты и константы
│   ├── App.tsx         # Главный компонент
│   ├── main.tsx        # Точка входа
│   └── index.css       # Глобальные стили
├── public/             # Статические файлы
├── index.html          # HTML шаблон
├── package.json        # Зависимости
├── tsconfig.json       # Конфигурация TypeScript
├── vite.config.ts      # Конфигурация Vite
└── tailwind.config.js  # Конфигурация Tailwind
```

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SaudaFlow
```

## Запуск

### Development режим
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Production build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Основные функции

### Для всех пользователей:
- Просмотр каталога товаров
- Фильтрация и поиск товаров
- Просмотр деталей товара
- Регистрация и вход

### Для авторизованных пользователей:
- Корзина покупок
- Оформление заказа
- История заказов
- Список избранного
- Управление профилем

### Для продавцов:
- Управление своими товарами
- Просмотр своих заказов
- Аналитика продаж

### Для администраторов:
- Управление пользователями
- Просмотр всех заказов
- Общая статистика
- Управление всеми товарами

## Redux Store

Store разделён на следующие slices:

- **authSlice** - аутентификация пользователя
- **cartSlice** - корзина покупок
- **productSlice** - товары и фильтры
- **orderSlice** - заказы

## API Интеграция

Все API запросы идут через Axios instance с:
- Автоматическим добавлением JWT токена
- Обновлением токена при истечении
- Обработкой ошибок

## Роутинг

Защищённые маршруты используют компонент `ProtectedRoute` для проверки аутентификации и ролей.

## Стилизация

Приложение использует Tailwind CSS с кастомной цветовой темой:
- Основной цвет: Синий (#3B82F6)
- Акцентные цвета определены в `tailwind.config.js`

## Типы

Все TypeScript типы определены в `src/types/index.ts` и соответствуют backend моделям.

## Переменные окружения

- `VITE_API_BASE_URL` - URL backend API (по умолчанию: http://localhost:8000/api/v1)
- `VITE_APP_NAME` - Название приложения (по умолчанию: SaudaFlow)

## Скрипты

- `npm run dev` - Запуск dev сервера
- `npm run build` - Production сборка
- `npm run preview` - Просмотр production сборки
- `npm run lint` - Проверка кода (ESLint)

## Браузерная поддержка

- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)
