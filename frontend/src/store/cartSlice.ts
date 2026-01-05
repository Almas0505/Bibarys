/**
 * Cart slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services';
import { Cart } from '../types';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: {
    items: [],
    total_items: 0,
    total_price: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartService.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: { product_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      await cartService.addToCart(data);
      const cart = await cartService.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: { itemId: number; quantity: number }, { rejectWithValue }) => {
    try {
      await cartService.updateCartItem(data.itemId, { quantity: data.quantity });
      const cart = await cartService.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId);
      const cart = await cartService.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to clear cart');
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cart = action.payload;
      state.error = null;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add to cart
    builder.addCase(addToCart.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cart = action.payload;
      state.error = null;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update cart item
    builder.addCase(updateCartItem.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cart = action.payload;
      state.error = null;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Remove from cart
    builder.addCase(removeFromCart.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cart = action.payload;
      state.error = null;
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Clear cart
    builder.addCase(clearCart.fulfilled, (state) => {
      state.cart = {
        items: [],
        total_items: 0,
        total_price: 0,
      };
    });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
