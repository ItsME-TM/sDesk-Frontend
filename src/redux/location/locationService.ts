// locationService.ts
import axios from "axios";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const fetchLocations = () => {
  return axios.get(buildUrl(API_BASE, "/locations"), { withCredentials: true });
};

export const createLocation = (data) => {
  return axios.post(buildUrl(API_BASE, "/locations"), data, { withCredentials: true });
};

export const updateLocation = (id: string, data) => {
  return axios.put(buildUrl(API_BASE, `/locations/${id}`), data, { withCredentials: true });
};

export const deleteLocation = (id: string) => {
  return axios.delete(buildUrl(API_BASE, `/locations/${id}`), { withCredentials: true });
};
