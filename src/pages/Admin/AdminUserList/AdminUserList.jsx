import React, { useEffect, useState, useMemo } from 'react';
import './AdminUserList.css';
import { FaHouseUser, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { TiExportOutline } from 'react-icons/ti';
import { useSelector, useDispatch } from 'react-redux';

import {
  fetchTechniciansRequest,
  fetchActiveTechniciansRequest,
  createTechnicianRequest,
  deleteTechnicianRequest,
  updateTechnicianRequest,
} from '../../../redux/technicians/technicianSlice';

import { fetchSubCategoriesRequest } from '../../../redux/categories/categorySlice';
import AdminAddUser from '../../../components/AdminAddUser/AdminAddUser';
import ConfirmPopup from '../../../components/ConfirmPopup/ConfirmPopup';
import { updateUserRoleById } from '../../../redux/sltusers/sltusersService';

function AdminUserList() {
  const dispatch = useDispatch();

  const technicians = useSelector((state) => state.technicians?.technicians ?? []);
  const subCategories = useSelector((state) => state.categories?.subCategories ?? []);
  const mainCategories = useSelector((state) => state.categories?.mainCategories ?? []);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectShowOption, setSelectShowOption] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    console.log('Selection changed:', selectShowOption);
    dispatch(fetchSubCategoriesRequest());
    dispatch({ type: 'category/fetchMainCategoriesRequest' });

    if (selectShowOption === 'Active') {
      dispatch(fetchActiveTechniciansRequest());
    } else {
      dispatch(fetchTechniciansRequest());
    }
  }, [dispatch, selectShowOption]);

  const getTeamName = (teamId) => {
    const main = mainCategories.find((m) => m.id === teamId);
    return main ? main.name : teamId || 'Unknown';
  };

  const getSubCategoryName = (subCatId) => {
    const sub = subCategories.find((s) => s.id === subCatId);
    return sub ? sub.name : subCatId || 'Unknown';
  };

  const users = useMemo(
    () =>
      technicians.map((user) => ({
        email: user.email,
        serviceNum: user.serviceNumber || user.serviceNum || '',
        name: user.name,
        team: getTeamName(user.team),
        cat1: getSubCategoryName(user.cat1),
        cat2: getSubCategoryName(user.cat2),
        cat3: getSubCategoryName(user.cat3),
        cat4: getSubCategoryName(user.cat4),
        active: user.active ? 'True' : 'False',
        level: user.level || '',
        id: user.id,
      })),
    [technicians, mainCategories, subCategories]
  );

  const handleChange = (e) => setSelectShowOption(e.target.value);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleEdit = (serviceNumber) => {
    const user = technicians.find(
      (u) => u.serviceNumber === serviceNumber || u.serviceNum === serviceNumber || u.id === serviceNumber
    );
    if (user) {
      setEditUser(user);
      setIsEditUserOpen(true);
    }
  };

  const confirmEdit = async (newRole, updatedFields) => {
    if (editUser) {
      try {
        await updateUserRoleById(editUser.serviceNum, newRole);
        console.log('Successfully updated SLT user role');
      } catch (err) {
        console.warn('Failed to update SLT user role:', err);
        // Continue with technician update even if role update fails
      }
      
      const [cat1, cat2, cat3, cat4] = updatedFields.categories || [];
      dispatch(
        updateTechnicianRequest({
          serviceNum: editUser.serviceNum,
          email: updatedFields.email,
          name: updatedFields.name,
          team: updatedFields.teamName || updatedFields.team,
          active: updatedFields.active,
          tier: Number(updatedFields.tier),
          teamLevel: updatedFields.tier === '1' ? 'Tier1' : 'Tier2',
          level: updatedFields.tier === '1' ? 'Tier1' : 'Tier2',
          cat1: cat1 || '',
          cat2: cat2 || '',
          cat3: cat3 || '',
          cat4: cat4 || '',
          rr: 1,
          designation: 'Technician',
          contactNumber: '0000000000',
          id: editUser.id,
        })
      );
    }
    setIsEditUserOpen(false);
    setEditUser(null);
  };

  const handleDelete = (serviceNumber) => {
    const user = technicians.find(
      (u) => u.serviceNumber === serviceNumber || u.serviceNum === serviceNumber || u.id === serviceNumber
    );
    if (user) {
      setUserToDelete(user);
      setIsDeletePopupOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await updateUserRoleById(userToDelete.id, 'user');
        console.log('Successfully updated SLT user role to user');
      } catch (err) {
        console.warn('Failed to update SLT user role to user:', err);
        // Continue with technician deletion even if role update fails
      }
      
      dispatch(deleteTechnicianRequest(userToDelete.serviceNum || userToDelete.id));
      setIsDeletePopupOpen(false);
      setUserToDelete(null);
      dispatch(fetchTechniciansRequest());
    }
  };

  const cancelDelete = () => {
    setIsDeletePopupOpen(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => setIsAddUserOpen(true);

  return (
    <div className="AdminUserList-main-content">
      <div className="AdminUserList-direction-bar">User {'>'} User List</div>

      <div className="AdminUserList-content2">
        <div className="AdminUserList-TitleBar">
          <div className="AdminUserList-TitleBar-NameAndIcon">
            <FaHouseUser /> Technicians List
          </div>
          <div className="AdminUserList-TitleBar-buttons">
            <button onClick={handleAddUser} className="AdminUserList-TitleBar-buttons-AddUser">
              <IoIosAddCircleOutline /> Add Technician
            </button>
            <button className="AdminUserList-TitleBar-buttons-ExportData">
              <TiExportOutline /> Export Data
            </button>
          </div>
        </div>

        <div className="AdminUserList-showSearchBar">
          <div className="AdminUserList-showSearchBar-Show">
            Show
            <select value={selectShowOption} onChange={handleChange} className="AdminUserList-showSearchBar-Show-select">
              <option value="All">All</option>
              <option value="Active">Active</option>
            </select>
          </div>
          <div className="AdminUserList-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="AdminUserList-showSearchBar-SearchBar-input"
            />
          </div>
        </div>

        <div className="AdminUserList-table">
          <table>
            <thead>
              <tr>
                <th>Service Number</th>
                <th>Name</th>
                <th>Team</th>
                <th>Active</th>
                <th>Level</th>
                <th>Option</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users
                  .filter((user) => {
                    if (selectShowOption === 'Active') return user.active === 'True';
                    return true;
                  })
                  .filter(
                    (user) =>
                      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.team.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.serviceNum}>
                      <td>{user.serviceNum}</td>
                      <td>{user.name}</td>
                      <td>{user.team}</td>
                      <td>{user.active}</td>
                      <td>{user.level}</td>
                      <td>
                        <button className="AdminUserList-table-edit-btn" onClick={() => handleEdit(user.serviceNum)}>
                          <FaEdit />
                        </button>
                        <button className="AdminUserList-table-delete-btn" onClick={() => handleDelete(user.serviceNum)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddUserOpen && (
        <AdminAddUser
          onClose={() => setIsAddUserOpen(false)}
          onSubmit={async (newUser) => {
            if (!newUser.isEdit) {
              // Try to update SLT user role first
              if (newUser.serviceNum) {
                try {
                  await updateUserRoleById(newUser.serviceNum, 'technician');
                  console.log('Successfully updated SLT user role to technician');
                } catch (err) {
                  console.warn('Failed to update SLT user role (this may be normal if user does not exist in SLT Users table):', err);
                  // Continue with technician creation even if role update fails
                }
              }

              const [cat1, cat2, cat3, cat4] = newUser.categories || [];
              dispatch(
                createTechnicianRequest({
                  serviceNum: newUser.serviceNum,
                  email: newUser.email,
                  name: newUser.name,
                  team: newUser.teamName || newUser.team,
                  active: newUser.active,
                  tier: Number(newUser.tier),
                  level: Number(newUser.tier) === 1 ? 'Tier1' : 'Tier2',
                  teamLevel: 'Default',
                  cat1: cat1 || '',
                  cat2: cat2 || '',
                  cat3: cat3 || '',
                  cat4: cat4 || '',
                  rr: 1,
                  designation: 'Technician',
                  contactNumber: '0000000000',
                  teamLeader: newUser.teamLeader ?? false,
                  assignAfterSignOff: newUser.assignAfterSignOff ?? false,
                  permanentMember: newUser.permanentMember ?? false,
                  subrootUser: newUser.subrootUser ?? false,
                })
              );
              dispatch(fetchTechniciansRequest());
            }
            setIsAddUserOpen(false);
          }}
        />
      )}

      {isEditUserOpen && (
        <AdminAddUser
          isEdit
          editUser={editUser}
          onClose={() => setIsEditUserOpen(false)}
          onSubmit={async (updatedUser) => {
            if (updatedUser.isEdit) {
              const serviceNum =
                updatedUser.serviceNum || updatedUser.serviceNumber || editUser.serviceNum || editUser.serviceNumber;
              dispatch(updateTechnicianRequest({ ...updatedUser, serviceNum }));
              dispatch(fetchTechniciansRequest());
            }
            setIsEditUserOpen(false);
          }}
        />
      )}

      {isDeletePopupOpen && (
        <ConfirmPopup
          message={`Are you sure you want to delete the user ${userToDelete?.name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default AdminUserList;
