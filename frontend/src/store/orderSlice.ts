/**
 * Order slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../services';
import { Order, PaginationParams } from '../types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  pagination: {
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk<
  any,
  PaginationParams | undefined,
  { rejectValue: string }
>(
  'order/fetchOrders',
  async (pagination, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(pagination);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch orders');
    }
  }
);

export const fetchOrder = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>(
  'order/fetchOrder',
  async (id, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrder(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk<
  any,
  {
    delivery_method: string;
    delivery_address: string;
    phone: string;
    notes?: string;
    payment_method: string;
  },
  { rejectValue: string }
>(
  'order/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      const order = await orderService.createOrder(data);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create order');
    }
  }
);

export const cancelOrder = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>(
  'order/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const order = await orderService.cancelOrder(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel order');
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state: OrderState) => {
      state.currentOrder = null;
    },
    clearError: (state: OrderState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder.addCase(fetchOrders.pending, (state: OrderState) => {
      state.isLoading = true;
    });
    builder.addCase(fetchOrders.fulfilled, (state: OrderState, action) => {
      state.isLoading = false;
      state.orders = action.payload.items;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        page_size: action.payload.page_size,
        total_pages: action.payload.total_pages,
      };
      state.error = null;
    });
    builder.addCase(fetchOrders.rejected, (state: OrderState, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch order
    builder.addCase(fetchOrder.pending, (state: OrderState) => {
      state.isLoading = true;
    });
    builder.addCase(fetchOrder.fulfilled, (state: OrderState, action) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOrder.rejected, (state: OrderState, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create order
    builder.addCase(createOrder.pending, (state: OrderState) => {
      state.isLoading = true;
    });
    builder.addCase(createOrder.fulfilled, (state: OrderState, action) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(createOrder.rejected, (state: OrderState, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Cancel order
    builder.addCase(cancelOrder.pending, (state: OrderState) => {
      state.isLoading = true;
    });
    builder.addCase(cancelOrder.fulfilled, (state: OrderState, action) => {
      state.isLoading = false;
      // Update order in list if exists
      const index = state.orders.findIndex((o: Order) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      // Update current order if it's the same
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
      state.error = null;
    });
    builder.addCase(cancelOrder.rejected, (state: OrderState, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
