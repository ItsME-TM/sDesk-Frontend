import axios from "axios";
import { MainCategory, SubCategory, CategoryItem } from "./categoryTypes";

const API_BASE = "http://localhost:8000";



// Main Category Services
export const fetchMainCategories = async () => {
  try {
    return await axios.get(`${API_BASE}/categories/main`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchMainCategoryById = async (id: string) => {
  try {
    return await axios.get(`${API_BASE}/categories/main/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createMainCategory = async (data: Partial<MainCategory>) => {
  try {
    return await axios.post(`${API_BASE}/categories/main`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateMainCategory = async (id: string, data: Partial<MainCategory>) => {
  try {
    return await axios.put(`${API_BASE}/categories/main/${id}`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteMainCategory = async (id: string) => {
  try {
    return await axios.delete(`${API_BASE}/categories/main/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Sub Category Services
export const fetchSubCategories = async () => {
  try {
    return await axios.get(`${API_BASE}/categories/sub`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchSubCategoryById = async (id: string) => {
  try {
    return await axios.get(`${API_BASE}/categories/sub/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createSubCategory = async (data: Partial<SubCategory>) => {
  try {
    return await axios.post(`${API_BASE}/categories/sub`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateSubCategory = async (id: string, data: Partial<SubCategory>) => {
  try {
    return await axios.put(`${API_BASE}/categories/sub/${id}`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteSubCategory = async (id: string) => {
  try {
    return await axios.delete(`${API_BASE}/categories/sub/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchSubCategoriesByMainCategoryId = async (mainCategoryId: string) => {
  try {
    return await axios.get(`${API_BASE}/categories/sub/by-main/${mainCategoryId}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Category Item Services
export const fetchCategoryItems = async () => {
  try {
    return await axios.get(`${API_BASE}/categories/item`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchCategoryItemById = async (id: string) => {
  try {
    return await axios.get(`${API_BASE}/categories/item/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createCategoryItem = async (data: Partial<CategoryItem>) => {
  try {
    return await axios.post(`${API_BASE}/categories/item`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateCategoryItem = async (id: string, data: { name: string; subCategoryId: string }) => {
  try {
    return await axios.put(`${API_BASE}/categories/item/${id}`, data, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteCategoryItem = async (id: string) => {
  try {
    return await axios.delete(`${API_BASE}/categories/item/${id}`, { withCredentials: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};