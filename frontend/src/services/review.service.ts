/**
 * Review API service
 */

import api from './api';
import { Review, PaginatedResponse, PaginationParams } from '../types';

interface CreateReviewData {
  product_id: number;
  rating: number;
  title?: string;
  text?: string;
  images?: string[];
}

interface UpdateReviewData {
  rating?: number;
  title?: string;
  text?: string;
  images?: string[];
}

export const reviewService = {
  /**
   * Get reviews for product
   */
  getProductReviews: async (
    productId: number,
    pagination: PaginationParams = { page: 1, page_size: 20 }
  ): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    params.append('page', pagination.page.toString());
    params.append('page_size', pagination.page_size.toString());
    
    const response = await api.get<PaginatedResponse<Review>>(
      `/reviews/product/${productId}?${params}`
    );
    return response.data;
  },

  /**
   * Get review by ID
   */
  getReview: async (id: number): Promise<Review> => {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Create review
   */
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  /**
   * Update review
   */
  updateReview: async (id: number, data: UpdateReviewData): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Delete review
   */
  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  /**
   * Mark review as helpful
   */
  markHelpful: async (id: number): Promise<void> => {
    await api.post(`/reviews/${id}/helpful`);
  },
};
