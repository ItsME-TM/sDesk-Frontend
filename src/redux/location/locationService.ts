// locationService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const fetchLocations = () => {
  console.log("🌐 Service: GET", `${API_URL}/locations`);
  return axios.get(`${API_URL}/locations`);
};

export const createLocation = (data) => {
  console.log("🌐 Service: POST", `${API_URL}/locations`, "Data:", data);
  return axios.post(`${API_URL}/locations`, data);
};

export const updateLocation = (id: string, data) => {
  console.log("🌐 Service: PUT", `${API_URL}/locations/${id}`, "Data:", data);
  return axios.put(`${API_URL}/locations/${id}`, data);
};

export const deleteLocation = (id: string) => {
  console.log("🌐 Service: DELETE", `${API_URL}/locations/${id}`);
  return axios.delete(`${API_URL}/locations/${id}`);
};
