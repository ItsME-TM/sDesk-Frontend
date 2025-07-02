import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authTypes';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false, 
  error: null,
  isLoggedIn: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginWithMicrosoftRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginWithMicrosoftSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
      state.isLoggedIn = true;
    },
    loginWithMicrosoftFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
    },
    logoutRequest(state) {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess(state) {
      state.user = null;
      state.loading = false;
      state.isLoggedIn = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchLoggedUserRequest(state) {
      console.log('[AuthSlice] fetchLoggedUserRequest called');
      state.loading = true;
      state.error = null;
    },
    fetchLoggedUserSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
    },
    fetchLoggedUserFailure(state, action: PayloadAction<string>) {
      console.log('[AuthSlice] fetchLoggedUserFailure:', action.payload);
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.isLoggedIn = false;
    },
    refreshTokenRequest(state) {
      state.loading = true;
      state.error = null;
    },
    refreshTokenSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
      state.isLoggedIn = true;
    },
    refreshTokenFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.isLoggedIn = false;
    },
    resetAuthState(state) {
      state.loading = false;
      state.error = null;
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const {
  loginWithMicrosoftRequest,
  loginWithMicrosoftSuccess,
  loginWithMicrosoftFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  fetchLoggedUserRequest,
  fetchLoggedUserSuccess,
  fetchLoggedUserFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;