/**
 * Wishlist slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await api.post('/wishlist', { product_id: productId });
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/wishlist');
      return;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to clear wishlist');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder.addCase(fetchWishlist.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
      state.error = null;
    });
    builder.addCase(fetchWishlist.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add to wishlist
    builder.addCase(addToWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // Remove from wishlist
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // Clear wishlist
    builder.addCase(clearWishlist.fulfilled, (state) => {
      state.items = [];
    });
  },
});

export const { clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
