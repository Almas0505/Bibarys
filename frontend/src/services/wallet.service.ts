/**
 * Wallet API Service
 * Handles all wallet-related API calls
 */
import api from './api';

export const walletService = {
  /**
   * Get current wallet balance
   */
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  /**
   * Deposit money into wallet
   */
  deposit: async (amount: number) => {
    const response = await api.post('/wallet/deposit', { amount });
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (skip = 0, limit = 50) => {
    const response = await api.get('/wallet/transactions', {
      params: { skip, limit }
    });
    return response.data;
  }
};
