import axios from 'axios';
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const lookupUserByServiceNum = async (serviceNum: string) => {
  try {
    const config = {
      withCredentials: true,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(buildUrl(API_BASE, `/sltusers/serviceNum/${serviceNum}`), config);
    return response;
  } catch (error: any) {
    // Re-throw the error for saga to handle
    throw error;
  }
};