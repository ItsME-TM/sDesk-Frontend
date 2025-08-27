
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByServiceNumberRequest, clearUser } from '../../redux/sltusers/sltusersSlice';
import './AdminAddUser.css';
import { IoIosClose } from 'react-icons/io';
import socket from '../../utils/socket';

const AdminAddUser = ({ onSubmit, onClose, isEdit = false, editUser = null, addTechnicianError }) => {
  // Show error if technician already exists (on submit)
  const showSubmitUserExists =
    addTechnicianError &&
    (
      addTechnicianError.toLowerCase().includes('technician already') 
      
    );
  const dispatch = useDispatch();

  const loggedInUser = useSelector(state => state.auth?.user);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    contactNumber: '',
    teamName: loggedInUser?.teamName || '', 
    position: 'technician',
    tier: 'tier1'||'tier2',
    active: true,
    teamId:loggedInUser?.teamId|| '',
    categories: [
      loggedInUser?.cat1,
      loggedInUser?.cat2,
      loggedInUser?.cat3,
      loggedInUser?.cat4

    ].filter(Boolean), 
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


  // Debounce service number input
 useEffect(() => {
  // Only fetch if formData.id is non-empty and we're NOT in edit mode
  if (!isEdit && formData.id && formData.id.trim()) {
    const handler = setTimeout(() => {
      dispatch(fetchUserByServiceNumberRequest(formData.id.trim()));
    }, 400);
    return () => clearTimeout(handler);
  } else {
    // Clear SLT user only when not editing and id is empty
    if (!isEdit) {
      dispatch(clearUser());
    }
  }
}, [formData.id, dispatch, isEdit]);


  // When SLT user is fetched
  useEffect(() => {
    if (sltUser) {
      setFormData(prev => ({
        ...prev,
        name: sltUser.display_name || '',
        email: sltUser.email || '',
        id: sltUser.serviceNum || '',
        contactNumber: sltUser.contactNumber || '',
      }));
    }
  }, [sltUser]);

  useEffect(() => {
    if (!sltUser) {
      setFormData(prev => ({ ...prev, name: '', email: '' }));
    }
  }, [sltUser]);

  useEffect(() => {
    if (isEdit && editUser) {
      // When opening in edit mode, clear any lingering user data from the SLT user slice.
      // This prevents stale data from appearing in the name/email fields.
      dispatch(clearUser());

      // When editing, completely re-initialize the form data from the editUser prop.
      // This prevents stale state from a previous user from persisting.
      setFormData({
        id: editUser.serviceNum || editUser.serviceNumber || editUser.id || '',
        name: editUser.name || '',
        email: editUser.email || '',
        contactNumber: editUser.contactNumber || '',
        teamName: loggedInUser?.teamName || '',
        tier: editUser.tier|| 'tier1'||'tier2',
        position: editUser.position|| 'technician'||'teamLeader',
        active: editUser.active !== undefined ? editUser.active : true,
        teamId: loggedInUser?.teamId || '',
        categories: editUser.categories || [editUser.cat1, editUser.cat2, editUser.cat3, editUser.cat4].filter(Boolean),
      });
    }
  }, [isEdit, editUser, loggedInUser, dispatch]);

  // Reset formData to initial state (with teamName) every time the modal is opened in add mode
  useEffect(() => {
    if (!isEdit) {
      setFormData({
        id: '',
        name: '',
        email: '',
        teamId: loggedInUser?.teamId || '',
        teamName: loggedInUser?.teamName || '',
        role: 'technician',
        tier: '1',
        active: true,
        categories: [],
      });
      setErrors({});
   dispatch(clearUser());  
  }
}, [isEdit, loggedInUser, dispatch]);

  

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
    const selected = new Set(formData.categories);
  
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      if (selected.size < 4) {
        selected.add(value);
      } else {
        setErrors(prev => ({ ...prev, categories: 'Can assign only up to 4 categories' }));
      }
    }
  
    setFormData(prev => ({ ...prev, categories: Array.from(selected) }));
  
    if (errors.categories && selected.size > 0 && selected.size <= 4) {
      setErrors(prev => ({ ...prev, categories: undefined }));
    }
  };


const selectedCategories = formData.categories || [];
const handleSubmit = e => {
  e.preventDefault();
  const newErrors = {};
  // Always validate against the displayed (fetched) values
  const nameToUse = sltUser ? (sltUser.display_name || '') : formData.name;
  const emailToUse = sltUser ? (sltUser.email || '') : formData.email;
  if (!formData.id) newErrors.id = 'Service Number is required';
  if (!emailToUse) newErrors.email = 'Email is required';
  if (!nameToUse) newErrors.name = 'Name is required';
  if (!formData.teamName) newErrors.teamName = 'Team is required';
  if (formData.categories.length === 0) {
    newErrors.categories = 'Select at least one category';
  } else if (formData.categories.length > 4) {
    newErrors.categories = 'Can assign only up to 4 categories';
  }
  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  const payload = {
    serviceNum: formData.id,
    email: emailToUse,
    name: nameToUse,
    teamId: formData.teamId,
    team: formData.teamName,
    tier: Number(formData.tier),
    active: formData.active,
    cat1: formData.categories[0] || '',
    cat2: formData.categories[1] || '',
    cat3: formData.categories[2] || '',
    cat4: formData.categories[3] || '',
   position: formData.position,
    contactNumber: formData.contactNumber,
    
    
    isEdit,
  };

  // If editing and changing active status to false
  if (isEdit && editUser?.active && !formData.active) {
    socket.emit('admin-deactivate-technician', {
      serviceNum: formData.id,
      message: 'You have been deactivated by admin'
    });
  }

  onSubmit(payload);
};

  const showUserNotFound =
    formData.id &&
    !sltUserLoading &&
    (!sltUser || (sltUserError && sltUserError.toLowerCase().includes('not found')));

useEffect(() => {
  if (sltUserError?.includes('not found')) {
    setErrors(prev => ({ ...prev, id: 'User not found. Please enter manually.' }));
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
                  autoComplete="off"
                  required
                  readOnly={isEdit}
                />
                {/* Show 'User Found' or 'User Not Found' message */}
                {!isEdit && sltUser && !sltUserLoading && !sltUserError && (
                  <span className="success-message message-margin">User Found</span>
                )}
                {!isEdit && showUserNotFound && (
                  <span className="error-message message-margin">User Not Found</span>
                )}
              </div>
              <div>
                <label>Name:</label>
                {errors.name && <span className="error-message">{errors.name}</span>}
                <input
                  type="text"
                  name="name"
                  value={sltUser ? (sltUser.display_name || '') : formData.name}
                  onChange={handleChange}
                  required
                  readOnly={!!sltUser || isEdit}
                />
              </div>
              <div>
                <label>Email:</label>
                {errors.email && <span className="error-message">{errors.email}</span>}
                <input
                  type="email"
                  name="email"
                  value={sltUser ? (sltUser.email || '') : formData.email}
                  onChange={handleChange}
                  required
                  readOnly={!!sltUser || isEdit}
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
                <label>Position:</label>
                <select name="position" value={formData.position} onChange={handleChange}>
                  <option value="technician">Technician</option>
                  <option value="teamLeader">Team Leader</option>
                </select>
              </div>
              <div>
                <label>Tier:</label>
                 <select name="tier" value={formData.tier} onChange={handleChange}>
  <option value="tier1">Tier1</option>
  <option value="tier2">Tier2</option>
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
              {errors.categories && <span className="error-message">{errors.categories}</span>}
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
                {showSubmitUserExists && (
                  <span className="error-message message-margin">Technician already exists</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;