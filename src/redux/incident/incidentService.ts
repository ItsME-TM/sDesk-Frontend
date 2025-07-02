import axios from "axios";
import { Incident } from "./incidentTypes";

const API_BASE = "http://localhost:8000";

// Get all incidents
export const fetchAllIncidents = async () => {
  try {
    return await axios.get(`${API_BASE}/incident/all-teams`, { withCredentials: true });
  } catch (error) {
    console.error("Error fetching all incidents:", error);
    throw error;
  }
};

// Create incident
export const createIncident = async (data: Partial<Incident>) => {
  try {
    return await axios.post(`${API_BASE}/incident/create-incident`, data, { withCredentials: true });
  } catch (error) {
    console.error("Error creating incident:", error);
    throw error;
  }
};

// Update incident
export const updateIncident = async (incident_number: string, data: Partial<Incident>) => {
  try {
    return await axios.put(`${API_BASE}/incident/${incident_number}`, data, { withCredentials: true });
  } catch (error) {
    console.error(`Error updating incident ${incident_number}:`, error);
    throw error;
  }
};

// Get incident by number
export const getIncidentByNumber = async (incident_number: string) => {
  try {
    return await axios.get(`${API_BASE}/incident/${incident_number}`, { withCredentials: true });
  } catch (error) {
    console.error(`Error fetching incident ${incident_number}:`, error);
    throw error;
  }
};

// Get incidents assigned to me
export const getIncidentsAssignedToMe = async (handler: string) => {
  try {
    return await axios.get(`${API_BASE}/incident/assigned-to-me?handler=${handler}`, { withCredentials: true });
  } catch (error) {
    console.error("Error fetching assigned to me incidents:", error);
    throw error;
  }
};

// Get incidents assigned by me
export const getIncidentsAssignedByMe = async (informant: string) => {
  try {
    return await axios.get(`${API_BASE}/incident/assigned-by-me?informant=${informant}`, { withCredentials: true });
  } catch (error) {
    console.error("Error fetching assigned by me incidents:", error);
    throw error;
  }
};

// Get team incidents by category
export const getTeamIncidents = async (category: string) => {
  try {
    return await axios.get(`${API_BASE}/incident/view-team-incidents?category=${category}`, { withCredentials: true });
  } catch (error) {
    console.error("Error fetching team incidents:", error);
    throw error;
  }
};
