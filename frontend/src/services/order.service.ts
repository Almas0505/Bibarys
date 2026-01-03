/**
 * Order API service
 */

import api from './api';
import { Order, PaginatedResponse, PaginationParams } from '../types';

interface CreateOrderData {
  delivery_method: string;
  delivery_address: string;
  phone: string;
  notes?: string;
  payment_method: string;
}

export const orderService = {
  /**
   * Get all orders for current user
   */
  getOrders: async (pagination: PaginationParams = { page: 1, page_size: 20 }): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    params.append('page', pagination.page.toString());
    params.append('page_size', pagination.page_size.toString());
    
    const response = await api.get<PaginatedResponse<Order>>(`/orders?${params}`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create order from cart
   */
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: number): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * Track order
   */
  trackOrder: async (trackingNumber: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/track/${trackingNumber}`);
    return response.data;
  },
};
