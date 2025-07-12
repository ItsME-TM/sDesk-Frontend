// locationService.ts
import axios from "axios";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const fetchLocations = () => {
  console.log("🌐 Service: GET", buildUrl(API_BASE, "/locations"));
  return axios.get(buildUrl(API_BASE, "/locations"), { withCredentials: true });
};

export const createLocation = (data) => {
  console.log("🌐 Service: POST", buildUrl(API_BASE, "/locations"), "Data:", data);
  return axios.post(buildUrl(API_BASE, "/locations"), data, { withCredentials: true });
};

export const updateLocation = (id: string, data) => {
  console.log("🌐 Service: PUT", buildUrl(API_BASE, `/locations/${id}`), "Data:", data);
  return axios.put(buildUrl(API_BASE, `/locations/${id}`), data, { withCredentials: true });
};

export const deleteLocation = (id: string) => {
  console.log("🌐 Service: DELETE", buildUrl(API_BASE, `/locations/${id}`));
  return axios.delete(buildUrl(API_BASE, `/locations/${id}`), { withCredentials: true });
};
