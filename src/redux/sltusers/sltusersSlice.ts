import { createSlice } from '@reduxjs/toolkit';
import { SLTUsersState } from './sltusersTypes';

const initialState: SLTUsersState = {
  user: null,
  loading: false,
  error: null,
};

const sltusersSlice = createSlice({
  name: 'sltusers',
  initialState,
  reducers: {
    fetchUserByEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserByServiceNumberRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserByServiceNumberSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },
    fetchUserByServiceNumberFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUserByEmailSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },    fetchUserByEmailFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserRoleRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateUserRoleSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },
    updateUserRoleFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },    clearUser(state) {
      state.user = null;
      state.error = null;
    },
  },
});

export const {
  fetchUserByEmailRequest,
  fetchUserByEmailSuccess,
  fetchUserByEmailFailure,
  fetchUserByServiceNumberRequest,
  fetchUserByServiceNumberSuccess,
  fetchUserByServiceNumberFailure,
  updateUserRoleRequest,
  updateUserRoleSuccess,
  updateUserRoleFailure,
  clearUser,
} = sltusersSlice.actions;

export default sltusersSlice.reducer;
