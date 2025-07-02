import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MainCategory, MainCategoryState ,SubCategory,SubCategoryState } from './categoryTypes';
import type { CategoryItem } from './categoryTypes'; // Add this line or adjust the import if CategoryItem is defined elsewhere

interface CategoryState extends MainCategoryState {
  subCategories: SubCategory[];
  mainCategories: MainCategory[];
  subCategoriesLoading: boolean;
  subCategoriesError: string | null;
  categoryItems: any[];
  createSubCategoryLoading: boolean;
  createSubCategoryError: string | null;
  createSubCategorySuccess: boolean;
  createMainCategoryLoading: boolean;
  createMainCategoryError: string | null;
  createMainCategorySuccess: boolean;
  createCategoryItemLoading: boolean;
  createCategoryItemError: string | null;
  createCategoryItemSuccess: boolean;
}

const initialState: CategoryState = {
  list: [],
  loading: false,
  error: null,
  nextCode: null,
  subCategories: [],
  mainCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,
  categoryItems: [],
  createSubCategoryLoading: false,
  createSubCategoryError: null,
  createSubCategorySuccess: false,
  createMainCategoryLoading: false,
  createMainCategoryError: null,
  createMainCategorySuccess: false,
  createCategoryItemLoading: false,
  createCategoryItemError: null,
  createCategoryItemSuccess: false,
};
    // (Removed from here - will be added inside reducers below)

const categorySlice = createSlice({
  name: 'categories', // Changed from 'mainCategory' to 'categories'
  initialState,
  reducers: {
    // Main categories
    fetchCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<MainCategory[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Subcategory creation
    createSubCategoryRequest(state, _action: PayloadAction<{ name: string; mainCategoryId: string }>) {
      state.createSubCategoryLoading = true;
      state.createSubCategoryError = null;
      state.createSubCategorySuccess = false;
    },
    createSubCategorySuccess(state, action: PayloadAction<SubCategory>) {
      state.createSubCategoryLoading = false;
      state.createSubCategorySuccess = true;
      state.subCategories.push(action.payload);
    },
    createSubCategoryFailure(state, action: PayloadAction<string>) {
      state.createSubCategoryLoading = false;
      state.createSubCategoryError = action.payload;
      state.createSubCategorySuccess = false;
    },

    // Main categories with different naming
    fetchMainCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMainCategoriesSuccess(state, action: PayloadAction<MainCategory[]>) {
      state.loading = false;
      state.mainCategories = action.payload;
    },
    fetchMainCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Subcategories (generic)
    fetchSubCategoriesRequest(state) {
      state.subCategoriesLoading = true;
      state.subCategoriesError = null;
    },
    fetchSubCategoriesSuccess(state, action: PayloadAction<SubCategory[]>) {
      state.subCategoriesLoading = false;
      state.subCategories = action.payload;
    },
    fetchSubCategoriesFailure(state, action: PayloadAction<string>) {
      state.subCategoriesLoading = false;
      state.subCategoriesError = action.payload;
    },

    // Main category creation
    createCategoryRequest(state, _action) {
      state.createMainCategoryLoading = true;
      state.createMainCategoryError = null;
      state.createMainCategorySuccess = false;
    },
    createCategorySuccess(state, action) {
      state.createMainCategoryLoading = false;
      state.createMainCategorySuccess = true;
      state.list.push(action.payload);
    },
    createCategoryFailure(state, action) {
      state.createMainCategoryLoading = false;
      state.createMainCategoryError = action.payload;
      state.createMainCategorySuccess = false;
    },

    // Fetch subcategories by main category
    fetchSubCategoriesByMainCategoryIdRequest(state, _action: PayloadAction<string>) {
      state.subCategoriesLoading = true;
      state.subCategoriesError = null;
    },
    fetchSubCategoriesByMainCategoryIdSuccess(state, action: PayloadAction<SubCategory[]>) {
      state.subCategoriesLoading = false;
      state.subCategories = action.payload;
    },
    fetchSubCategoriesByMainCategoryIdFailure(state, action: PayloadAction<string>) {
      state.subCategoriesLoading = false;
      state.subCategoriesError = action.payload;
    },

    // Category item (grandchild) creation
    createCategoryItemRequest(state, _action) {
      state.createCategoryItemLoading = true;
      state.createCategoryItemError = null;
      state.createCategoryItemSuccess = false;
    },
    createCategoryItemSuccess(state, action) {
      state.createCategoryItemLoading = false;
      state.createCategoryItemSuccess = true;
      // Optionally push to a categoryItems list if you have one
    },
    createCategoryItemFailure(state, action) {
      state.createCategoryItemLoading = false;
      state.createCategoryItemError = action.payload;
      state.createCategoryItemSuccess = false;
    },

    // Fetch all category items (grandchildren)
    fetchCategoryItemsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryItemsSuccess(state, action: PayloadAction<CategoryItem[]>) {
      state.loading = false;
      state.categoryItems = action.payload;
    },
    fetchCategoryItemsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete category item
    deleteCategoryItemRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteCategoryItemSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.categoryItems = state.categoryItems.filter((item: any) => item.id !== action.payload);
    },
    deleteCategoryItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update category item
    updateCategoryItemRequest(state, _action: PayloadAction<{ id: string; name: string; subCategoryId: string }>) {
      state.loading = true;
      state.error = null;
    },
    updateCategoryItemSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      // Update the item in categoryItems
      const updated = action.payload;
      state.categoryItems = state.categoryItems.map(item =>
        item.id === updated.id ? { ...item, ...updated } : item
      );
    },
    updateCategoryItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchMainCategoriesRequest,
  fetchMainCategoriesSuccess,
  fetchMainCategoriesFailure,
  fetchSubCategoriesRequest,
  fetchSubCategoriesSuccess,
  fetchSubCategoriesFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  createSubCategoryRequest,
  createSubCategorySuccess,
  createSubCategoryFailure,
  fetchSubCategoriesByMainCategoryIdRequest,
  fetchSubCategoriesByMainCategoryIdSuccess,
  fetchSubCategoriesByMainCategoryIdFailure,
  createCategoryItemRequest,
  createCategoryItemSuccess,
  createCategoryItemFailure,
  fetchCategoryItemsRequest,
  fetchCategoryItemsSuccess,
  fetchCategoryItemsFailure,
  deleteCategoryItemRequest,
  deleteCategoryItemSuccess,
  deleteCategoryItemFailure,
  updateCategoryItemRequest,
  updateCategoryItemSuccess,
  updateCategoryItemFailure,
} = categorySlice.actions;

export default categorySlice.reducer;