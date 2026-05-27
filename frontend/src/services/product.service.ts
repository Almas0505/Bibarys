/**
 * Product API service
 */

import api from './api';
import {
  Product,
  ProductFilter,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  image_urls?: string[];
}

interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean;
}

export const productService = {
  /**
   * Get all products with filters and pagination
   */
  getProducts: async (
    filters: ProductFilter = {},
    pagination: PaginationParams = { page: 1, page_size: 20 }
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', pagination.page.toString());
    params.append('page_size', pagination.page_size.toString());
    
    // Add filters
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.seller_id !== undefined) params.append('seller_id', filters.seller_id.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create new product (seller only)
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  /**
   * Update product (seller only)
   */
  updateProduct: async (id: number, data: UpdateProductData): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product (seller only)
   */
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/featured');
    return response.data;
  },

  /**
   * Search products
   */
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/search?q=${query}`);
    return response.data;
  },
};
