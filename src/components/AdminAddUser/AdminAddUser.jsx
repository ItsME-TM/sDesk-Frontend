import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByServiceNumberRequest, clearUser } from '../../redux/sltusers/sltusersSlice';
import './AdminAddUser.css';
import { IoIosClose } from 'react-icons/io';

const AdminAddUser = ({ onSubmit, onClose, isEdit = false, editUser = null }) => {
  const dispatch = useDispatch();

  const loggedInUser = useSelector(state => state.auth?.user);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    teamName: loggedInUser?.teamName || '', // take from logged user
    role: 'technician',
    tier: '1',
    active: true,
    categories: [
      loggedInUser?.cat1,
      loggedInUser?.cat2,
      loggedInUser?.cat3,
      loggedInUser?.cat4
    ].filter(Boolean), // take from logged user
  });

  const [errors, setErrors] = useState({});

  const sltUser = useSelector(state => state.sltusers.user);
  const sltUserLoading = useSelector(state => state.sltusers.loading);
  const sltUserError = useSelector(state => state.sltusers.error);

  // Define filteredSubCategories from loggedInUser's categories
  const filteredSubCategories = [
    loggedInUser?.cat1,
    loggedInUser?.cat2,
    loggedInUser?.cat3,
    loggedInUser?.cat4
  ].filter(Boolean).map(cat => ({ id: cat, name: cat }));

  // Handle SLT user fetch
  const handleServiceNumBer = () => {
    if (formData.id.trim()) {
      dispatch(fetchUserByServiceNumberRequest(formData.id.trim()));
    } else {
      dispatch(clearUser());
    }
  };

  // When SLT user is fetched
  useEffect(() => {
    if (sltUser) {
      setFormData(prev => ({
        ...prev,
        name: sltUser.display_name || '',
        email: sltUser.email || '',
        id: sltUser.serviceNum || '',
      }));
    }
  }, [sltUser]);

  useEffect(() => {
    if (!sltUser) {
      setFormData(prev => ({ ...prev, name: '', email: '' }));
    }
  }, [sltUser]);

  // If editing a user, populate only editable fields (teamName still comes from admin)
  useEffect(() => {
    if (isEdit && editUser) {
      setFormData(prev => ({
        ...prev,
        id: editUser.serviceNum || editUser.serviceNumber || editUser.id || '',
        name: editUser.name || '',
        email: editUser.email || '',
        categories: editUser.categories || [editUser.cat1, editUser.cat2, editUser.cat3, editUser.cat4].filter(Boolean),
        tier: editUser.tier?.toString() || '1',
        role: editUser.role || 'technician',
        active: editUser.active !== undefined ? editUser.active : true,
      }));
    }
  }, [isEdit, editUser]);

  // Reset formData to initial state (with teamName) when switching to add mode (not edit)
  useEffect(() => {
    if (!isEdit) {
      setFormData({
        id: '',
        name: '',
        email: '',
        teamName: loggedInUser?.teamName || '',
        role: 'technician',
        tier: '1',
        active: true,
        categories: [],
      });
    }
  }, [isEdit, loggedInUser]);

  // Always set teamName from admin/cookie when adding or editing
  useEffect(() => {
    if (loggedInUser && loggedInUser.teamName) {
      setFormData(prev => ({ ...prev, teamName: loggedInUser.teamName }));
    }
  }, [loggedInUser]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryChange = e => {
    const value = e.target.value;
    setFormData(prev => {
      const selected = new Set(prev.categories);
      if (selected.has(value)) selected.delete(value);
      else if (selected.size < 4) selected.add(value);
      return { ...prev, categories: Array.from(selected) };
    });
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: undefined }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.id) newErrors.id = 'Service Number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.teamName) newErrors.teamName = 'Team is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      serviceNum: formData.id,
      email: formData.email,
      name: formData.name,
      team: formData.teamName,
      tier: Number(formData.tier),
      active: formData.active,
      cat1: formData.categories[0] || '',
      cat2: formData.categories[1] || '',
      cat3: formData.categories[2] || '',
      cat4: formData.categories[3] || '',
      level: Number(formData.tier) === 1 ? 'Tier1' : 'Tier2',
      rr: 1,
      designation: 'Technician',
      contactNumber: '0000000000',
      teamLevel: 'Default',
      teamLeader: formData.teamLeader ?? false,
      assignAfterSignOff: formData.assignAfterSignOff ?? false,
      permanentMember: formData.permanentMember ?? false,
      subrootUser: formData.subrootUser ?? false,
      isEdit,
    };
    onSubmit(payload);
  };

  const showUserNotFound = formData.id && !sltUserLoading && !sltUser && !sltUserError;

  useEffect(() => {
    if (sltUserError?.includes('not found')) {
      console.warn('SLT User not found for this service number. User can enter details manually.');
    }
  }, [sltUserError]);

  return (
    <div className="AdminAddUser-modal">
      <div className="AdminAddUser-content">
        <div className="AdminAddUser-header">
          <h2>{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose}><IoIosClose size={30} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="AdminAddUser-form-grid">
            <div className="form-left">
              <div>
                <label>Service Number:</label>
                {errors.id && <span className="error-message">{errors.id}</span>}
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  onBlur={handleServiceNumBer}
                  autoComplete="off"
                  required
                  readOnly={isEdit}
                />
                {sltUserLoading && <span>Loading...</span>}
                {sltUserError && <span className="error-message">{sltUserError}</span>}
                {showUserNotFound && (
                  <span className="error-message">User not found in SLT Users. Please enter manually.</span>
                )}
              </div>
              <div>
                <label>Name:</label>
                {errors.name && <span className="error-message">{errors.name}</span>}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  readOnly={isEdit}
                />
              </div>
              <div>
                <label>Email:</label>
                {errors.email && <span className="error-message">{errors.email}</span>}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly={isEdit}
                />
              </div>
              <div>
                <label>Team:</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div>
                <label>Role:</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="technician">Technician</option>
                  <option value="teamLeader">Team Leader</option>
                </select>
              </div>
              <div>
                <label>Tier:</label>
                <select name="tier" value={formData.tier} onChange={handleChange}>
                  <option value="1">Tier1</option>
                  <option value="2">Tier2</option>
                </select>
              </div>
              <div className="form-left-ActiveCheckBox">
                <label>Active:</label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-right">
              <label>Categories :</label>
              <div className="checkbox-list">
                {filteredSubCategories.map(item => (
                  <label key={item.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={item.id}
                      checked={formData.categories.includes(item.id)}
                      onChange={handleCategoryChange}
                    />
                    {item.name}
                  </label>
                ))}
              </div>
              <div className="AdminAddUser-form-submit">
                <button type="submit">{isEdit ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;