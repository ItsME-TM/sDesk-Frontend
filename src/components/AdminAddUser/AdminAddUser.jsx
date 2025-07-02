import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategoriesRequest } from '../../redux/categories/categorySlice';
import { fetchUserByServiceNumberRequest, clearUser } from '../../redux/sltusers/sltusersSlice';
import { fetchTeamAdminByServiceNumber } from '../../redux/teamAdmin/teamAdminService';
import './AdminAddUser.css';
import { IoIosClose } from 'react-icons/io';


const AdminAddUser = ({ onSubmit, onClose, isEdit = false, editUser = null }) => {
  // Store current admin's teamName in state
  const [currentAdminTeamName, setCurrentAdminTeamName] = useState('');
  // Store the current teamId from team_admins lookup
  const [currentTeamId, setCurrentTeamId] = useState('');
  const dispatch = useDispatch();

  // Categories for teams from Redux
  const mainCategories = useSelector(state => state.categories.mainCategories || []);

  // SLT user fetched by service number
  const sltUser = useSelector(state => state.sltusers.user);
  const sltUserLoading = useSelector(state => state.sltusers.loading);
  const sltUserError = useSelector(state => state.sltusers.error);

  // Use only loggedInUser from Redux auth slice
  const loggedInUser = useSelector(state => state.auth?.user);
  // Use serviceNum from loggedInUser for team lookup if available
  const currentAdminServiceNumber = loggedInUser?.serviceNum || loggedInUser?.id || '';

  // On mount, set teamName directly from loggedInUser's serviceNum if available
  useEffect(() => {
    if (loggedInUser && (loggedInUser.serviceNum || loggedInUser.id)) {
      fetchTeamAdminByServiceNumber(currentAdminServiceNumber)
        .then(response => {
          if (response && response.data && response.data.teamName) {
            setCurrentAdminTeamName(response.data.teamName);
            setFormData(prev => ({ ...prev, teamName: response.data.teamName }));
          } else if (response && response.teamName) {
            setCurrentAdminTeamName(response.teamName);
            setFormData(prev => ({ ...prev, teamName: response.teamName }));
          } else {
            console.warn('Team admin found but no teamName in response');
            setCurrentAdminTeamName('');
            setFormData(prev => ({ ...prev, teamName: '' }));
          }
        })
        .catch((err) => {
          // Handle 404 gracefully - admin may not be in team_admins table yet
          if (err.response && err.response.status === 404) {
            console.warn(`Team admin not found for service number ${currentAdminServiceNumber}. This is normal if the user is not a team admin.`);
          } else {
            console.error('Error fetching team admin:', err);
          }
          setCurrentAdminTeamName('');
          setFormData(prev => ({ ...prev, teamName: '' }));
        });
    }
  }, [loggedInUser, currentAdminServiceNumber]);

  // Form state
  const [formData, setFormData] = useState({
    id: '',        // service number field
    name: '',
    email: '',
    teamName: '',
    role: 'technician',
    tier: '1',
    active: '',
    categories: [],
  });
  const [errors, setErrors] = useState({});

  // Load teams (categories)
  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
  }, [dispatch]);

  // If editing existing user, populate form
  useEffect(() => {
    if (isEdit && editUser) {
      setFormData({
        id: editUser.serviceNum || editUser.serviceNumber || editUser.id || '',
        name: editUser.name || '',
        email: editUser.email || '',
        teamName: editUser.teamName || editUser.team || '',
        categories: editUser.categories || [editUser.cat1, editUser.cat2, editUser.cat3, editUser.cat4].filter(Boolean),
        tier: editUser.tier?.toString() || '1',
        role: editUser.role || 'technician',
        active: editUser.active !== undefined ? editUser.active : true,
      });
    }
  }, [isEdit, editUser]);

  // When sltUser is loaded by service number, auto-fill form name and email only (not team)
  useEffect(() => {
    if (sltUser) {
      setFormData(prev => ({
        ...prev,
        name: sltUser.display_name || '',
        email: sltUser.email || '',
        id: sltUser.serviceNum || '', // Use id field for service number in form
        // teamName is NOT set here, only set from admin info
      }));
    }
  }, [sltUser, currentAdminTeamName]);

  // Clear form user if user is cleared in redux
  useEffect(() => {
    if (!sltUser) {
      setFormData(prev => ({ ...prev, name: '', email: '' }));
    }
  }, [sltUser]);

  // Get current admin's teamName from TeamAdmin API
  useEffect(() => {
    async function fetchAdminTeam() {
      if (currentAdminServiceNumber) {
        try {
          const response = await fetchTeamAdminByServiceNumber(currentAdminServiceNumber);
          if (response && response.data && response.data.teamName) {
            setCurrentAdminTeamName(response.data.teamName);
            setFormData(prev => ({ ...prev, teamName: response.data.teamName }));
          } else if (response && response.teamName) {
            setCurrentAdminTeamName(response.teamName);
            setFormData(prev => ({ ...prev, teamName: response.teamName }));
          }
        } catch (err) {
          // Handle 404 gracefully - admin may not be in team_admins table
          if (err.response && err.response.status === 404) {
            console.warn(`Team admin not found for service number ${currentAdminServiceNumber}`);
          } else {
            console.error('Error fetching team admin:', err);
          }
        }
      }
    }
    fetchAdminTeam();
  }, [currentAdminServiceNumber]);
  const handleServiceNumBer = () => {
    if (formData.id && formData.id.trim() !== '') {
      dispatch(fetchUserByServiceNumberRequest(formData.id.trim()));
    } else {
      dispatch(clearUser());
    }
  };

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
    // Always include only serviceNum (not id) in the payload for backend compatibility
    const payload = {
      serviceNum: formData.id,
      email: formData.email,
      name: formData.name,
      team: formData.teamName, // if your backend expects teamId, map it here
      // role is not needed for backend DTO, remove if not used elsewhere
      tier: Number(formData.tier), // ensure number
      active: formData.active,
      cat1: formData.categories[0] || '',
      cat2: formData.categories[1] || '',
      cat3: formData.categories[2] || '',
      cat4: formData.categories[3] || '',
      level: Number(formData.tier) === 1 ? 'Tier1' : 'Tier2',
      rr: 1,
      designation: 'Technician',
      contactNumber: '0000000000',
      teamLevel: 'Default', // TODO: set appropriately if needed
      teamLeader: formData.teamLeader ?? false,
      assignAfterSignOff: formData.assignAfterSignOff ?? false,
      permanentMember: formData.permanentMember ?? false,
      subrootUser: formData.subrootUser ?? false,
      isEdit, // <-- add this line to indicate edit mode
    };
    onSubmit(payload);
  };


  // Update teamId when teamName is auto-filled (from team_admins lookup)
  useEffect(() => {
    const teamMainCategory = mainCategories.find(cat => cat.name === formData.teamName);
    if (teamMainCategory) {
      setCurrentTeamId(teamMainCategory.id);
    } else {
      setCurrentTeamId('');
    }
  }, [formData.teamName, mainCategories]);

  // Memoized subcategories for the selected team (main category) by teamId
  const filteredSubCategories = useMemo(() => {
    const team = mainCategories.find(cat => cat.id === currentTeamId);
    return team && Array.isArray(team.subCategories) ? team.subCategories : [];
  }, [mainCategories, currentTeamId]);

  // Show user not found if service number entered, not loading, no user, and no error
  const showUserNotFound = formData.id && !sltUserLoading && !sltUser && !sltUserError;

  // Handle team admin lookup errors gracefully
  useEffect(() => {
    if (sltUserError && sltUserError.includes('not found')) {
      // Show a warning for user not found in SLT Users table
      console.warn('SLT User not found for this service number. User can enter details manually.');
    }
  }, [sltUserError]);

  return (
    <div className="AdminAddUser-modal">
      <div className="AdminAddUser-content">
        <div className="AdminAddUser-header">
          <h2>{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose}>
            <IoIosClose size={30} />
          </button>
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
                />
                {sltUserLoading && <span>Loading...</span>}
                {sltUserError && <span className="error-message">{sltUserError}</span>}
                {showUserNotFound && (
                  <span className="error-message">User not found in SLT Users. Please enter details manually.</span>
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
                />
              </div>
              <div>
                <label>Team:</label>
                {errors.teamName && <span className="error-message">{errors.teamName}</span>}
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  readOnly
                  placeholder="Auto-filled from service number"
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
              <label>Categories (select up to 4):</label>
              {errors.categories && <span className="error-message">{errors.categories}</span>}
              <div className="checkbox-list">
                {filteredSubCategories.map(item => (
                  <label key={item.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={item.id}
                      checked={formData.categories.includes(item.id)}
                      onChange={handleCategoryChange}
                      disabled={
                        !formData.categories.includes(item.id) &&
                        formData.categories.length >= 4
                      }
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
