/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./AdminAddLocation.css";
import { IoIosClose } from "react-icons/io";
import Select from "react-select";
import { useSelector } from "react-redux";

const regionOptions = [
  { value: "Metro", label: "Metro" },
  { value: "R1", label: "R1" },
  { value: "R2", label: "R2" },
  { value: "R3", label: "R3" },
];

const provinceOptions = [
  { value: "Northern", label: "Northern Province" },
  { value: "North Central", label: "North Central Province" },
  { value: "North Western", label: "North Western Province" },
  { value: "Central", label: "Central Province" },
  { value: "Eastern", label: "Eastern Province" },
  { value: "Western", label: "Western Province" },
  { value: "Sabaragamuwa", label: "Sabaragamuwa Province" },
  { value: "Uva", label: "Uva Province" },
  { value: "Southern", label: "Southern Province" },
];

const AdminAddLocation = ({
  onSubmit,
  onClose,
  isEdit = false,
  editLocation = null,
}) => {
  const { locations } = useSelector((state) => state.location);
  const [formData, setFormData] = useState({
    locationCode: "",
    locationName: "",
    region: "",
    province: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && editLocation) {
      setFormData({
        locationCode: editLocation.locationCode || "",
        locationName: editLocation.locationName || "",
        region: editLocation.region || "",
        province: editLocation.province || "",
      });
    }
  }, [isEdit, editLocation]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field errors when user types
    if (value && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleRegionChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, region: selectedOption?.value || "" }));
    if (selectedOption?.value && errors.region)
      setErrors((prev) => ({ ...prev, region: undefined }));
  };

  const handleProvinceChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, province: selectedOption?.value || "" }));
    if (selectedOption?.value && errors.province)
      setErrors((prev) => ({ ...prev, province: undefined }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate required fields
    if (!formData.locationCode) {
      newErrors.locationCode = "Please Enter the Location code";
    } else if (!isEdit && locations.some(loc => loc.locationCode === formData.locationCode)) {
      newErrors.locationCode = "This location code is already in use. Please use a different code.";
    } else if (isEdit && editLocation?.locationCode !== formData.locationCode && 
               locations.some(loc => loc.locationCode === formData.locationCode)) {
      newErrors.locationCode = "This location code is already in use. Please use a different code.";
    }
    
    if (!formData.locationName)
      newErrors.locationName = "Location Name is required";
    if (!formData.region) newErrors.region = "Region is required";
    if (!formData.province) newErrors.province = "Province is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(formData);
  };

  return (
    <div className="AdminAddLocation-modal">
      <div className="AdminAddLocation-content">
        <div className="AdminAddLocation-header">
          <h2>{isEdit ? "Edit Location" : "Add Location"}</h2>
          <button onClick={onClose}>
            <IoIosClose size={30} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="AdminAddLocation-form">
          <div className="AdminAddLocation-grid">
            {" "}
            {/* <div className="AdminAddLocation-field">
              <label>Location Code:</label>
              {errors.locationCode && (
                <span className="AdminAddLocation-form-error-text">
                  {errors.locationCode}
                </span>
              )}
              <input
                type="text"
                name="locationCode"
                value={formData.locationCode}
                onChange={handleChange}
                placeholder="LOC_001"
                style={{
                  borderColor: errors.locationCode ? "#dc3545" : "#ccc",
                }}
              />
              <small className="AdminAddLocation-helper-text">
                Enter Location Code
              </small>
            </div> */}
            <div className="AdminAddLocation-field">
              <label>Location Name:</label>
              {errors.locationName && (
                <span className="AdminAddLocation-form-error-text">
                  {errors.locationName}
                </span>
              )}
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                placeholder="e.g., Colombo"
              />
            </div>
            <div className="AdminAddLocation-field">
              <label>Region:</label>
              {errors.region && (
                <span className="AdminAddLocation-form-error-text">
                  {errors.region}
                </span>
              )}
              <Select
                options={regionOptions}
                value={regionOptions.find(
                  (opt) => opt.value === formData.region
                )}
                onChange={handleRegionChange}
                placeholder="Select Region"
                isClearable
              />
            </div>{" "}
            <div className="AdminAddLocation-field">
              <label>Province:</label>
              {errors.province && (
                <span className="AdminAddLocation-form-error-text">
                  {errors.province}
                </span>
              )}
              <Select
                options={provinceOptions}
                value={provinceOptions.find(
                  (opt) => opt.value === formData.province
                )}
                onChange={handleProvinceChange}
                placeholder="Select Province"
                isClearable
              />
            </div>
          </div>
          <div className="AdminAddLocation-form-submit">
            <button type="submit">{isEdit ? "Save" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddLocation;
