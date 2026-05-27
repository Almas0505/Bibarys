/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SaudaFlow';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: 'dairy', label: 'Молочные продукты' },
  { value: 'bakery', label: 'Хлебобулочные изделия' },
  { value: 'beverages', label: 'Напитки' },
  { value: 'meat', label: 'Мясо и колбасы' },
  { value: 'fruits_vegetables', label: 'Овощи и фрукты' },
  { value: 'frozen', label: 'Замороженные продукты' },
  { value: 'grocery', label: 'Бакалея (крупы, макароны)' },
  { value: 'sweets', label: 'Сладости и снеки' },
  { value: 'canned', label: 'Консервы' },
  { value: 'other', label: 'Другое' },
] as const;

// Product Categories Map (for displaying labels)
export const PRODUCT_CATEGORIES_MAP: Record<string, string> = {
  dairy: 'Молочные продукты',
  bakery: 'Хлебобулочные изделия',
  beverages: 'Напитки',
  meat: 'Мясо и колбасы',
  fruits_vegetables: 'Овощи и фрукты',
  frozen: 'Замороженные продукты',
  grocery: 'Бакалея (крупы, макароны)',
  sweets: 'Сладости и снеки',
  canned: 'Консервы',
  other: 'Другое',
};

// Order Statuses
export const ORDER_STATUSES = {
  pending: { label: 'Ожидает', color: 'yellow' },
  processing: { label: 'В обработке', color: 'blue' },
  shipped: { label: 'Отправлен', color: 'purple' },
  delivered: { label: 'Доставлен', color: 'green' },
  cancelled: { label: 'Отменён', color: 'red' },
} as const;

// Delivery Methods
export const DELIVERY_METHODS = [
  { value: 'standard', label: 'Стандартная доставка', cost: 2000, days: '5-7 дней' },
  { value: 'express', label: 'Экспресс доставка', cost: 5000, days: '1-2 дня' },
  { value: 'pickup', label: 'Самовывоз', cost: 0, days: 'Сегодня' },
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'card', label: 'Банковская карта', icon: '💳' },
  { value: 'cash', label: 'Наличные при получении', icon: '💵' },
  { value: 'wallet', label: 'Виртуальный кошелек', icon: '👛' },
] as const;

// User Roles
export const USER_ROLES = {
  admin: { label: 'Администратор', color: 'red' },
  seller: { label: 'Продавец', color: 'blue' },
  customer: { label: 'Покупатель', color: 'green' },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  SELLER: '/seller',
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-()]+$/,
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Вы успешно вошли в систему',
  LOGOUT_SUCCESS: 'Вы вышли из системы',
  REGISTER_SUCCESS: 'Регистрация успешна',
  ADD_TO_CART: 'Товар добавлен в корзину',
  REMOVE_FROM_CART: 'Товар удалён из корзины',
  ADD_TO_WISHLIST: 'Товар добавлен в избранное',
  REMOVE_FROM_WISHLIST: 'Товар удалён из избранного',
  ORDER_CREATED: 'Заказ успешно создан',
  ORDER_CANCELLED: 'Заказ отменён',
  REVIEW_CREATED: 'Отзыв добавлен',
  GENERIC_ERROR: 'Произошла ошибка. Попробуйте снова',
} as const;

// Placeholder Images
export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e2e8f0/64748b?text=Product';
export const PLACEHOLDER_AVATAR = 'https://placehold.co/150x150/e2e8f0/64748b?text=Avatar';

// Rating Stars
export const RATING_STARS = [1, 2, 3, 4, 5] as const;
