import { createSlice } from "@reduxjs/toolkit";
import { Incident, IncidentState } from "./incidentTypes";

const initialState: IncidentState = {
  incidents: [],
  assignedToMe: [],
  assignedByMe: [],
  teamIncidents: [],
  currentIncident: null,
  categories: [], // Add this line
  loading: false,
  error: null,
};

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    // Categories
    fetchCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action) {
      state.loading = false;
      state.categories = action.payload;
    },
    fetchCategoriesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all incidents
    fetchAllIncidentsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllIncidentsSuccess(state, action) {
      state.loading = false;
      state.incidents = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    fetchAllIncidentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Create incident
    createIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createIncidentSuccess(state, action) {
      state.loading = false;
      state.incidents = [action.payload, ...state.incidents];
      // Add to both arrays since different users might need to see it in different contexts
      state.assignedToMe = [action.payload, ...state.assignedToMe];
      state.assignedByMe = [action.payload, ...state.assignedByMe];
    },
    createIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update incident
    updateIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateIncidentSuccess(state, action) {
      state.loading = false;
      const updatedIncident = action.payload;
      state.incidents = state.incidents.map((incident) =>
        incident.incident_number === updatedIncident.incident_number
          ? updatedIncident
          : incident
      );
      if (
        state.currentIncident?.incident_number ===
        updatedIncident.incident_number
      ) {
        state.currentIncident = updatedIncident;
      }
    },
    updateIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get incident by number
    getIncidentByNumberRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getIncidentByNumberSuccess(state, action) {
      state.loading = false;
      state.currentIncident = action.payload;
    },
    getIncidentByNumberFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get assigned to me
    getAssignedToMeRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getAssignedToMeSuccess(state, action) {
      state.loading = false;
      state.assignedToMe = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    getAssignedToMeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get assigned by me
    getAssignedByMeRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getAssignedByMeSuccess(state, action) {
      state.loading = false;
      state.assignedByMe = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    getAssignedByMeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get team incidents
    getTeamIncidentsRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getTeamIncidentsSuccess(state, action) {
      state.loading = false;
      state.teamIncidents = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    getTeamIncidentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete incident
    deleteIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteIncidentSuccess(state, action) {
      state.loading = false;
      const deletedIncidentNumber = action.payload;
      state.incidents = state.incidents.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.assignedToMe = state.assignedToMe.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.assignedByMe = state.assignedByMe.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.teamIncidents = state.teamIncidents.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
    },
    deleteIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current incident
    clearCurrentIncident(state) {
      state.currentIncident = null;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
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
  deleteIncidentRequest,
  deleteIncidentSuccess,
  deleteIncidentFailure,
  clearCurrentIncident,
  clearError,
} = incidentSlice.actions;

// Export aliases for consistency with component usage
export const fetchIncidentByIdRequest = getIncidentByNumberRequest;
export const fetchIncidentByIdSuccess = getIncidentByNumberSuccess;
export const fetchIncidentByIdFailure = getIncidentByNumberFailure;
export const fetchAssignedToMeRequest = getAssignedToMeRequest;
export const fetchAssignedToMeSuccess = getAssignedToMeSuccess;
export const fetchAssignedToMeFailure = getAssignedToMeFailure;
export const fetchAssignedByMeRequest = getAssignedByMeRequest;
export const fetchAssignedByMeSuccess = getAssignedByMeSuccess;
export const fetchAssignedByMeFailure = getAssignedByMeFailure;

export default incidentSlice.reducer;
