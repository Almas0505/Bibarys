/**
 * Admin API Service
 * Handles all admin-related API calls
 */
import api from './api';

export const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async (skip = 0, limit = 100) => {
    const response = await api.get('/admin/users', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Get all orders
   */
  getAllOrders: async (page = 1, page_size = 20, status?: string, user_id?: number) => {
    const response = await api.get('/admin/orders', {
      params: { page, page_size, status, user_id }
    });
    return response.data;
  },

  /**
   * Get all products
   */
  getAllProducts: async (skip = 0, limit = 100) => {
    const response = await api.get('/admin/products', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Export analytics to PDF
   */
  exportPDF: async () => {
    const response = await api.get('/admin/export/pdf', {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get platform statistics
   */
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (userId: number) => {
    const response = await api.patch(`/admin/users/${userId}/toggle-active`);
    return response.data;
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: number) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  /**
   * Toggle product active status
   */
  toggleProductStatus: async (productId: number) => {
    const response = await api.patch(`/products/${productId}/toggle-active`);
    return response.data;
  }
};
