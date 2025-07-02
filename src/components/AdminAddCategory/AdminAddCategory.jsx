import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategoryRequest, fetchMainCategoriesRequest, fetchSubCategoriesRequest, fetchSubCategoriesByMainCategoryIdRequest, createCategoryItemRequest, updateCategoryItemRequest } from '../../redux/categories/categorySlice';
import './AdminAddCategory.css';
import { IoIosClose } from 'react-icons/io';

const AdminAddCategory = ({ onSubmit, onClose, isEdit = false, editCategory = null }) => {
    const dispatch = useDispatch();
    const mainCategories = useSelector(state => state.categories.mainCategories);
    const subCategories = useSelector(state => state.categories.subCategories);
    const categoryError = useSelector(state => state.categories.error);
    const subCategoryError = useSelector(state => state.categories.createSubCategoryError);
    const subCategorySuccess = useSelector(state => state.categories.createSubCategorySuccess);
    const mainCategoryError = useSelector(state => state.categories.createMainCategoryError);
    const mainCategorySuccess = useSelector(state => state.categories.createMainCategorySuccess);
    const categoryItemError = useSelector(state => state.categories.createCategoryItemError);
    const categoryItemSuccess = useSelector(state => state.categories.createCategoryItemSuccess);
    const [categoryType, setCategoryType] = useState(isEdit ? editCategory?.type || 'grandchild' : 'grandchild');
    const [formData, setFormData] = useState(
        isEdit && editCategory
            ? {
                  name: editCategory.name || '',
                  parent: editCategory.parent || '',
                  sub: editCategory.sub || '',
              }
            : { name: '', parent: '', sub: '' }
    );
    const [errors, setErrors] = useState({});
    const [localSuccess, setLocalSuccess] = useState('');

    useEffect(() => {
        dispatch(fetchMainCategoriesRequest());
        dispatch(fetchSubCategoriesRequest());
    }, [dispatch]);

    // Fetch subcategories for selected parent (main category) when parent changes in grandchild form
    useEffect(() => {
        if (categoryType === 'grandchild' && formData.parent) {
            dispatch(fetchSubCategoriesByMainCategoryIdRequest(formData.parent));
        }
    }, [categoryType, formData.parent, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (value && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (categoryType !== 'parent' && !formData.parent) newErrors.parent = 'Parent Category is required';
        if (categoryType === 'grandchild' && !formData.sub) newErrors.sub = 'Sub Category is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        if (!isEdit) {
            if (categoryType === 'parent') {
                dispatch(createCategoryRequest({ name: formData.name }));
                return;
            } else if (categoryType === 'sub') {
                const parentObj = mainCategories.find(cat => cat.id === formData.parent);
                if (!parentObj) {
                    setErrors({ parent: 'Invalid parent category selected❌' });
                    return;
                }
                dispatch({ type: 'categories/createSubCategoryRequest', payload: { name: formData.name, mainCategoryId: parentObj.id } });
                return;
            } else if (categoryType === 'grandchild') {
                dispatch(createCategoryItemRequest({ name: formData.name, subCategoryId: formData.sub }));
                return;
            }
        } else {
            // Only allow editing for grandchild/category-item
            if (categoryType === 'grandchild' && editCategory?.id) {
                dispatch(updateCategoryItemRequest({
                    id: editCategory.id,
                    name: formData.name,
                    subCategoryId: formData.sub
                }));
                setLocalSuccess('Category item updated successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 1000);
                return;
            }
            // Optionally handle other types if needed
        }
    };

    // Filter subcategories for selected parent
    const filteredSubCategories = categoryType === 'grandchild' && formData.parent
        ? subCategories.filter(sub => sub.mainCategory && sub.mainCategory.id === formData.parent)
        : [];

    useEffect(() => {
        if (categoryType === 'parent' && !isEdit) {
            if (mainCategorySuccess && !mainCategoryError && !errors.name && formData.name) {
                setLocalSuccess('Parent category added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onSubmit && onSubmit({ name: formData.name });
                    onClose();
                }, 1000);
            }
        }
        if (categoryType === 'sub' && !isEdit) {
            if (subCategorySuccess && !subCategoryError && !errors.name && formData.name && formData.parent) {
                setLocalSuccess('Subcategory added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 2000);
            }
        }
        if (categoryType === 'grandchild' && !isEdit) {
            if (categoryItemSuccess && !categoryItemError && !errors.name && formData.name && formData.sub) {
                setLocalSuccess('Category item added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 2000);
            }
        }
        // eslint-disable-next-line
    }, [mainCategoryError, mainCategorySuccess, categoryError, subCategorySuccess, subCategoryError, categoryItemSuccess, categoryItemError]);

    return (
        <div className="AdminAddCategory-modal">
            <div className="AdminAddCategory-content1">
                <div className="AdminAddCategory-content1-topcontainer">
                    <div>
                        <div className="AdminAddCategory-content1-topcontainer-selectContainer">
                            <label className="AdminAddCategory-content1-topcontainer-label">Category Type:</label>
                            <select
                                className="AdminAddCategory-content1-topcontainer-select"
                                value={categoryType}
                                onChange={(e) => {
                                    setCategoryType(e.target.value);
                                    setFormData({ name: '', parent: '', sub: '' });
                                    setErrors({});
                                }}
                            >
                                <option value="parent">Parent Category</option>
                                <option value="sub">Sub Category</option>
                                <option value="grandchild">Category</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button onClick={onClose}>
                            <IoIosClose size={30} />
                        </button>
                    </div>
                </div>
                <div className="AdminAddCategory-content1-formContainer">
                    <form
                        onSubmit={handleSubmit}
                        className="AdminAddCategory-content1-formContainer-form"
                    >
                        {categoryType === 'parent' && (
                            <div className="AdminAddCategory-field-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {/* Show required field error or duplicate name error */}
                                {(errors.name || mainCategoryError === 'DUPLICATE_NAME') && (
                                    <div className="AdminAddCategory-content1-error-message">
                                        {mainCategoryError === 'DUPLICATE_NAME' && (
                                            <span>This main category name already exists.</span>
                                        )}
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        )}
                        {categoryType === 'sub' && (
                            <div>
                                <label>Parent Category:</label>
                                {errors.parent && <span className="AdminAddCategory-content1-error-message">{errors.parent}</span>}
                                <select
                                    name="parent"
                                    value={formData.parent}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Parent</option>
                                    {mainCategories.map(parent => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name} (Code: {parent.category_code})
                                        </option>
                                    ))}
                                </select>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {/* Show required field error or duplicate name error under the input */}
                                {(errors.name || subCategoryError === 'DUPLICATE_NAME') && (
                                    <div className="AdminAddCategory-content1-error-message">
                                        {subCategoryError === 'DUPLICATE_NAME' && (
                                            <span>This sub category name already exists under this parent.</span>
                                        )}
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        )}
                        {categoryType === 'grandchild' && (
                            <div>
                                <label>Parent Category:</label>
                                {errors.parent && <span className="AdminAddCategory-content1-error-message">{errors.parent}</span>}
                                <select
                                    name="parent"
                                    value={formData.parent}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Parent</option>
                                    {mainCategories.map(parent => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name} (Code: {parent.category_code})
                                        </option>
                                    ))}
                                </select>
                                <label>Sub Category:</label>
                                {errors.sub && <span className="AdminAddCategory-content1-error-message">{errors.sub}</span>}
                                <select
                                    name="sub"
                                    value={formData.sub}
                                    onChange={handleChange}
                                    disabled={!formData.parent}
                                >
                                    <option value="">Select Sub Category</option>
                                    {formData.parent && filteredSubCategories.length > 0 ? (
                                        filteredSubCategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name} (Code: {sub.category_code})
                                            </option>
                                        ))
                                    ) : null}
                                </select>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {/* Show required field error or duplicate name error under the input */}
                                {(errors.name || categoryItemError === 'DUPLICATE_NAME') && (
                                    <div className="AdminAddCategory-content1-error-message">
                                        {categoryItemError === 'DUPLICATE_NAME' && (
                                            <span>This category item name already exists under this sub category.</span>
                                        )}
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="AdminAddCategory-content1-formContainer-form-submit">
                            <button type="submit">{isEdit ? 'Save' : 'Add'}</button>
                        </div>
                    </form>
                    {/* Show success message only if localSuccess is set */}
                    {localSuccess && (
                        <div className="AdminAddCategory-success-message" style={{ color: 'green', fontWeight: 600 }}>
                            {localSuccess}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAddCategory;