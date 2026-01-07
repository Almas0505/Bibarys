/**
 * Cart slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services';
import { Cart } from '../types';

interface CartState {
  cart: Cart;
  promoCode: string | null;
  discount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: {
    items: [],
    total_items: 0,
    total_price: 0,
  },
  promoCode: null,
  discount: 0,
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

export const applyPromoCode = createAsyncThunk(
  'cart/applyPromoCode',
  async (promoCode: string, { rejectWithValue }) => {
    try {
      const response = await cartService.applyPromoCode(promoCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to apply promo code');
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
      state.promoCode = null;
      state.discount = 0;
    });

    // Apply promo code
    builder.addCase(applyPromoCode.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(applyPromoCode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.promoCode = action.payload.promoCode;
      state.discount = action.payload.discount;
      state.error = null;
    });
    builder.addCase(applyPromoCode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
