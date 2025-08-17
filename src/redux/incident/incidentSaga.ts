import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchAllIncidents,
  createIncident,
  createIncidentWithAttachment,
  updateIncident,
  getIncidentByNumber,
  getIncidentsAssignedToMe,
  getIncidentsAssignedByMe,
  getTeamIncidents,
  getTeamIncidentsByServiceNum,
  getIncidentHistory,
  getCurrentTechnician,
  fetchMainCategories,
  fetchCategoryItems,
  fetchAllUsers,
  fetchAllLocations,
  fetchAdminTeamData,
  fetchDashboardStats,
} from "./incidentService";
import {
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
  fetchAllIncidentsRequest,
  fetchAllIncidentsSuccess,
  fetchAllIncidentsFailure,
  createIncidentRequest,
  createIncidentSuccess,
  createIncidentFailure,
  createIncidentWithAttachmentRequest,
  createIncidentWithAttachmentSuccess,
  createIncidentWithAttachmentFailure,
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
  getTeamIncidentsByServiceNumRequest,
  getTeamIncidentsByServiceNumSuccess,
  getTeamIncidentsByServiceNumFailure,
  fetchIncidentHistoryRequest,
  fetchIncidentHistorySuccess,
  fetchIncidentHistoryFailure,
  fetchCurrentTechnicianRequest,
  fetchCurrentTechnicianSuccess,
  fetchCurrentTechnicianFailure,
  fetchAdminTeamDataRequest,
  fetchAdminTeamDataSuccess,
  fetchAdminTeamDataFailure,
  fetchMainCategoriesRequest,
  fetchMainCategoriesSuccess,
  fetchMainCategoriesFailure,
  fetchCategoryItemsRequest,
  fetchCategoryItemsSuccess,
  fetchCategoryItemsFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
  fetchAllLocationsRequest,
  fetchAllLocationsSuccess,
  fetchAllLocationsFailure,
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
    yield put(createIncidentSuccess(response.data));    // Refresh the assigned to me list for the handler
    yield put(getAssignedToMeRequest({ serviceNum: action.payload.handler }));
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

function* handleCreateIncidentWithAttachment(action) {
  try {
    const response = yield call(createIncidentWithAttachment, action.payload);
    yield put(createIncidentWithAttachmentSuccess(response.data));
    // Refresh the assigned to me list for the handler
    yield put(getAssignedToMeRequest({ serviceNum: response.data.handler }));
    // Optionally refetch all incidents
    yield put(fetchAllIncidentsRequest());
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    yield put(createIncidentWithAttachmentFailure(errorMessage));
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
    console.log('🚀 Incident Saga: handleGetAssignedToMe called with action:', action);
    const { serviceNum } = action.payload;
    console.log('🚀 Incident Saga: serviceNum extracted:', serviceNum);
    console.log('🚀 Incident Saga: About to call getIncidentsAssignedToMe...');
    
    const response = yield call(getIncidentsAssignedToMe, serviceNum);
    
    console.log('✅ Incident Saga: getIncidentsAssignedToMe response:', response);
    console.log('✅ Incident Saga: response.data:', response.data);
    console.log('✅ Incident Saga: About to dispatch success...');
    
    yield put(getAssignedToMeSuccess(response.data));
  } catch (error) {
    console.error('❌ Incident Saga: Error in handleGetAssignedToMe:', error);
    yield put(getAssignedToMeFailure(error.message));
  }
}

function* handleGetAssignedByMe(action) {
  try {
    console.log('🚀 Incident Saga: handleGetAssignedByMe called with action:', action);
    const { serviceNum } = action.payload;
    console.log('🚀 Incident Saga: serviceNum extracted:', serviceNum);
    console.log('🚀 Incident Saga: About to call getIncidentsAssignedByMe...');
    
    const response = yield call(getIncidentsAssignedByMe, serviceNum);
    
    console.log('✅ Incident Saga: getIncidentsAssignedByMe response:', response);
    console.log('✅ Incident Saga: response.data:', response.data);
    console.log('✅ Incident Saga: About to dispatch success...');
    
    yield put(getAssignedByMeSuccess(response.data));
    
    console.log('✅ Incident Saga: Success action dispatched');
  } catch (error) {
    console.error('❌ Incident Saga: Error in handleGetAssignedByMe:', error);
    yield put(getAssignedByMeFailure(error.message));
  }
}

function* handleGetTeamIncidents(action) {
  try {
    const { teamId } = action.payload;
    const response = yield call(getTeamIncidents, teamId);
    yield put(getTeamIncidentsSuccess(response.data));
  } catch (error) {
    yield put(getTeamIncidentsFailure(error.message));
  }
}

function* handleGetTeamIncidentsByServiceNum(action) {
  try {
    console.log('🚀 Incident Saga: handleGetTeamIncidentsByServiceNum called with action:', action);
    const { serviceNum } = action.payload;
    console.log('🚀 Incident Saga: serviceNum extracted:', serviceNum);
    
    const response = yield call(getTeamIncidentsByServiceNum, serviceNum);
    
    console.log('✅ Incident Saga: getTeamIncidentsByServiceNum response:', response);
    console.log('✅ Incident Saga: response.data:', response.data);
    
    yield put(getTeamIncidentsByServiceNumSuccess(response.data));
  } catch (error) {
    console.error('❌ Incident Saga: Error in handleGetTeamIncidentsByServiceNum:', error);
    yield put(getTeamIncidentsByServiceNumFailure(error.message));
  }
}

function* handleFetchIncidentHistory(action) {
  try {
    const { incident_number } = action.payload;
    const response = yield call(getIncidentHistory, incident_number);
    yield put(fetchIncidentHistorySuccess(response.data));
  } catch (error) {
    console.error("Error fetching incident history:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch incident history";
    yield put(fetchIncidentHistoryFailure(errorMessage));
  }
}

function* handleFetchCurrentTechnician(action) {
  try {
    const { serviceNum } = action.payload;
    const response = yield call(getCurrentTechnician, serviceNum);
    yield put(fetchCurrentTechnicianSuccess(response.data));
  } catch (error) {
    console.error("Error fetching current technician:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch current technician";
    yield put(fetchCurrentTechnicianFailure(errorMessage));
  }
}

function* handleFetchAdminTeamData() {
  try {
    const response = yield call(fetchAdminTeamData);
    yield put(fetchAdminTeamDataSuccess(response));
  } catch (error) {
    console.error("Error fetching admin team data:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch admin team data";
    yield put(fetchAdminTeamDataFailure(errorMessage));
  }
}

function* handleFetchMainCategories() {
  try {
    const response = yield call(fetchMainCategories);
    yield put(fetchMainCategoriesSuccess(response.data));
  } catch (error) {
    console.error("Error fetching main categories:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch main categories";
    yield put(fetchMainCategoriesFailure(errorMessage));
  }
}

function* handleFetchCategoryItems() {
  try {
    const response = yield call(fetchCategoryItems);
    yield put(fetchCategoryItemsSuccess(response.data));
  } catch (error) {
    console.error("Error fetching category items:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch category items";
    yield put(fetchCategoryItemsFailure(errorMessage));
  }
}

function* handleFetchAllUsers() {
  try {
    const response = yield call(fetchAllUsers);
    yield put(fetchAllUsersSuccess(response.data));
  } catch (error) {
    console.error("Error fetching all users:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch all users";
    yield put(fetchAllUsersFailure(errorMessage));
  }
}

function* handleFetchAllLocations() {
  try {
    const response = yield call(fetchAllLocations);
    yield put(fetchAllLocationsSuccess(response.data));
  } catch (error) {
    console.error("Error fetching all locations:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch all locations";
    yield put(fetchAllLocationsFailure(errorMessage));
  }
}
function* handleFetchDashboardStats(action) {
  try {
    const response = yield call(fetchDashboardStats, action.payload?.userParentCategory);
    yield put(fetchDashboardStatsSuccess(response.data));
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    yield put(fetchDashboardStatsFailure(errorMessage));
  }
}


export default function* incidentSaga() {
  yield takeLatest(fetchAllIncidentsRequest.type, handleFetchAllIncidents);
  yield takeLatest(createIncidentRequest.type, handleCreateIncident);
  yield takeLatest(createIncidentWithAttachmentRequest.type, handleCreateIncidentWithAttachment);
  yield takeLatest(updateIncidentRequest.type, handleUpdateIncident);
  yield takeLatest(getIncidentByNumberRequest.type, handleGetIncidentByNumber);
  yield takeLatest(getAssignedToMeRequest.type, handleGetAssignedToMe);
  // Also listen for the alias action type to support both usages
  yield takeLatest("incident/fetchAssignedToMeRequest", handleGetAssignedToMe);
  yield takeLatest(getAssignedByMeRequest.type, handleGetAssignedByMe);
  yield takeLatest(getTeamIncidentsRequest.type, handleGetTeamIncidents);
  yield takeLatest(getTeamIncidentsByServiceNumRequest.type, handleGetTeamIncidentsByServiceNum);
  yield takeLatest(fetchIncidentHistoryRequest.type, handleFetchIncidentHistory);
  yield takeLatest(fetchCurrentTechnicianRequest.type, handleFetchCurrentTechnician);
  yield takeLatest(fetchAdminTeamDataRequest.type, handleFetchAdminTeamData);
  yield takeLatest(fetchMainCategoriesRequest.type, handleFetchMainCategories);
  yield takeLatest(fetchCategoryItemsRequest.type, handleFetchCategoryItems);
  yield takeLatest(fetchAllUsersRequest.type, handleFetchAllUsers);
  yield takeLatest(fetchAllLocationsRequest.type, handleFetchAllLocations);
  yield takeLatest(fetchDashboardStatsRequest.type, handleFetchDashboardStats);
}

