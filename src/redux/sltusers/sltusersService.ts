import axios from 'axios';
import { SLTUser } from './sltusersTypes';
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Update user role by service number
export const updateUserRoleById = async (serviceNum: string, role: string) => {
  // Use the correct backend endpoint: PUT /sltusers/:serviceNum
  return axios.put(buildUrl(API_BASE, `/sltusers/${serviceNum}`), { role }, { withCredentials: true });
};

export const fetchAllUsers = async () => {
  return axios.get(buildUrl(API_BASE, '/sltusers'), { withCredentials: true });
};

export const createUser = async (userData: Partial<SLTUser>) => {
  return axios.post(buildUrl(API_BASE, '/sltusers'), userData, { withCredentials: true });
};

export const updateUser = async (serviceNum: string, userData: Partial<SLTUser>) => {
  return axios.put(buildUrl(API_BASE, `/sltusers/${serviceNum}`), userData, { withCredentials: true });
};

export const deleteUser = async (serviceNum: string) => {
  return axios.delete(buildUrl(API_BASE, `/sltusers/${serviceNum}`), { withCredentials: true });
};

export const fetchUserByServiceNum = async (serviceNum: string) => {
  return axios.get(buildUrl(API_BASE, `/sltusers/serviceNum/${serviceNum}`), { withCredentials: true });
};

