import apiClient from "../../api/axiosInstance";
import { Incident } from "./incidentTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Get all incidents
export const fetchAllIncidents = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/incident/all-teams"));
  } catch (error) {
    throw error;
  }
};

// Create incident
export const createIncident = async (data: Partial<Incident>) => {
  try {
    return await apiClient.post(
      buildUrl(API_BASE, "/incident/create-incident"),
      data
    );
  } catch (error) {
    throw error;
  }
};

// Update incident
export const updateIncident = async (
  incident_number: string,
  data: Partial<Incident>
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/incident/${incident_number}`),
      data
    );
  } catch (error) {
    throw error;
  }
};

// Get incident by number
export const getIncidentByNumber = async (incident_number: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/${incident_number}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get incidents assigned to me
export const getIncidentsAssignedToMe = async (serviceNum: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/assigned-to-me/${serviceNum}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get incidents assigned by me
export const getIncidentsAssignedByMe = async (serviceNum: string) => {
  try {
    const response = await apiClient.get(
      buildUrl(API_BASE, `/incident/assigned-by-me/${serviceNum}`)
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Get team incidents
export const getTeamIncidents = async (teamLead: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/team-incidents/${teamLead}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get team incidents by technician service number
export const getTeamIncidentsByServiceNum = async (serviceNum: string) => {
  try {
    const response = await apiClient.get(
      buildUrl(API_BASE, `/incident/team-incidents/${serviceNum}`)
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Get incident history
export const getIncidentHistory = async (incident_number: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/${incident_number}/history`)
    );
  } catch (error) {
    throw error;
  }
};

// Get current technician data
export const getCurrentTechnician = async (serviceNum: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/technician/${serviceNum}`));
  } catch (error) {
    throw error;
  }
};
// Fetch main categories
export const fetchMainCategories = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/main"));
  } catch (error) {
    throw error;
  }
};

// Fetch category items
export const fetchCategoryItems = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/item"));
  } catch (error) {
    throw error;
  }
};

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/sltusers"));
  } catch (error) {
    throw error;
  }
};

// Fetch all locations
export const fetchAllLocations = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/locations"));
  } catch (error) {
    throw error;
  }
};

export const fetchDashboardStats = async (userParentCategory?: string) => {
  try {
    const params = userParentCategory ? { userParentCategory } : {};
    return await apiClient.get(
      buildUrl(API_BASE, "/incident/dashboard-stats"),
      { params }
    );
  } catch (error) {
    throw error;
  }
};

// Fetch admin team data (combined)
export const fetchAdminTeamData = async () => {
  try {
    const [
      incidentsResponse,
      mainCategoriesResponse,
      categoryItemsResponse,
      usersResponse,
      locationsResponse,
    ] = await Promise.all([
      apiClient.get(buildUrl(API_BASE, "/incident/all-teams")),
      apiClient.get(buildUrl(API_BASE, "/categories/main")),
      apiClient.get(buildUrl(API_BASE, "/categories/item")),
      apiClient.get(buildUrl(API_BASE, "/sltusers")),
      apiClient.get(buildUrl(API_BASE, "/locations")),
    ]);

    return {
      incidents: incidentsResponse.data,
      mainCategories: mainCategoriesResponse.data,
      categoryItems: categoryItemsResponse.data,
      users: usersResponse.data,
      locations: locationsResponse.data,
    };
  } catch (error) {
    throw error;
  }
};
