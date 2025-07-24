import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Technician } from "./technicianTypes";


const initialState = {
  technicians: [] as Technician[],
   activeTechnicians: [] as Technician[],
  loading: false,
  error: null as string | null,
};

const technicianSlice = createSlice({
  name: "technicians",
  initialState,
  reducers: {
    fetchTechniciansRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTechniciansSuccess(state, action) {
      state.technicians = action.payload;
      state.loading = false;
    },
    fetchTechniciansFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = [action.payload, ...state.technicians];
    },
    createTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = state.technicians.map((tech) =>
        tech.id === action.payload.id ? action.payload : tech
      );
    },
    updateTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = state.technicians.filter(
        (tech) =>
          tech.id !== action.payload &&
          tech.serviceNum !== action.payload
      );
    },
    deleteTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
     checkTechnicianStatusRequest(state) {
    state.loading = true;
    state.error = null;
  },
  checkTechnicianStatusSuccess(state, action) {
    state.loading = false;
    state.error = null;
    // Optional: handle response if needed
  },
  checkTechnicianStatusFailure(state, action) {
    state.loading = false;
    state.error = action.payload;
  },
  
    fetchActiveTechniciansRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchActiveTechniciansSuccess (state, action) {
      state.loading = false;
      state.error = null;
      state.activeTechnicians = action.payload;

    },
    fetchActiveTechniciansFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // NEW: Socket-based technician status management
    updateTechnicianOnlineStatus(state, action) {
      const { serviceNum, isOnline } = action.payload;
      state.technicians = state.technicians.map(tech => 
        tech.serviceNum === serviceNum 
          ? { ...tech, active: isOnline }
          : tech
      );
      // Also update active technicians list
      if (isOnline) {
        const technician = state.technicians.find(tech => tech.serviceNum === serviceNum);
        if (technician && !state.activeTechnicians.find(tech => tech.serviceNum === serviceNum)) {
          state.activeTechnicians.push(technician);
        }
      } else {
        state.activeTechnicians = state.activeTechnicians.filter(tech => tech.serviceNum !== serviceNum);
      }
    },
    forceLogoutTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    forceLogoutTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      // Mark technician as inactive
      const { serviceNum } = action.payload;
      state.technicians = state.technicians.map(tech => 
        tech.serviceNum === serviceNum 
          ? { ...tech, active: false }
          : tech
      );
      state.activeTechnicians = state.activeTechnicians.filter(tech => tech.serviceNum !== serviceNum);
    },
    forceLogoutTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
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
  fetchActiveTechniciansFailure,
  updateTechnicianOnlineStatus,
  forceLogoutTechnicianRequest,
  forceLogoutTechnicianSuccess,
  forceLogoutTechnicianFailure
} = technicianSlice.actions;

//Selectors
export const selectTechnicians = (state: any) => state.technician.technicians;
export const selectTechniciansLoading = (state: any) => state.technician.loading;
export const selectTechniciansError = (state: any) => state.technician.error;

export default technicianSlice.reducer;