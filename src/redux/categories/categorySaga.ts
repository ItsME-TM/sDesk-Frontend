import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchCategoriesFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
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
} from './categorySlice';
import {
  createMainCategory,
  createSubCategory,
  fetchMainCategories,
  fetchSubCategoriesByMainCategoryId,
  createCategoryItem,
  fetchCategoryItems,
  deleteCategoryItem,
  updateCategoryItem,
} from './categoryService';
import { PayloadAction } from '@reduxjs/toolkit';
import { CreateMainCategoryPayload, CreateSubCategoryPayload } from './categoryTypes';

function* handleFetchCategories() {
  try {
    const categories = yield call(fetchMainCategories);
    yield put(fetchCategoriesSuccess(categories.data)); // Only dispatch serializable data
  } catch (error: any) {
    yield put(fetchCategoriesFailure(error.message));
  }
}

function* handleCreateCategory(action: PayloadAction<CreateMainCategoryPayload | CreateSubCategoryPayload>) {
  try {
    let newCategory;
    // If mainCategoryId is present, it's a subcategory
    if ('mainCategoryId' in action.payload && action.payload.mainCategoryId) {
      newCategory = yield call(createSubCategory, action.payload);
    } else {
      newCategory = yield call(createMainCategory, action.payload);
    }
    yield put(createCategorySuccess(newCategory.data)); // Only dispatch serializable data
  } catch (error: any) {
    // Handle duplicate name error from backend
    if (error && error.code === 'DUPLICATE_NAME') {
      yield put(createCategoryFailure('DUPLICATE_NAME'));
    } else if (error && error.message && typeof error.message === 'string' && error.message.includes('already exists')) {
      yield put(createCategoryFailure('DUPLICATE_NAME'));
    } else {
      yield put(createCategoryFailure(error.message || 'Error creating category'));
    }
  }
}

function* handleFetchMainCategories() {
  try {
    const categories = yield call(fetchMainCategories);
    yield put({ type: 'categories/fetchMainCategoriesSuccess', payload: categories.data });
  } catch (error) {
    yield put({ type: 'categories/fetchMainCategoriesFailure', payload: error.message });
  }
}

function* handleFetchSubCategoriesByMainCategoryId(action: PayloadAction<string>) {
  try {
    const response = yield call(fetchSubCategoriesByMainCategoryId, action.payload);
    yield put(fetchSubCategoriesByMainCategoryIdSuccess(response.data));
  } catch (error: any) {
    yield put(fetchSubCategoriesByMainCategoryIdFailure(error.message));
  }
}

function* handleCreateMainCategory(action: PayloadAction<CreateMainCategoryPayload>) {
  try {
    const newCategory = yield call(createMainCategory, action.payload);
    yield put({ type: 'categories/createCategorySuccess', payload: newCategory.data });
  } catch (error) {
    if (error && error.code === 'DUPLICATE_NAME') {
      yield put({ type: 'categories/createCategoryFailure', payload: 'DUPLICATE_NAME' });
    } else if (error && error.message && typeof error.message === 'string' && error.message.includes('already exists')) {
      yield put({ type: 'categories/createCategoryFailure', payload: 'DUPLICATE_NAME' });
    } else {
      yield put({ type: 'categories/createCategoryFailure', payload: error.message || 'Error creating main category' });
    }
  }
}

function* handleCreateCategoryItem(action: PayloadAction<CreateSubCategoryPayload>) {
  try {
    const response = yield call(createCategoryItem, action.payload);
    yield put({ type: 'categories/createCategoryItemSuccess', payload: response.data });
  } catch (error) {
    if (error && error.code === 'DUPLICATE_NAME') {
      yield put({ type: 'categories/createCategoryItemFailure', payload: 'DUPLICATE_NAME' });
    } else if (error && error.message && typeof error.message === 'string' && error.message.includes('already exists')) {
      yield put({ type: 'categories/createCategoryItemFailure', payload: 'DUPLICATE_NAME' });
    } else {
      yield put({ type: 'categories/createCategoryItemFailure', payload: error.message || 'Error creating category item' });
    }
  }
}

function* handleFetchCategoryItems() {
  try {
    const response = yield call(fetchCategoryItems);
    yield put(fetchCategoryItemsSuccess(response.data));
  } catch (error) {
    yield put(fetchCategoryItemsFailure(error.message));
  }
}

function* handleDeleteCategoryItem(action: PayloadAction<string>) {
  try {
    yield call(deleteCategoryItem, action.payload);
    yield put(deleteCategoryItemSuccess(action.payload));
    // Optionally refresh the list
    yield put(fetchCategoryItemsRequest());
  } catch (error: any) {
    yield put(deleteCategoryItemFailure(error.message || 'Delete failed'));
  }
}

function* handleUpdateCategoryItem(action: PayloadAction<{ id: string; name: string; subCategoryId: string }>) {
  try {
    const { id, name, subCategoryId } = action.payload;
    // The backend expects subCategoryId as a key
    const response = yield call(() => updateCategoryItem(id, { name, subCategoryId }));
    yield put(updateCategoryItemSuccess(response.data));
    yield put(fetchCategoryItemsRequest());
  } catch (error: any) {
    yield put(updateCategoryItemFailure(error.message || 'Update failed'));
  }
}

function* handleCreateSubCategory(action: PayloadAction<CreateSubCategoryPayload>) {
  try {
    const newSubCategory = yield call(createSubCategory, action.payload);
    yield put({ type: 'categories/createSubCategorySuccess', payload: newSubCategory.data });
  } catch (error) {
    if (error && error.code === 'DUPLICATE_NAME') {
      yield put({ type: 'categories/createSubCategoryFailure', payload: 'DUPLICATE_NAME' });
    } else if (error && error.message && typeof error.message === 'string' && error.message.includes('already exists')) {
      yield put({ type: 'categories/createSubCategoryFailure', payload: 'DUPLICATE_NAME' });
    } else {
      yield put({ type: 'categories/createSubCategoryFailure', payload: error.message || 'Error creating subcategory' });
    }
  }
}

export default function* categorySaga() {
  yield takeLatest(fetchCategoriesRequest.type, handleFetchCategories);
  yield takeLatest(createCategoryRequest.type, handleCreateCategory);
  yield takeLatest('categories/fetchMainCategoriesRequest', handleFetchMainCategories);
  yield takeLatest(fetchSubCategoriesByMainCategoryIdRequest.type, handleFetchSubCategoriesByMainCategoryId);
  yield takeLatest(createCategoryItemRequest.type, handleCreateCategoryItem);
  yield takeLatest(fetchCategoryItemsRequest.type, handleFetchCategoryItems);
  yield takeLatest(deleteCategoryItemRequest.type, handleDeleteCategoryItem);
  yield takeLatest(updateCategoryItemRequest.type, handleUpdateCategoryItem);
  yield takeLatest('categories/createSubCategoryRequest', handleCreateSubCategory);
  yield takeLatest('categories/createMainCategoryRequest', handleCreateMainCategory);
  yield takeLatest('categories/createCategoryRequest', handleCreateMainCategory);
  yield takeLatest('categories/createCategoryItemRequest', handleCreateCategoryItem);
}
