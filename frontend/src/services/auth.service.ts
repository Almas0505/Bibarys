/**
 * Authentication API service
 */

import api from './api';
import {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  User,
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<AuthTokens>('/auth/login', credentials);
    const tokens = response.data;
    
    // Save tokens
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    
    // Get user info
    const user = await authService.getCurrentUser();
    
    return { user, tokens };
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Get current logged in user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    const user = response.data;
    
    // Cache user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    const tokens = response.data;
    
    // Save new tokens
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    
    return tokens;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get cached user from localStorage
   */
  getCachedUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/me', data);
    const user = response.data;
    
    // Update cached user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  },
};
