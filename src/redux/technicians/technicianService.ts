import axios from "axios";
import { Technician } from "./technicianTypes";
import {buildUrl,API_BASE} from "../../utils/apiUtils";



//Fetch a technician by service number
export const fetchTechnicianByServiceNum = async(serviceNum: string)=> {
  try{
    return await axios.get(buildUrl(API_BASE, `/technician/${serviceNum}`),{withCredentials: true})
  }
  catch(error){
    throw error;
  }
};

export const fetchTechnicians = async () => {
  try{
    return await axios.get(buildUrl(API_BASE,`/technicians`), { withCredentials: true });
  }
  catch(error){
    throw error;
  }
};

export const createTechnician = async (data: Partial<Technician>) => {
  try {
   return await axios.post(buildUrl(API_BASE, "/technician"), data, {
      withCredentials: true,
    });
    
  } catch (error) {
    throw error;
  }
};

export const updateTechnician = async (serviceNum: string, data: Partial<Technician>) => {
  try{
     return await axios.put(buildUrl(API_BASE,`/technician/${serviceNum}`), data, { withCredentials: true });
  }
  catch (error) {
    throw error;
  }
 
};

export const deleteTechnician = async (serviceNum: string) => {
  try{
    return await axios.delete(buildUrl(API_BASE,`/technician/${serviceNum}`) ,{ withCredentials: true });
  }
catch(error){
 throw error;
  }
};

export const checkTechnicianStatus = async () => {
  try{
     return await axios.get(buildUrl(API_BASE,`/check-status`) ,{ withCredentials: true });
  } catch (error ){
    throw error;
  }
  
 
};
export const fetchActiveTechnicians = async () => {
  try{
    return await axios.get(`${API_BASE}/technician/active`, { withCredentials: true });
}
 catch(error){
  throw error;
 }};

// NEW: Force logout technician (admin only)
export const forceLogoutTechnician = async (serviceNum: string) => {
  try {
    return await axios.put(`${API_BASE}/technician/${serviceNum}/force-logout`, {}, { withCredentials: true });
  } catch (error) {
    throw error;
  }
};
   