import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  identifier: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthOpen: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lc_token', action.payload.token);
        localStorage.setItem('lc_user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lc_token');
        localStorage.removeItem('lc_user');
      }
    },
    setIsAuthOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthOpen = action.payload;
    },
    toggleAuth: (state) => {
      state.isAuthOpen = !state.isAuthOpen;
    },
    initializeAuthFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('lc_token');
        const storedUser = localStorage.getItem('lc_user');
        if (storedToken && storedUser) {
          try {
            state.token = storedToken;
            state.user = JSON.parse(storedUser);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      }
    },
  },
});

export const { setUser, logout, setIsAuthOpen, toggleAuth, initializeAuthFromStorage } = authSlice.actions;

export default authSlice.reducer;
