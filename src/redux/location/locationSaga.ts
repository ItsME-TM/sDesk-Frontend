// locationSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "./locationService";
import {
  fetchLocationsRequest,
  fetchLocationsSuccess,
  fetchLocationsFailure,
  createLocationRequest,
  createLocationSuccess,
  createLocationFailure,
  updateLocationRequest,
  updateLocationSuccess,
  updateLocationFailure,
  deleteLocationRequest,
  deleteLocationSuccess,
  deleteLocationFailure,
} from "./locationSlice";

function* handleFetchLocations() {
  try {
    console.log("🔄 Saga: Fetching locations from API...");
    const response = yield call(fetchLocations);
    console.log("✅ Saga: API response:", response);
    console.log("✅ Saga: API response.data:", response.data);
    yield put(fetchLocationsSuccess(response.data));
    console.log("✅ Saga: Dispatched fetchLocationsSuccess");
  } catch (error) {
    console.error("❌ Saga: Fetch error:", error);
    console.error("❌ Saga: Error message:", error.message);
    yield put(fetchLocationsFailure(error.message));
  }
}

function* handleCreateLocation(action: any) {
  try {
    console.log("➕ Saga: Creating location with payload:", action.payload);
    const response = yield call(createLocation, action.payload);
    console.log("✅ Saga: Create response:", response);
    yield put(createLocationSuccess(response.data));
    console.log(
      "✅ Saga: Dispatched createLocationSuccess, now fetching all..."
    );
    yield put(fetchLocationsRequest());
  } catch (error) {
    console.error("❌ Saga: Create error:", error);
    console.error("❌ Saga: Create error message:", error.message);
    yield put(createLocationFailure(error.message));
  }
}

function* handleUpdateLocation(action: any) {
  try {
    console.log("✏️ Saga: Updating location with payload:", action.payload);
    const { id, data } = action.payload;
    const response = yield call(updateLocation, id, data);
    console.log("✅ Saga: Update response:", response);
    yield put(updateLocationSuccess(response.data));
    console.log(
      "✅ Saga: Dispatched updateLocationSuccess, now fetching all..."
    );
    yield put(fetchLocationsRequest());
  } catch (error) {
    console.error("❌ Saga: Update error:", error);
    console.error("❌ Saga: Update error message:", error.message);
    yield put(updateLocationFailure(error.message));
  }
}

function* handleDeleteLocation(action: any) {
  try {
    console.log("🗑️ Saga: Deleting location with id:", action.payload);
    const id = action.payload;
    yield call(deleteLocation, id);
    console.log("✅ Saga: Delete successful");
    yield put(deleteLocationSuccess(id));
    console.log(
      "✅ Saga: Dispatched deleteLocationSuccess, now fetching all..."
    );
    yield put(fetchLocationsRequest());
  } catch (error) {
    console.error("❌ Saga: Delete error:", error);
    console.error("❌ Saga: Delete error message:", error.message);
    yield put(deleteLocationFailure(error.message));
  }
}

export default function* locationSaga() {
  yield takeLatest(fetchLocationsRequest.type, handleFetchLocations);
  yield takeLatest(createLocationRequest.type, handleCreateLocation);
  yield takeLatest(updateLocationRequest.type, handleUpdateLocation);
  yield takeLatest(deleteLocationRequest.type, handleDeleteLocation);
}
