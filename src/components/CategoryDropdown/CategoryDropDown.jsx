import React, { useState, useEffect } from "react";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import "./CategoryDropDown.css";

const CategoryDropdown = ({ onSelect, onClose, categoryDataset }) => {
  const [expanded, setExpanded] = useState({});
  const [mainCategories, setMainCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/categories/main");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMainCategories(data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    return (
      <div className="AdminCategoryTree-content">Loading categories...</div>
    );
  }

  if (error) {
    return (
      <div className="AdminCategoryTree-content">Error: {error.message}</div>
    );
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
                    <div
                      key={subcategory.id}
                      className="AdminCategoryTree-subnode"
                    >
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
