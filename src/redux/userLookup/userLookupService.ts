import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const lookupUserByServiceNum = async (serviceNum: string) => {
  try {
    console.log('UserLookup Service: Starting request for service number:', serviceNum);
    console.log('UserLookup Service: API URL:', `${API_BASE}/sltusers/serviceNum/${serviceNum}`);
    
    const config = {
      withCredentials: true,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    console.log('UserLookup Service: Request config:', config);
    
    const response = await axios.get(`${API_BASE}/sltusers/serviceNum/${serviceNum}`, config);
    
    console.log('UserLookup Service: Request successful');
    console.log('UserLookup Service: Response status:', response.status);
    console.log('UserLookup Service: Response headers:', response.headers);
    console.log('UserLookup Service: Response data:', response.data);
    
    return response;
  } catch (error: any) {
    // Check if this is a legitimate 404 (user not found) vs a system error
    if (error.response?.status === 404) {
      console.log('UserLookup Service: User not found (404) - this is expected behavior for non-existent service numbers');
      console.log('UserLookup Service: Service number attempted:', serviceNum);
    } else {
      console.error('UserLookup Service: Unexpected error occurred');
      console.error('UserLookup Service: Error object:', error);
    }
    
    console.log('UserLookup Service: Error details:', {
      serviceNumber: serviceNum,
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      isUserNotFound: error.response?.status === 404
    });
    
    // Re-throw the error for saga to handle
    throw error;
  }
};
