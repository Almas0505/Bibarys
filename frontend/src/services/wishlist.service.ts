/**
 * Wishlist API service
 */

import api from './api';
import { Product } from '../types';

export const wishlistService = {
  /**
   * Get wishlist
   */
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/wishlist');
    return response.data;
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId: number): Promise<void> => {
    await api.post(`/wishlist/${productId}`);
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: number): Promise<boolean> => {
    try {
      const wishlist = await wishlistService.getWishlist();
      return wishlist.some(product => product.id === productId);
    } catch (error) {
      return false;
    }
  },
};
