import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamAdminsRequest,
  createTeamAdminRequest,
  updateTeamAdminRequest,
  deleteTeamAdminRequest,
} from "../../../redux/teamAdmin/teamAdminSlice";
import { fetchUserByServiceNum } from "../../../redux/sltusers/sltusersService";
import { useDispatch as useSagaDispatch } from "react-redux";
import { fetchMainCategoriesRequest, fetchSubCategoriesByMainCategoryIdRequest } from "../../../redux/categories/categorySlice";
import { useSelector as useAppSelector } from "react-redux";
// Removed unused sDesk_t2_users_dataset import
import "./ManageTeamAdmin.css";

const initialForm = {
  serviceNumber: "",
  userName: "",
  contactNumber: "",
  designation: "",
  email: "",
  cat1: "",
  cat2: "",
  cat3: "",
  cat4: "",
  teamId: "",
  teamName: "",
};

const MAX_CATEGORIES = 4;

const ManageTeamAdmin = () => {
  const dispatch = useDispatch();
  // Add fallback for undefined state.teamAdmin
  const { teamAdmins, loading, error } = useSelector(
    (state) =>
      state.teamAdmin || { teamAdmins: [], loading: false, error: null }
  );
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  // Get sltusers error from Redux (for backend error display)
  const sltusersError = useSelector(state => state.sltusers?.error);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  // --- Category/Team Redux State ---
  const mainCategories = useAppSelector(state => state.categories?.mainCategories || []);
  const subCategories = useAppSelector(state => state.categories?.subCategories || []);
  const categoriesLoading = useAppSelector(state => state.categories?.loading);
  const categoriesError = useAppSelector(state => state.categories?.error);
  const subCategoriesLoading = useAppSelector(state => state.categories?.subCategoriesLoading);
  const subCategoriesError = useAppSelector(state => state.categories?.subCategoriesError);
  // Fetch main categories (teams) on mount
  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
  }, [dispatch]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  // --- Confirmation & Info Message State ---
  const [infoMessage, setInfoMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    dispatch(fetchTeamAdminsRequest());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Service Number change: fetch user, always auto-fill designation as 'admin'
  const handleServiceNumberChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, serviceNumber: value }));
    if (!value.trim()) {
      setForm((prev) => ({
        ...prev,
        userName: "",
        designation: "admin",
        email: "",
        contactNumber: "",
      }));
      setSubmitError("");
      return;
    }

    setSubmitError("");
    setForm((prev) => ({
      ...prev,
      userName: "Loading...",
      designation: "admin",
      email: "Loading...",
    }));

    try {
      const response = await fetchUserByServiceNum(value);
      const user = response.data;
      if (user) {
        setForm((prev) => ({
          ...prev,
          userName: user.display_name || "",
          designation: "admin",
          email: user.email || "",
          contactNumber: user.tp_number || "",
        }));
        setSubmitError("");
      } else {
        setForm((prev) => ({
          ...prev,
          userName: "",
          designation: "admin",
          email: "",
          contactNumber: "",
        }));
        setSubmitError("User not found in database.");
      }
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        userName: "",
        designation: "admin",
        email: "",
        contactNumber: "",
      }));
      setSubmitError("User not found in database.");
    }
  };

  // --- Edit with Confirmation on Pencil Icon Click ---
  const handleEditClick = (admin) => {
    if (!admin || !admin.teamId || !admin.id) {
      setSubmitError("Invalid admin data for editing");
      return;
    }
    setConfirmMessage("Are you sure you want to update this admin?");
    setShowConfirm(true);
    setConfirmAction(() => () => {
      setForm({
        serviceNumber: admin.serviceNumber,
        userName: admin.userName,
        contactNumber: admin.contactNumber,
        designation: admin.designation,
        email: admin.email,
        cat1: admin.cat1,
        cat2: admin.cat2,
        cat3: admin.cat3,
        cat4: admin.cat4,
        teamId: admin.teamId,
        teamName: admin.teamName,
      });
      const cats = [admin.cat1, admin.cat2, admin.cat3, admin.cat4].filter(
        Boolean
      );
      setSelectedCategories(cats);
      setEditMode(true);
      setEditId(admin.teamId);
      setShowModal(true);
      setSubmitError("");
      setSubmitSuccess(false);
      setShowConfirm(false);
      setConfirmAction(null);
    });
  };

  const handleEditSubmit = () => {
    const payload = {
      serviceNumber: form.serviceNumber,
      userName: form.userName,
      contactNumber: form.contactNumber,
      designation: form.designation,
      email: form.email,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
      teamId: form.teamId,
      teamName: form.teamName,
    };
    dispatch(updateTeamAdminRequest({ id: editId, data: payload }));
    setInfoMessage("Admin updated successfully!");
    setShowModal(false);
    setTimeout(() => setInfoMessage(""), 2000);
  };

  const handleAddClick = () => {
    setForm(initialForm);
    setShowModal(true);
    setSubmitError("");
    setSubmitSuccess(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  // When teamName changes, update teamId and fetch subcategories from backend
  useEffect(() => {
    if (form.teamName) {
      const selectedTeam = mainCategories.find(cat => cat.name === form.teamName);
      if (selectedTeam) {
        setForm(prev => ({ ...prev, teamId: selectedTeam.category_code }));
        dispatch(fetchSubCategoriesByMainCategoryIdRequest(selectedTeam.id));
      } else {
        setForm(prev => ({ ...prev, teamId: "" }));
        setAvailableCategories([]);
        setSelectedCategories([]);
      }
    } else {
      setForm(prev => ({ ...prev, teamId: "" }));
      setAvailableCategories([]);
      setSelectedCategories([]);
    }
  }, [form.teamName, mainCategories, dispatch]);

  // When subCategories in Redux change, update availableCategories
  useEffect(() => {
    if (Array.isArray(subCategories)) {
      setAvailableCategories(subCategories);
      // Remove any selected categories that are no longer available
      setSelectedCategories(prev => prev.filter(cat => subCategories.some(sub => sub.name === cat)));
    } else {
      setAvailableCategories([]);
    }
  }, [subCategories]);

  // When selectedCategories changes, update cat1-cat4 in form
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
    }));
  }, [selectedCategories]);

  // Validation helpers
  const validateForm = (form, selectedCategories) => {
    const errors = {};
    if (!form.serviceNumber)
      errors.serviceNumber = "Service Number is required";
    if (!form.userName) errors.userName = "Full Name is required";
    if (!form.contactNumber)
      errors.contactNumber = "Contact Number is required";
    if (!form.designation) errors.designation = "Designation is required";
    if (!form.email) errors.email = "Email is required";
    if (!form.teamId) errors.teamId = "Team ID is required";
    if (!form.teamName) errors.teamName = "Team Name is required";
    if (selectedCategories.length === 0)
      errors.categories = "At least one category must be selected";
    if (selectedCategories.length > MAX_CATEGORIES)
      errors.categories = `Maximum ${MAX_CATEGORIES} categories allowed`;
    return errors;
  };

  // Add/Edit form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);
    // Always set designation to 'admin' for add
    const isEdit = editMode && editId;
    const payload = {
      serviceNumber: form.serviceNumber,
      userName: form.userName,
      contactNumber: form.contactNumber,
      designation: isEdit ? form.designation : "admin",
      email: form.email,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
      teamId: form.teamId,
      teamName: form.teamName,
    };
    const errors = validateForm(payload, selectedCategories);
    if (Object.keys(errors).length > 0) {
      setSubmitError(Object.values(errors).join(" | "));
      return;
    }
    if (isEdit) {
      dispatch(updateTeamAdminRequest({ id: editId, data: payload }));
      setInfoMessage("Admin updated successfully!");
      setShowModal(false);
      setTimeout(() => setInfoMessage(""), 2000);
    } else {
      try {
        // Call both APIs in parallel: createTeamAdminRequest and updateUserRoleRequest
        const results = await Promise.allSettled([
          dispatch(createTeamAdminRequest({ ...payload, teamId: form.teamId })),
          dispatch({
            type: 'sltusers/updateUserRoleRequest',
            payload: { serviceNum: form.serviceNumber, role: "admin" }
          })
        ]);
        // Check for errors in both results
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => r.reason?.message || r.reason || 'Unknown error');
        if (errors.length > 0) {
          setSubmitError("Failed to add admin and/or update user role: " + errors.join(' | '));
          console.error("Failed to add admin and/or update user role:", errors);
        } else {
          setInfoMessage("Admin added successfully!");
          setSubmitSuccess(true);
          setTimeout(() => {
            setShowModal(false);
            setSubmitSuccess(false);
            setEditMode(false);
            setEditId(null);
            setInfoMessage("");
          }, 1000);
        }
      } catch (err) {
        setSubmitError("Failed to add admin and/or update user role: " + (err?.message || err));
        console.error("Failed to add admin and/or update user role:", err);
      }
    }
  };

  const handleDeleteClick = (admin) => {
    if (!admin || !admin.teamId || !admin.id) {
      alert("Cannot delete: Missing admin data!");
      console.error(
        "Delete failed: admin.teamId or admin.id is undefined",
        admin
      );
      return;
    }
    setConfirmMessage("Are you sure you want to delete this admin?");
    setShowConfirm(true);
    setConfirmAction(() => () => {
      dispatch(deleteTeamAdminRequest({ teamId: admin.teamId, id: admin.id }));
      setInfoMessage("Admin deleted successfully!");
      setShowConfirm(false);
      setTimeout(() => setInfoMessage(""), 2000);
    });
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header-row">
        <h2>Team Admin List</h2>
        <button className="add-user-btn" onClick={handleAddClick}>
          Add Admin
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {(submitError || sltusersError) && (
        <div
          className="error"
          style={{
            color: "red",
            fontWeight: "bold",
            margin: "16px 0",
          }}
        >
          {submitError}
          {sltusersError && <div>{sltusersError}</div>}
        </div>
      )}
      {teamAdmins.length === 0 && !loading && !error && (
        <div
          style={{
            color: "orange",
            fontWeight: "bold",
            margin: "16px 0",
          }}
        >
          No admins found
        </div>
      )}
      <table className="teamadmin-table">
        <thead>
          <tr>
            <th>Service Number</th>
            <th>Full Name</th>
            <th>Contact</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Team Name</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(teamAdmins) ? teamAdmins : []).map((admin) => (
            <tr key={admin.id}>
              <td>{admin.serviceNumber}</td>
              <td>{admin.userName}</td>
              <td>{admin.contactNumber}</td>
              <td>{admin.designation}</td>
              <td>{admin.email}</td>
              <td>{admin.teamName}</td>
              <td>
                <button
                  className="edit-btn"
                  title="Edit this admin"
                  onClick={() => handleEditClick(admin)}
                  style={{ marginRight: 8 }}
                >
                  <span role="img" aria-label="Edit">
                    ✏️
                  </span>
                </button>
                <button
                  className="delete-btn"
                  title="Delete this admin"
                  onClick={() => handleDeleteClick(admin)}
                  style={{
                    color: "#fff",
                    background: "#dc3545",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  <span role="img" aria-label="Delete">
                    🗑️
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal-content teamadmin-form-container"
            style={{ width: "540px" }}
          >
            <div className="modal-header">
              <h3>{editMode ? "Edit Team Admin" : "Add Team Admin"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setEditId(null);
                }}
              >
                ×
              </button>
            </div>
            <form className="add-user-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Number:</label>
                  <input
                    name="serviceNumber"
                    value={form.serviceNumber}
                    onChange={handleServiceNumberChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name:</label>
                  <input name="userName" value={form.userName} readOnly />
                </div>
              </div>{" "}
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="form-group">
                  <label>Designation:</label>
                  <input name="designation" value={form.designation} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    name="email"
                    value={form.email}
                    type="email"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Team ID:</label>
                  <input name="teamId" value={form.teamId} readOnly />
                </div>
                <div className="form-group">
                  <label>Team Name:</label>
                  <select
                    name="teamName"
                    value={form.teamName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Team</option>
                    {mainCategories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.name}
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categoriesLoading && <div style={{ fontSize: "0.9em", color: "#888" }}>Loading teams...</div>}
                  {categoriesError && <div className="error">{categoriesError}</div>}
                </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categories (select up to 4):</label>
                  {subCategoriesLoading && (
                    <div style={{ color: '#888', fontSize: '0.95em', margin: '6px 0' }}>Loading categories...</div>
                  )}
                  {subCategoriesError && (
                    <div className="error" style={{ color: 'red', fontSize: '0.95em', margin: '6px 0' }}>{subCategoriesError}</div>
                  )}
                  {!subCategoriesLoading && !subCategoriesError && availableCategories.length === 0 && (
                    <div style={{ color: '#888', fontSize: '0.95em', margin: '6px 0' }}>No categories found for this team.</div>
                  )}
                  <div className="category-checkbox-group-row">
                    {Array.isArray(availableCategories) && availableCategories.map((sub) => (
                      <label
                        key={sub.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 400,
                          marginRight: 18,
                        }}
                      >
                        <input
                          type="checkbox"
                          value={sub.name}
                          checked={selectedCategories.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedCategories.length < MAX_CATEGORIES) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  sub.name,
                                ]);
                              }
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== sub.name)
                              );
                            }
                          }}
                          disabled={
                            !selectedCategories.includes(sub.name) &&
                            selectedCategories.length >= MAX_CATEGORIES
                          }
                        />
                        {sub.name}
                      </label>
                    ))}
                  </div>
                  <div
                    style={{ fontSize: "0.92em", color: "#888", marginTop: 2 }}
                  >
                    {selectedCategories.length}/{MAX_CATEGORIES} selected
                  </div>
                </div>
              </div>
              </div>
              {submitError && <div className="error">{submitError}</div>}
              {submitSuccess && (
                <div style={{ color: "green", marginBottom: 8 }}>
                  Admin added!
                </div>
              )}
              <div className="form-row" style={{ justifyContent: "flex-end" }}>
                <button type="submit" className="add-btn">
                  {editMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Confirmation & Info Message Popups --- */}
      {showConfirm && (
        <div className="sa-modal-overlay">
          <div className="sa-modal-confirm">
            <div className="sa-modal-title">Confirmation</div>
            <div className="sa-modal-message">{confirmMessage}</div>
            <div className="sa-modal-actions">
              <button
                className="sa-btn sa-btn-cancel"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </button>
              <button
                className="sa-btn sa-btn-confirm"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {infoMessage && (
        <div className="sa-modal-overlay">
          <div className="sa-modal-info">
            <span className="sa-modal-info-icon">✔️</span>
            <span>{infoMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeamAdmin;
