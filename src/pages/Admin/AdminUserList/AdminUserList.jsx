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
  checkTechnicianStatusRequest,
} from "../../../redux/technicians/technicianSlice";

import { fetchSubCategoriesRequest } from "../../../redux/categories/categorySlice";
import AdminAddUser from "../../../components/AdminAddUser/AdminAddUser";
import ConfirmPopup from "../../../components/ConfirmPopup/ConfirmPopup";
import { updateUserRoleById } from "../../../redux/sltusers/sltusersService";

function AdminUserList() {
  const dispatch = useDispatch();

  const technicians = useSelector(
    (state) => state.technicians?.technicians ?? []
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
  const [onlineTechnicians, setOnlineTechnicians] = useState(new Set());

  useEffect(() => {
    console.log("Selection changed:", selectShowOption);
    dispatch(fetchSubCategoriesRequest());
    dispatch({ type: "category/fetchMainCategoriesRequest" });

    if (selectShowOption === "Active") {
      dispatch(fetchActiveTechniciansRequest());
    } else {
      dispatch(fetchTechniciansRequest());
    }
  }, [dispatch, selectShowOption]);
  useEffect(() => {
    dispatch(checkTechnicianStatusRequest());

    const interval = setInterval(() => {
      dispatch(checkTechnicianStatusRequest());
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleTechnicianForceLoggedOut = (data) => {
    console.log("[AdminUserList] Technician was force logged out:", data);
    setOnlineTechnicians((prev) => {
      const newSet = new Set(prev);
      newSet.delete(data.serviceNum);
      return newSet;
    });
    dispatch(
      updateTechnicianOnlineStatus({
        serviceNum: data.serviceNum,
        active: "False",
      })
    );
  };

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
  const adminTeamName = admin?.teamName; // ✅ Use `teamId` from admin object

  const users = useMemo(
    () =>
      technicians
        .filter((user) => user.team === adminTeamName)
        // <-- filter by admin's team
        .map((user) => ({
          email: user.email,
          serviceNum: user.serviceNumber || user.serviceNum || "",
          name: user.name,
          team: getTeamName(user.team),
          teamId: getTeamId(user.teamId),
          cat1: getSubCategoryName(user.cat1),
          cat2: getSubCategoryName(user.cat2),
          cat3: getSubCategoryName(user.cat3),
          cat4: getSubCategoryName(user.cat4),
          active: user.active ? "True" : "False",
          isOnline: onlineTechnicians.has(
            user.serviceNumber || user.serviceNum
          ),
          level: user.level || "",
          id: user.id,
        })),
    [technicians, mainCategories, subCategories, onlineTechnicians]
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
        console.log("Successfully updated SLT user role");
      } catch (err) {
        console.warn("Failed to update SLT user role:", err);
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
          teamId: updatedFields.teamId || updatedFields.teamId,
          level: updatedFields.tier === "1" ? "Tier1" : "Tier2",
          cat1: cat1 || "",
          cat2: cat2 || "",
          cat3: cat3 || "",
          cat4: cat4 || "",
          rr: 1,
          designation: "Technician",
          contactNumber: "0000000000",
          id: editUser.id,
        })
      );

      // NEW: If technician is being deactivated and is currently online, force logout
      if (
        updatedFields.active === alse &&
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

  // NEW: Handle force logout technician
  const handleForceLogout = (serviceNum) => {
    const user = technicians.find(
      (u) => u.serviceNumber === serviceNum || u.serviceNum === serviceNum
    );
    if (user && user.active) {
      if (
        window.confirm(`Are you sure you want to force logout ${user.name}?`)
      ) {
        dispatch(forceLogoutTechnicianRequest({ serviceNum, socket }));
      }
    }
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
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users
                  .filter((user) => {
                    if (selectShowOption === "Active")
                      return user.active === "True";
                    return true;
                  })
                  .filter(
                    (user) =>
                      user.email
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      user.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      user.team
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.serviceNum}>
                      <td>{user.serviceNum}</td>
                      <td>{user.name}</td>
                      <td>{user.team}</td>
                      <td>{user.active}</td>
                      <td>{user.level}</td>
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
                            onClick={() => handleForceLogout(user.serviceNum)}
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
                  await updateUserRoleById(newUser.serviceNum, "technician");
                  console.log(
                    "Successfully updated SLT user role to technician"
                  );
                } catch (err) {
                  console.warn("Failed to update SLT user role:", err);
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
                  level: Number(newUser.tier) === 1 ? "Tier1" : "Tier2",
                  teamId: newUser.teamId ,
                  cat1: newUser.cat1 || "",
                  cat2: newUser.cat2 || "",
                  cat3: newUser.cat3 || "",
                  cat4: newUser.cat4 || "",
                  rr: 1,
                  designation: "Technician",
                  contactNumber: "0000000000",
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
