import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchTechniciansRequest,
  fetchTechniciansSuccess,
  fetchTechniciansFailure,
  createTechnicianRequest,
  createTechnicianSuccess,
  createTechnicianFailure,
  updateTechnicianRequest,
  updateTechnicianSuccess,
  updateTechnicianFailure,
  deleteTechnicianRequest,
  deleteTechnicianSuccess,
  deleteTechnicianFailure,
  checkTechnicianStatusRequest,
checkTechnicianStatusSuccess,
checkTechnicianStatusFailure,
fetchActiveTechniciansRequest,
fetchActiveTechniciansSuccess,
fetchActiveTechniciansFailure 
} from './technicianSlice';
import * as technicianService from './technicianService';

function* handleFetchTechnicians() {
  try {
    const response = yield call(technicianService.fetchTechnicians);
    yield put(fetchTechniciansSuccess(response.data));
  } catch (error) {
    yield put(fetchTechniciansFailure(error.message));
  }
}

function* handleCreateTechnician(action) {
  try {
    const response = yield call(technicianService.createTechnician, action.payload);
    yield put(createTechnicianSuccess(response.data));
    yield put(fetchTechniciansRequest());
  } catch (error) {
    yield put(createTechnicianFailure(error.message));
  }
}

function* handleUpdateTechnician(action) {
  try {
    const { serviceNum, ...data } = action.payload;
    const response = yield call(technicianService.updateTechnician, serviceNum, data);
    yield put(updateTechnicianSuccess(response.data));
  } catch (error) {
    yield put(updateTechnicianFailure(error.message));
  }
}

function* handleDeleteTechnician(action) {
  try {
    yield call(technicianService.deleteTechnician, action.payload);
    yield put(deleteTechnicianSuccess(action.payload));
  } catch (error) {
    yield put(deleteTechnicianFailure(error.message));
  }
}
function* handleCheckTechnicianStatus() {
  try {
    const response = yield call(technicianService.checkTechnicianStatus);
    yield put(checkTechnicianStatusSuccess(response.data));
  } catch (error) {
    yield put(checkTechnicianStatusFailure(error.message));
    // Optionally, redirect to login if inactive:
    // window.location.href = '/login'; // Optional redirect
  }
}
function* handleFetchActiveTechnicians(): any {
  try {
    const response = yield call(technicianService.fetchActiveTechnicians);
    yield put(fetchActiveTechniciansSuccess(response.data));
  } catch (error: any) {
    yield put(fetchActiveTechniciansFailure(error.message || 'Failed to fetch active technicians'));
  }
}

export default function* technicianSaga() {
  yield takeLatest(fetchTechniciansRequest.type, handleFetchTechnicians);
  yield takeLatest(createTechnicianRequest.type, handleCreateTechnician);
  yield takeLatest(updateTechnicianRequest.type, handleUpdateTechnician);
  yield takeLatest(deleteTechnicianRequest.type, handleDeleteTechnician);
  yield takeLatest(checkTechnicianStatusRequest.type, handleCheckTechnicianStatus); 
  yield takeLatest(fetchActiveTechniciansRequest.type, handleFetchActiveTechnicians);
}