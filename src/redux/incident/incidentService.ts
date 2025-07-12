import axios from "axios";
import { Incident } from "./incidentTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Get all incidents
export const fetchAllIncidents = async () => {
  try {
    return await axios.get(buildUrl(API_BASE, "/incident/all-teams"), { withCredentials: true });
  } catch (error) {
    console.error("Error fetching all incidents:", error);
    throw error;
  }
};

// Create incident
export const createIncident = async (data: Partial<Incident>) => {
  try {
    return await axios.post(buildUrl(API_BASE, "/incident/create-incident"), data, { withCredentials: true });
  } catch (error) {
    console.error("Error creating incident:", error);
    throw error;
  }
};

// Update incident
export const updateIncident = async (incident_number: string, data: Partial<Incident>) => {
  try {
    return await axios.put(buildUrl(API_BASE, `/incident/${incident_number}`), data, { withCredentials: true });
  } catch (error) {
    console.error(`Error updating incident ${incident_number}:`, error);
    throw error;
  }
};

// Get incident by number
export const getIncidentByNumber = async (incident_number: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/incident/${incident_number}`), { withCredentials: true });
  } catch (error) {
    console.error(`Error fetching incident ${incident_number}:`, error);
    throw error;
  }
};

// Get incidents assigned to me
export const getIncidentsAssignedToMe = async (serviceNum: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/incident/assigned-to-me/${serviceNum}`), { withCredentials: true });
  } catch (error) {
    console.error("Error fetching assigned to me incidents:", error);
    throw error;
  }
};

// Get incidents assigned by me
export const getIncidentsAssignedByMe = async (serviceNum: string) => {
  try {
    console.log('🌐 Incident Service: getIncidentsAssignedByMe called with serviceNum:', serviceNum);
    console.log('🌐 Incident Service: API URL:', buildUrl(API_BASE, `/incident/assigned-by-me/${serviceNum}`));
    const response = await axios.get(buildUrl(API_BASE, `/incident/assigned-by-me/${serviceNum}`), { withCredentials: true });
    console.log('✅ Incident Service: Request successful');
    console.log('✅ Incident Service: Response status:', response.status);
    console.log('✅ Incident Service: Response data:', response.data);
    return response;
  } catch (error) {
    console.error("❌ Incident Service: Error fetching assigned by me incidents:", error);
    throw error;
  }
};

// Get team incidents
export const getTeamIncidents = async (teamLead: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/incident/team-incidents/${teamLead}`), { withCredentials: true });
  } catch (error) {
    console.error(`Error fetching team incidents for ${teamLead}:`, error);
    throw error;
  }
};

// Get team incidents by technician service number
export const getTeamIncidentsByServiceNum = async (serviceNum: string) => {
  try {
    console.log('🌐 Incident Service: getTeamIncidentsByServiceNum called with serviceNum:', serviceNum);
    const response = await axios.get(buildUrl(API_BASE, `/incident/team-incidents/${serviceNum}`), { withCredentials: true });
    console.log('✅ Incident Service: Team incidents response:', response.data);
    return response;
  } catch (error) {
    console.error(`Error fetching team incidents for service number ${serviceNum}:`, error);
    throw error;
  }
};

// Get incident history
export const getIncidentHistory = async (incident_number: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/incident/${incident_number}/history`), { withCredentials: true });
  } catch (error) {
    console.error(`Error fetching incident history for ${incident_number}:`, error);
    throw error;
  }
};

// Get current technician data
export const getCurrentTechnician = async (serviceNum: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/technician/${serviceNum}`), { withCredentials: true });
  } catch (error) {
    console.error(`Error fetching technician data for ${serviceNum}:`, error);
    throw error;
  }
};
