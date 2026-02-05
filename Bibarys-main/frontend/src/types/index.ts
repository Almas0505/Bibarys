/**
 * TypeScript types and interfaces for the application
 */

// User types
export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Product types
export enum ProductCategory {
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  BEVERAGES = 'beverages',
  MEAT = 'meat',
  FRUITS_VEGETABLES = 'fruits_vegetables',
  FROZEN = 'frozen',
  GROCERY = 'grocery',
  SWEETS = 'sweets',
  CANNED = 'canned',
  OTHER = 'other',
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: ProductCategory;
  seller_id: number;
  image_urls: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  seller_id: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_price: number;
  delivery_method: string;
  delivery_cost: number;
  delivery_address: string;
  phone: string;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Review types
export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  text?: string;
  images: string[];
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  user_first_name: string;
  user_last_name: string;
}

// Payment types
export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  WALLET = 'wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
}

// Cart types
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image: string;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Filter types
export interface ProductFilter {
  category?: ProductCategory;
  min_price?: number;
  max_price?: number;
  search?: string;
  seller_id?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
