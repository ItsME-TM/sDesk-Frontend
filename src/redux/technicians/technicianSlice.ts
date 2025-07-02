import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Technician } from "./technicianTypes";
import * as technicianService from "./technicianService";

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
        (tech) => tech.id !== action.payload
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
  fetchActiveTechniciansFailure
} = technicianSlice.actions;

export const fetchTechnicians = () => async (dispatch: any) => {
  dispatch(fetchTechniciansRequest());
  try {
    const response = await technicianService.fetchTechnicians();
    dispatch(fetchTechniciansSuccess(response.data));
  } catch (error: any) {
    dispatch(fetchTechniciansFailure(error.message || "Failed to fetch technicians"));
  }
};

export default technicianSlice.reducer;
