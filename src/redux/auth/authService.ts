import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create a custom axios instance with CORS configuration
const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const loginWithMicrosoft = async ({ code, state, redirect_uri }) => {
    const url = `/auth/login`;
    console.log('🔍 Making request to:', `${API_BASE}${url}`);
    console.log('🔍 API_BASE:', API_BASE);
    console.log('🔍 Request data:', { code, state, redirect_uri });
    
    try {
        const response = await axiosInstance.post(url, {
            code,
            state,
            redirect_uri,
            client_id: '2dfa1784-299b-4bf9-91be-400d831396ed',
            client_secret: 'YOUR_CLIENT_SECRET', 
        });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        return await axiosInstance.post(`/auth/logout`, {});
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const fetchLoggedUser = async () => {
    console.log('[AuthService] Hit the fetchLoggedUser API');
    try {
        return await axiosInstance.get(`/auth/logged-user`);
    } catch (error) {
        console.error('Fetch logged user error:', error);
        throw error;
    }
};

export const refreshToken = async () => {
    console.log('[AuthService] Hit the refreshToken API');
    try {
        return await axiosInstance.post(`/auth/refresh-token`, {});
    } catch (error) {
        console.error('Refresh token error:', error);
        throw error;
    }
};


