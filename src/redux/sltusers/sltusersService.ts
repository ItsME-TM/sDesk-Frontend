import axios from 'axios';
import { SLTUser } from './sltusersTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Update user role by service number
export const updateUserRoleById = async (serviceNum: string, role: string) => {
  return axios.put(`${API_BASE}/sltusers/${serviceNum}/role`, { role }, { withCredentials: true });
};

export const fetchAllUsers = async () => {
  return axios.get(`${API_BASE}/sltusers`, { withCredentials: true });
};

export const createUser = async (userData: Partial<SLTUser>) => {
  return axios.post(`${API_BASE}/sltusers`, userData, { withCredentials: true });
};

export const updateUser = async (serviceNum: string, userData: Partial<SLTUser>) => {
  return axios.put(`${API_BASE}/sltusers/${serviceNum}`, userData, { withCredentials: true });
};

export const deleteUser = async (serviceNum: string) => {
  return axios.delete(`${API_BASE}/sltusers/${serviceNum}`, { withCredentials: true });
};

export const fetchUserByServiceNum = async (serviceNum: string) => {
  return axios.get(`${API_BASE}/sltusers/serviceNum/${serviceNum}`, { withCredentials: true });
};

