/**
 * Wishlist API service
 */

import api from './api';

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_rating: number;
  product_quantity: number;
}

export const wishlistService = {
  /**
   * Get wishlist
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await api.get<WishlistItem[]>('/wishlist');
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
   * Clear all items from wishlist
   */
  clearWishlist: async (): Promise<void> => {
    await api.delete('/wishlist');
  },
};
