import axios from "axios";
import { Technician } from "./technicianTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const fetchTechnicians = async () => {
  return axios.get(buildUrl(API_BASE, '/technicians'), { withCredentials: true });
};

export const createTechnician = async (data: Partial<Technician>) => {
  console.log('[createTechnician] Data sent to API:', data, JSON.stringify(data), Object.entries(data).map(([k, v]) => `${k}: ${typeof v}`));
  try {
    const response = await axios.post(buildUrl(API_BASE, '/technician'), data, { withCredentials: true });
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
  return axios.put(buildUrl(API_BASE, `/technician/${serviceNum}`), data, { withCredentials: true });
};

export const deleteTechnician = async (serviceNum: string) => {
  return axios.delete(buildUrl(API_BASE, `/technician/${serviceNum}`), { withCredentials: true });
};
export const checkTechnicianStatus = async () => {
  return axios.get(buildUrl(API_BASE, '/technician/check-status'), { withCredentials: true });

};
export const fetchActiveTechnicians = async () => {
  return axios.get(buildUrl(API_BASE, '/technician/active'), { withCredentials: true });
};