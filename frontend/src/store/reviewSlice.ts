/**
 * Review slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { Review } from '../types';

interface ReviewState {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  pagination: {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async (
    params: { productId: number; page?: number; rating?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/products/${params.productId}/reviews`, {
        params: {
          page: params.page || 1,
          page_size: 10,
          rating: params.rating,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (
    data: {
      productId: number;
      rating: number;
      title?: string;
      text?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/products/${data.productId}/reviews`, {
        rating: data.rating,
        title: data.title,
        text: data.text,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete review');
    }
  }
);

// Slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch reviews
    builder.addCase(fetchProductReviews.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchProductReviews.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reviews = action.payload.items;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        page_size: action.payload.page_size,
        total_pages: action.payload.total_pages,
      };
      state.error = null;
    });
    builder.addCase(fetchProductReviews.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create review
    builder.addCase(createReview.fulfilled, (state, action) => {
      state.reviews.unshift(action.payload);
    });

    // Delete review
    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
    });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
