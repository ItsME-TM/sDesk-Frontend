import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchAllIncidents,
  createIncident,
  updateIncident,
  getIncidentByNumber,
  getIncidentsAssignedToMe,
  getIncidentsAssignedByMe,
  getTeamIncidents,
} from "./incidentService";
import {
  fetchAllIncidentsRequest,
  fetchAllIncidentsSuccess,
  fetchAllIncidentsFailure,
  createIncidentRequest,
  createIncidentSuccess,
  createIncidentFailure,
  updateIncidentRequest,
  updateIncidentSuccess,
  updateIncidentFailure,
  getIncidentByNumberRequest,
  getIncidentByNumberSuccess,
  getIncidentByNumberFailure,
  getAssignedToMeRequest,
  getAssignedToMeSuccess,
  getAssignedToMeFailure,
  getAssignedByMeRequest,
  getAssignedByMeSuccess,
  getAssignedByMeFailure,
  getTeamIncidentsRequest,
  getTeamIncidentsSuccess,
  getTeamIncidentsFailure,
} from "./incidentSlice";

function* handleFetchAllIncidents() {
  try {
    const response = yield call(fetchAllIncidents);
    yield put(fetchAllIncidentsSuccess(response.data));
  } catch (error) {
    console.error("Error fetching all incidents:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    yield put(fetchAllIncidentsFailure(errorMessage));
  }
}

function* handleCreateIncident(action) {
  try {
    console.log("Creating incident with data:", action.payload);
    const response = yield call(createIncident, action.payload);
    yield put(createIncidentSuccess(response.data));
    // Refresh the assigned to me list for the handler
    yield put(getAssignedToMeRequest({ handler: action.payload.handler }));
    // Optionally refetch all incidents
    yield put(fetchAllIncidentsRequest());
  } catch (error) {
    console.error("Error creating incident:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    yield put(createIncidentFailure(errorMessage));
  }
}

function* handleUpdateIncident(action) {
  try {
    console.log("Updating incident with data:", action.payload);
    const { incident_number, data } = action.payload;
    const response = yield call(updateIncident, incident_number, data);
    yield put(updateIncidentSuccess(response.data));
    // Optionally refetch all incidents
    yield put(fetchAllIncidentsRequest());
  } catch (error) {
    console.error("Error updating incident:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    yield put(updateIncidentFailure(errorMessage));
  }
}

function* handleGetIncidentByNumber(action) {
  try {
    const { incident_number } = action.payload;
    const response = yield call(getIncidentByNumber, incident_number);
    yield put(getIncidentByNumberSuccess(response.data));
  } catch (error) {
    yield put(getIncidentByNumberFailure(error.message));
  }
}

function* handleGetAssignedToMe(action) {
  try {
    const { handler } = action.payload;
    const response = yield call(getIncidentsAssignedToMe, handler);
    yield put(getAssignedToMeSuccess(response.data));
  } catch (error) {
    yield put(getAssignedToMeFailure(error.message));
  }
}

function* handleGetAssignedByMe(action) {
  try {
    const { informant } = action.payload; // Destructure informant from payload object
    const response = yield call(getIncidentsAssignedByMe, informant);
    yield put(getAssignedByMeSuccess(response.data));
  } catch (error) {
    yield put(getAssignedByMeFailure(error.message));
  }
}

function* handleGetTeamIncidents(action) {
  try {
    const { category } = action.payload;
    const response = yield call(getTeamIncidents, category);
    yield put(getTeamIncidentsSuccess(response.data));
  } catch (error) {
    yield put(getTeamIncidentsFailure(error.message));
  }
}

export default function* incidentSaga() {
  yield takeLatest(fetchAllIncidentsRequest.type, handleFetchAllIncidents);
  yield takeLatest(createIncidentRequest.type, handleCreateIncident);
  yield takeLatest(updateIncidentRequest.type, handleUpdateIncident);
  yield takeLatest(getIncidentByNumberRequest.type, handleGetIncidentByNumber);
  yield takeLatest(getAssignedToMeRequest.type, handleGetAssignedToMe);
  yield takeLatest(getAssignedByMeRequest.type, handleGetAssignedByMe);
  yield takeLatest(getTeamIncidentsRequest.type, handleGetTeamIncidents);
}
