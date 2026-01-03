/**
 * Auth slice for Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services';
import { User, LoginCredentials, RegisterData, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getCachedUser(),
  tokens: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { user, tokens } = await authService.login(credentials);
      return { user, tokens };
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      // Handle array of validation errors or string error
      const errorMessage = Array.isArray(detail)
        ? detail.map((err: any) => err.msg || err).join(', ')
        : typeof detail === 'object'
        ? JSON.stringify(detail)
        : detail || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const user = await authService.register(data);
      return user;
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      // Handle array of validation errors or string error
      const errorMessage = Array.isArray(detail)
        ? detail.map((err: any) => err.msg || err).join(', ')
        : typeof detail === 'object'
        ? JSON.stringify(detail)
        : detail || 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      // Handle array of validation errors or string error
      const errorMessage = Array.isArray(detail)
        ? detail.map((err: any) => err.msg || err).join(', ')
        : typeof detail === 'object'
        ? JSON.stringify(detail)
        : detail || 'Failed to get user';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
