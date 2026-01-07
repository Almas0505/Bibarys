/**
 * UI slice for Redux store (toast, modals, global UI state)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UIState {
  toasts: Toast[];
  modals: Record<string, boolean>;
  globalLoading: boolean;
}

const initialState: UIState = {
  toasts: [],
  modals: {},
  globalLoading: false,
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9);
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  showToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
