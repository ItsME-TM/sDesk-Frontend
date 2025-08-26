/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect, useState, useMemo } from "react";
import "./AdminUserList.css";
import { FaHouseUser, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { TiExportOutline } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";
import socket from "../../../utils/socket.js";

import {
  fetchTechniciansRequest,
  fetchActiveTechniciansRequest,
  createTechnicianRequest,
  deleteTechnicianRequest,
  updateTechnicianRequest,
  forceLogoutTechnicianRequest,
  updateTechnicianOnlineStatus,

} from "../../../redux/technicians/technicianSlice";

import { fetchSubCategoriesRequest } from "../../../redux/categories/categorySlice";
import AdminAddUser from "../../../components/AdminAddUser/AdminAddUser";
import ConfirmPopup from "../../../components/ConfirmPopup/ConfirmPopup";
import { updateUserRoleById } from "../../../redux/sltusers/sltusersService";

function AdminUserList() {
  const dispatch = useDispatch();
  // Use Redux state for technicians
  const technicians = useSelector(
    (state) => state.technicians.technicians ?? []
  );

  const subCategories = useSelector(
    (state) => state.categories?.subCategories ?? []
  );
  const mainCategories = useSelector(
    (state) => state.categories?.mainCategories ?? []
  );

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectShowOption, setSelectShowOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [onlineTechnicians] = useState(new Set());

  useEffect(() => {
    dispatch(fetchSubCategoriesRequest());
    dispatch({ type: "category/fetchMainCategoriesRequest" });

    if (selectShowOption === "Active") {
      dispatch(fetchActiveTechniciansRequest());
    } else {
      dispatch(fetchTechniciansRequest());
    }

    const handleStatusChange = ({ serviceNum, active }) => {
      // 1. Update the online flag in Redux
      dispatch(updateTechnicianOnlineStatus({ serviceNum, active }));

      // 2. Optionally refetch list so we don't rely on old cached data
      dispatch(fetchTechniciansRequest());
    };

    socket.on("technician_status_changed", handleStatusChange);

    return () => {
      socket.off("technician_status_changed", handleStatusChange);
    };
  }, [dispatch, selectShowOption]);

 
  const getTeamName = (teamId) => {
    const main = mainCategories.find((m) => m.id === teamId);
    return main ? main.name : teamId || "Unknown";
  };
  const getTeamId = (teamId) => {
    const main = mainCategories.find((m) => m.id === teamId);
    return main ? main.name : teamId || "Unknown";
  };

  const getSubCategoryName = (subCatId) => {
    const sub = subCategories.find((s) => s.id === subCatId);
    return sub ? sub.name : subCatId || "Unknown";
  };
  const admin = useSelector((state) => state.auth?.user);
  const adminTeamName = admin?.teamName;

  const users = useMemo(
    () =>
      technicians
        .filter((user) => user.team === adminTeamName)

        .map((user) => ({
          email: user.email,
          serviceNum: user.serviceNumber || user.serviceNum || "",
          name: user.name,
          team: getTeamName(user.team),
          teamId: getTeamId(user.teamId),
          tier:user.tier,
          position:user.position,
          cat1: getSubCategoryName(user.cat1),
          cat2: getSubCategoryName(user.cat2),
          cat3: getSubCategoryName(user.cat3),
          cat4: getSubCategoryName(user.cat4),
          active: Boolean(user.active),
          isOnline: user.active,
      
          id: user.id,
        })),
    [technicians, adminTeamName, getTeamName, getTeamId, getSubCategoryName]
  );

  const handleChange = (e) => setSelectShowOption(e.target.value);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleEdit = (serviceNumber) => {
    const user = technicians.find(
      (u) =>
        u.serviceNumber === serviceNumber ||
        u.serviceNum === serviceNumber ||
        u.id === serviceNumber
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
     
      } catch (err) {
      }

      const [cat1, cat2, cat3, cat4] = updatedFields.categories || [];
      dispatch(
        updateTechnicianRequest({
          serviceNum: editUser.serviceNum,
          email: updatedFields.email,
          name: updatedFields.name,
          team: updatedFields.teamName || updatedFields.team,
          active: updatedFields.active,
           position: updatedFields.role,
          teamId: updatedFields.teamId || updatedFields.teamId,
          tier: updatedFields.tier ,
          cat1: cat1 || "",
          cat2: cat2 || "",
          cat3: cat3 || "",
          cat4: cat4 || "",
          contactNumber: updatedFields.contactNumber,
          id: editUser.id,
        })
      );
      const handleDeactivate = (serviceNum) => {
        // Dispatch Redux action that calls backend to force logout + send message
        dispatch(forceLogoutTechnicianRequest(serviceNum));
      };
      // NEW: If technician is being deactivated and is currently online, force logout
      if (
        updatedFields.active === false &&
        onlineTechnicians.has(editUser.serviceNum)
      ) {
        dispatch(
          forceLogoutTechnicianRequest({
            serviceNum: editUser.serviceNum,
            socket,
          })
        );
      }
    }
    setIsEditUserOpen(false);
    setEditUser(null);
  };

  const handleDelete = (serviceNumber) => {
    const user = technicians.find(
      (u) =>
        u.serviceNumber === serviceNumber ||
        u.serviceNum === serviceNumber ||
        u.id === serviceNumber
    );
    if (user) {
      setUserToDelete(user);
      setIsDeletePopupOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const sltServiceNum =
          userToDelete.serviceNum || userToDelete.serviceNumber;
        if (sltServiceNum) {
          await updateUserRoleById(sltServiceNum, "user");
          console.log("Successfully updated SLT user role to user");
        }
      } catch (err) {
        console.warn("Failed to update SLT user role to user:", err);
      }
      dispatch(
        deleteTechnicianRequest(
          userToDelete.serviceNum ||
            userToDelete.serviceNumber ||
            userToDelete.id
        )
      );
      setIsDeletePopupOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeletePopupOpen(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => setIsAddUserOpen(true);

  return (
    <div className="AdminUserList-main-content">
      <div className="AdminUserList-direction-bar">User {">"} User List</div>

      <div className="AdminUserList-content2">
        <div className="AdminUserList-TitleBar">
          <div className="AdminUserList-TitleBar-NameAndIcon">
            <FaHouseUser /> Technicians List
          </div>
          <div className="AdminUserList-TitleBar-buttons">
            <button
              onClick={handleAddUser}
              className="AdminUserList-TitleBar-buttons-AddUser"
            >
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
            <select
              value={selectShowOption}
              onChange={handleChange}
              className="AdminUserList-showSearchBar-Show-select"
            >
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
                <th>Tier</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users
                  .filter((user) => {
                    if (selectShowOption === "Active")
                      return user.active === true;
                    return true;
                  })
                  .filter((user) => {
                    const searchString = searchQuery.toLowerCase();
                    return (
                      (user.email && user.email.toLowerCase().includes(searchString)) ||
                      (user.name && user.name.toLowerCase().includes(searchString)) ||
                      (user.team && user.team.toLowerCase().includes(searchString)) ||
                      (user.serviceNum && user.serviceNum.toLowerCase().includes(searchString)) ||
                      (user.tier && user.tier.toLowerCase().includes(searchString)) ||
                      (user.position && user.role.toLowerCase().includes(searchString))

                    );
                  })
                  .map((user) => (
                    <tr key={user.serviceNum}>
                      <td>{user.serviceNum}</td>
                      <td>{user.name}</td>
                      <td>{user.team}</td>
                      <td>
                        <span
                          style={{
                            height: "10px",
                            width: "10px",
                            backgroundColor: user.isOnline
                              ? "#2de37d"
                              : "#ff4d4d",
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: "5px",
                          }}
                        />
                        {user.active ? "True" : "False"}
                      </td>{" "}
                           <td>{user.tier}</td>




                      <td>{user.position}</td>
                      <td>
                        <button
                          className="AdminUserList-table-edit-btn"
                          onClick={() => handleEdit(user.serviceNum)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="AdminUserList-table-delete-btn"
                          onClick={() => handleDelete(user.serviceNum)}
                        >
                          <FaTrash />
                        </button>
                        {user.active === "True" && (
                          <button
                            className="AdminUserList-table-logout-btn"
                            onClick={() =>
                              handleDeactivate(technician.serviceNum)
                            }
                            title="Force Logout"
                          >
                            Logout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
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
              if (newUser.serviceNum) {
                try {
                  await updateUserRoleById(newUser.serviceNum, newUser.position);
                } catch (err) {}
              }

              const [cat1, cat2, cat3, cat4] = newUser.categories || [];
              dispatch(
                createTechnicianRequest({
                  serviceNum: newUser.serviceNum,
                  email: newUser.email,
                  name: newUser.name,
                  team: newUser.teamName || newUser.team,
                  active: newUser.active,
                  position: newUser.position,
                 tier: newUser.tier ,
                  teamId: newUser.teamId,
                  cat1: cat1 || "",
                  cat2: cat2 || "",
                  cat3: cat3 || "",
                  cat4: cat4 || "",
                  
                  contactNumber: newUser.contactNumber,
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
                updatedUser.serviceNum ||
                updatedUser.serviceNumber ||
                editUser.serviceNum ||
                editUser.serviceNumber;

              if (editUser.active && !updatedUser.active) {
                // Emit socket event to notify technician
                socket.emit("technician-deactivated", {
                  serviceNum,
                  message: "Your account has been deactivated by admin",
                });
              }

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