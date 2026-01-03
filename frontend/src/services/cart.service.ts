/**
 * Cart API service
 */

import api from './api';
import { Cart, CartItem } from '../types';

interface AddToCartData {
  product_id: number;
  quantity: number;
}

interface UpdateCartItemData {
  quantity: number;
}

export const cartService = {
  /**
   * Get cart
   */
  getCart: async (): Promise<Cart> => {
    const response = await api.get<{ items: CartItem[] }>('/cart');
    const items = response.data.items;
    
    return {
      items,
      total_items: items.reduce((sum, item) => sum + item.quantity, 0),
      total_price: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  },

  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartData): Promise<CartItem> => {
    const response = await api.post<CartItem>('/cart/items', data);
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (itemId: number, data: UpdateCartItemData): Promise<CartItem> => {
    const response = await api.put<CartItem>(`/cart/items/${itemId}`, data);
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId: number): Promise<void> => {
    await api.delete(`/cart/items/${itemId}`);
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};
