import React, { useState } from 'react';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import { sDesk_t2_category_dataset } from '../../data/sDesk_t2_category_dataset';
import './CategoryDropDown.css';

const CategoryDropdown = ({ onSelect, onClose }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (item) => {
        onSelect({ name: item.grandchild_category_name, number: item.grandchild_category_number });
        onClose();
    };

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
                    {sDesk_t2_category_dataset.map((mainCategory, index) => (
                        <div key={index} className="AdminCategoryTree-node">
                            <div
                                className="AdminCategoryTree-content-TreePopup-Body-Label"
                                onClick={() => toggleExpand(`main-${index}`)}
                            >
                                {expanded[`main-${index}`] ? (
                                    <IoMdArrowDropdown className="arrow-icon" />
                                ) : (
                                    <IoMdArrowDropright className="arrow-icon" />
                                )}
                                {mainCategory.parent_category_name}
                            </div>
                            {expanded[`main-${index}`] && (
                                <div className="AdminCategoryTree-content-TreePopup-Body-SubNodes">
                                    {mainCategory.subcategories.map((subcategory, subIndex) => (
                                        <div key={subIndex} className="AdminCategoryTree-subnode">
                                            <div
                                                className="AdminCategoryTree-content-TreePopup-Body-SubNodes-Label"
                                                onClick={() => toggleExpand(`main-${index}-sub-${subIndex}`)}
                                            >
                                                {expanded[`main-${index}-sub-${subIndex}`] ? (
                                                    <IoMdArrowDropdown className="arrow-icon" />
                                                ) : (
                                                    <IoMdArrowDropright className="arrow-icon" />
                                                )}
                                                {subcategory.child_category_name}
                                            </div>
                                            {expanded[`main-${index}-sub-${subIndex}`] && (
                                                <div className="AdminCategoryTree-items">
                                                    {subcategory.items.map((item, itemIndex) => (
                                                        <div
                                                            key={itemIndex}
                                                            className="AdminCategoryTree-item"
                                                            onClick={() => handleSelect(item)}
                                                        >
                                                            {item.grandchild_category_name}
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