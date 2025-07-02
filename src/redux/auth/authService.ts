import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const loginWithMicrosoft = async ({ code, state, redirect_uri }) => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
        code,
        state,
        redirect_uri,
        client_id: '2dfa1784-299b-4bf9-91be-400d831396ed',
        client_secret: 'YOUR_CLIENT_SECRET', 
    }, { withCredentials: true });
    return response; 
};

export const logout = async () => {
    return axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
};

export const fetchLoggedUser = async () => {
    console.log('[AuthService] Hit the fetchLoggedUser API');
    return await axios.get(`${API_BASE}/auth/logged-user`, { withCredentials: true });
};

export const refreshToken = async () => {
    console.log('[AuthService] Hit the refreshToken API');
    return await axios.post(`${API_BASE}/auth/refresh-token`, {}, { withCredentials: true });
};