/**
 * Wishlist slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService, WishlistItem } from '../services/wishlist.service';

interface WishlistState {
  items: WishlistItem[];
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
      const items = await wishlistService.getWishlist();
      return items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistService.addToWishlist(productId);
      const items = await wishlistService.getWishlist();
      return items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      const items = await wishlistService.getWishlist();
      return items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clearWishlist();
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to clear wishlist');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default wishlistSlice.reducer;
