import { call, put, takeLatest, delay } from 'redux-saga/effects';
import {
  lookupUserRequest,
  lookupUserSuccess,
  lookupUserFailure,
} from './userLookupSlice';
import * as userLookupService from './userLookupService';

function* lookupUserSaga(action: any) {
  const maxRetries = 2;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`UserLookup Saga: Attempt ${retryCount + 1}/${maxRetries + 1} for service number:`, action.payload);
      console.log('UserLookup Saga: Action type:', action.type);
      
      const response = yield call(userLookupService.lookupUserByServiceNum, action.payload);
      console.log('UserLookup Saga: ✅ API call successful:', response.status);
      console.log('UserLookup Saga: ✅ User found:', response.data?.display_name || response.data?.serviceNum);
      
      yield put(lookupUserSuccess(response.data));
      console.log('UserLookup Saga: ✅ Success action dispatched');
      return; // Exit successfully
    } catch (error: any) {
      console.log(`UserLookup Saga: ❌ Attempt ${retryCount + 1} failed for service number: ${action.payload}`);
      console.log('UserLookup Saga: Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        isUserNotFound: error.response?.status === 404
      });
      
      retryCount++;
      
      // Don't retry for 404 (user not found) or other client errors (4xx)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        console.log('UserLookup Saga: Client error (4xx) - not retrying');
        // Jump to error handling
        retryCount = maxRetries + 1;
      }
      
      // If this is not the last attempt and it's a retryable error, retry
      if (retryCount <= maxRetries && 
          (error.code === 'ECONNREFUSED' || 
           error.code === 'ERR_NETWORK' || 
           error.code === 'ECONNABORTED' ||
           (!error.response && !status))) {
        console.log(`UserLookup Saga: 🔄 Retrying in 1 second... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        yield delay(1000); // Wait 1 second before retry
        continue;
      }
      
      // If we've exhausted retries or it's not a retryable error, handle the error
      let errorMessage = 'Failed to lookup user';
      
      // Handle different types of errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8000.';
        console.error('UserLookup Saga: 🌐 Network connection error');
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
        console.error('UserLookup Saga: ⏱️ Request timeout error');
      } else if (error.response) {
        // Server responded with error status
        console.log('UserLookup Saga: 🗄️ Server responded with status:', status);
        
        if (status === 404) {
          errorMessage = `User not found with service number: ${action.payload}`;
          console.log('UserLookup Saga: 👤 User not found - this is normal for non-existent service numbers');
        } else if (status === 500) {
          errorMessage = 'Server error occurred while looking up user';
          console.error('UserLookup Saga: 🔥 Server internal error');
        } else if (status === 403) {
          errorMessage = 'Access denied. Please check your permissions.';
          console.error('UserLookup Saga: 🚫 Access denied');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error (${status}): ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('UserLookup Saga: 📡 No response received from server');
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      console.log('UserLookup Saga: 📝 Final error message:', errorMessage);
      yield put(lookupUserFailure(errorMessage));
      console.log('UserLookup Saga: ❌ Failure action dispatched');
      return; // Exit with error
    }
  }
}

export default function* userLookupSaga() {
  console.log('UserLookup Saga: Root saga initialized');
  yield takeLatest(lookupUserRequest.type, lookupUserSaga);
  console.log('UserLookup Saga: Listening for action type:', lookupUserRequest.type);
}
