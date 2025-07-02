import axios from "axios";
import { Technician } from "./technicianTypes";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const fetchTechnicians = async () => {
  return axios.get(`${API_BASE}/technicians`, { withCredentials: true });
};

export const createTechnician = async (data: Partial<Technician>) => {
  console.log('[createTechnician] Data sent to API:', data, JSON.stringify(data), Object.entries(data).map(([k, v]) => `${k}: ${typeof v}`));
  try {
    const response = await axios.post(`${API_BASE}/technician`, data, { withCredentials: true });
    console.log('[createTechnician] API response:', response.data);
    return response;
  } catch (error) {
    if (error.response) {
      console.error('[createTechnician] API error response:', error.response.data);
    } else {
      console.error('[createTechnician] Error:', error);
    }
    throw error;
  }
};

export const updateTechnician = async (serviceNum: string, data: Partial<Technician>) => {
  return axios.put(`${API_BASE}/technician/${serviceNum}`, data, { withCredentials: true });
};

export const deleteTechnician = async (serviceNum: string) => {
  return axios.delete(`${API_BASE}/technician/${serviceNum}`, { withCredentials: true });
};
export const checkTechnicianStatus = async () => {
  return axios.get(`${API_BASE}/technician/check-status`, { withCredentials: true });

};
export const fetchActiveTechnicians = async () => {
  return axios.get(`${API_BASE}/technician/active`, { withCredentials: true });
};