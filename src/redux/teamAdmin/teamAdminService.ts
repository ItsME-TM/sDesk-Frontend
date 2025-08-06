
import axios from "axios";
import { TeamAdmin } from "./teamAdminTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Fetch a team admin by service number
export const fetchTeamAdminByServiceNumber = async (serviceNum: string) => {
  try {
    return await axios.get(buildUrl(API_BASE, `/admin/serviceNumber/${serviceNum}`), { withCredentials: true });
  } catch (error) {
    throw error;
  }
};

export const fetchTeamAdmins = async () => {
  try {
    return await axios.get(buildUrl(API_BASE, '/admins'), { withCredentials: true });
  } catch (error) {
    throw error;
  }
};

export const createTeamAdmin = async (
  data: Partial<TeamAdmin> & { teamId: string }
) => {
  try {
    return await axios.post(buildUrl(API_BASE, `/admin/${data.teamId}`), data, {
      withCredentials: true,
    });
  } catch (error) {
    throw error;
  }
};

export const updateTeamAdmin = async (id: string, data: TeamAdmin) => {
  try {
    return await axios.put(buildUrl(API_BASE, `/admin/${id}`), data, {
      withCredentials: true,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteTeamAdmin = async (id: string) => {
  try {
    return await axios.delete(buildUrl(API_BASE, `/admin/${id}`), {
      withCredentials: true,
    });
  } catch (error) {
    throw error;
  }
};
