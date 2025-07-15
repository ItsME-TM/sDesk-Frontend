import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import './CategoryDropdown.css';
import { fetchCategoriesRequest } from '../../redux/categories/categorySlice';

const CategoryDropdown = ({ onSelect, onClose, categoryDataset }) => {
    const [expanded, setExpanded] = useState({});
    const dispatch = useDispatch();
    
    // Get data from Redux store
    const { list: mainCategories, loading: isLoading, error } = useSelector((state) => state.categories);

    useEffect(() => {
        // Fetch categories using Redux action
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (item) => {
        onSelect({ name: item.name, number: item.category_code });
        onClose();
    };

    if (isLoading) {
        return <div className="AdminCategoryTree-content">Loading categories...</div>;
    }

    if (error) {
        return <div className="AdminCategoryTree-content">Error: {error}</div>;
    }

    return (
        <div className="AdminCategoryTree-content">
            <div className="AdminCategoryTree-content-TreePopup">
                <div className="AdminCategoryTree-content-TreePopup-Header">
                    <h3>Select Category</h3>
                    <button
                        onClick={onClose}
                        className="AdminCategoryTree-content-TreePopup-Header-closeButton"
                    >
                        <IoIosClose size={30} />
                    </button>
                </div>
                <div className="AdminCategoryTree-content-TreePopup-Body">
                    {mainCategories.map((mainCategory) => (
                        <div key={mainCategory.id} className="AdminCategoryTree-node">
                            <div
                                className="AdminCategoryTree-content-TreePopup-Body-Label"
                                onClick={() => toggleExpand(`main-${mainCategory.id}`)}
                            >
                                {expanded[`main-${mainCategory.id}`] ? (
                                    <IoMdArrowDropdown className="arrow-icon" />
                                ) : (
                                    <IoMdArrowDropright className="arrow-icon" />
                                )}
                                {mainCategory.name}
                            </div>
                            {expanded[`main-${mainCategory.id}`] && (
                                <div className="AdminCategoryTree-content-TreePopup-Body-SubNodes">
                                    {mainCategory.subCategories.map((subcategory) => (
                                        <div key={subcategory.id} className="AdminCategoryTree-subnode">
                                            <div
                                                className="AdminCategoryTree-content-TreePopup-Body-SubNodes-Label"
                                                onClick={() => toggleExpand(`sub-${subcategory.id}`)}
                                            >
                                                {expanded[`sub-${subcategory.id}`] ? (
                                                    <IoMdArrowDropdown className="arrow-icon" />
                                                ) : (
                                                    <IoMdArrowDropright className="arrow-icon" />
                                                )}
                                                {subcategory.name}
                                            </div>
                                            {expanded[`sub-${subcategory.id}`] && (
                                                <div className="AdminCategoryTree-items">
                                                    {subcategory.categoryItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="AdminCategoryTree-item"
                                                            onClick={() => handleSelect(item)}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryDropdown;