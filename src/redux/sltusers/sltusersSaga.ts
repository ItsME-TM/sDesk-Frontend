import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchUserByEmailRequest,
  fetchUserByEmailSuccess,
  fetchUserByEmailFailure,
  fetchUserByServiceNumberRequest,
  fetchUserByServiceNumberSuccess,
  fetchUserByServiceNumberFailure,
  updateUserRoleRequest,
  updateUserRoleSuccess,
  updateUserRoleFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
} from './sltusersSlice';
import * as sltusersService from './sltusersService';

function* fetchUserByEmailSaga(action) {
  try {
    // This is a placeholder - you may need to implement this properly
    yield put(fetchUserByEmailFailure('fetchUserByEmail not implemented'));
  } catch (error) {
    yield put(fetchUserByEmailFailure(error.message || 'Failed to fetch user by email'));
  }
}

function* fetchUserByServiceNumberSaga(action) {
  try {
    const serviceNum = action.payload;
    const response = yield call(sltusersService.fetchUserByServiceNum, serviceNum);
    yield put(fetchUserByServiceNumberSuccess(response.data));
  } catch (error) {
    console.error('fetchUserByServiceNumberSaga error:', error);
    yield put(fetchUserByServiceNumberFailure(error.message || 'Failed to fetch user by service number'));
  }
}

function* updateUserRoleSaga(action) {
  try {
    console.log('updateUserRoleSaga called with payload:', action.payload);
    const { serviceNum, role } = action.payload;
    console.log('Calling updateUser API with:', { serviceNum, role });
    console.log('API URL will be:', `http://localhost:8000/sltusers/${serviceNum}`);
    console.log('Request body will be:', { role });
    
    const response = yield call(sltusersService.updateUser, serviceNum, { role });
    console.log('updateUser API response:', response.data);
    yield put(updateUserRoleSuccess(response.data));
    console.log('updateUserRoleSuccess dispatched');
  } catch (error) {
    console.error('updateUserRoleSaga error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    yield put(updateUserRoleFailure(error.message || 'Failed to update user role'));
  }
}

function* fetchAllUsersSaga() {
  try {
    const response = yield call(sltusersService.fetchAllUsers);
    yield put(fetchAllUsersSuccess(response.data));
  } catch (error) {
    console.error('fetchAllUsersSaga error:', error);
    yield put(fetchAllUsersFailure(error.message || 'Failed to fetch all users'));
  }
}

export default function* sltusersSaga() {
  yield takeLatest(fetchUserByServiceNumberRequest.type, fetchUserByServiceNumberSaga);
  yield takeLatest(fetchUserByEmailRequest.type, fetchUserByEmailSaga);
  yield takeLatest(updateUserRoleRequest.type, updateUserRoleSaga);
  yield takeLatest(fetchAllUsersRequest.type, fetchAllUsersSaga);
}
