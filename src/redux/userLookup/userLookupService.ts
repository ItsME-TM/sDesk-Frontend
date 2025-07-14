import axios from 'axios';
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const lookupUserByServiceNum = async (serviceNum: string) => {
  try {
    console.log('🔍 UserLookup Service: Starting request for service number:', serviceNum);
    console.log('🔍 UserLookup Service: API URL:', buildUrl(API_BASE, `/sltusers/serviceNum/${serviceNum}`));
    if (import.meta.env.MODE !== 'production') {
      const maskedCookies = document.cookie
        .split('; ')
        .map(cookie => cookie.split('=')[0]) // Log only cookie names
        .join(', ');
      console.log('🔍 UserLookup Service: Current cookies (names only):', maskedCookies);
    }

    const config = {
      withCredentials: true,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    console.log('🔍 UserLookup Service: Request config:', config);
    console.log('🔍 UserLookup Service: Making axios request...');

    const response = await axios.get(buildUrl(API_BASE, `/sltusers/serviceNum/${serviceNum}`), config);

    console.log('✅ UserLookup Service: Request successful');
    console.log('✅ UserLookup Service: Response status:', response.status);
    console.log('✅ UserLookup Service: Response headers:', response.headers);
    console.log('✅ UserLookup Service: Response data:', response.data);

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