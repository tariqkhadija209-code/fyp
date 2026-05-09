import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  theme: 'light', // 'light' or 'dark'
  notifications: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { setLoading, toggleTheme, addNotification, clearNotifications } = appSlice.actions;

// Selectors
export const selectIsLoading = (state) => state.app.isLoading;
export const selectTheme = (state) => state.app.theme;
export const selectNotifications = (state) => state.app.notifications;

export default appSlice.reducer;
