import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./AdminLocation.css";
import { FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import {
  fetchLocationsRequest,
  createLocationRequest,
  updateLocationRequest,
  deleteLocationRequest,
} from "../../../redux/location/locationSlice";
import AdminAddLocation from "../../../components/AdminAddLocation/AdminAddLocation";
import ConfirmPopup from "../../../components/ConfirmPopup/ConfirmPopup";

const AdminLocation = () => {
  const dispatch = useDispatch();
  const {
    locations = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.location || {});


  useEffect(() => {
    dispatch(fetchLocationsRequest());
  }, [dispatch]);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEdit = (location) => {
    setEditLocation(location);
    setIsEditLocationOpen(true);
  };

  const handleDelete = (location) => {
    setDeleteTarget(location);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteLocationRequest(deleteTarget.id));
    }
    setIsDeletePopupOpen(false);
    setDeleteTarget(null);
  };

  const handleAddLocation = () => {
    setIsAddLocationOpen(true);
  };

  const handleAddLocationSubmit = (newLocation) => {
    dispatch(createLocationRequest(newLocation));
    setIsAddLocationOpen(false);
  };

  const handleEditLocationSubmit = (updatedLocation) => {
    dispatch(
      updateLocationRequest({
        id: editLocation.id,
        data: updatedLocation,
      })
    );
    setIsEditLocationOpen(false);
  };

  if (loading) return <div>Loading locations...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
    <div className="AdminLocation-main-content">
      <div className="AdminLocation-direction-bar">Location List</div>
      <div className="AdminLocation-content2">
        <div className="AdminLocation-TitleBar">
          <div className="AdminLocation-TitleBar-NameAndIcon">
            <FaMapMarkerAlt size={20} />
            Location List ({locations.length})
          </div>
          <div className="AdminLocation-TitleBar-buttons">
            <button
              className="AdminLocation-TitleBar-buttons-AddUser"
              onClick={handleAddLocation}
            >
              <IoIosAddCircleOutline />
              Add Location
            </button>
          </div>
        </div>

        <div className="AdminLocation-table">
          <table>
            <thead>
              <tr>
               {/* <th>Location Code</th> */}
                <th>Location Name</th>
                <th>Region</th>
                <th>Province</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <tr key={location.id}>
                   {/* <td>{location.locationCode}</td> */}
                    <td>{location.locationName}</td>
                    <td>{location.region}</td>
                    <td>{location.province}</td>
                    <td className="AdminLocation-actions-cell">
                      <div className="AdminLocation-actions-container">
                        <button
                          className="AdminLocation-action-btn AdminLocation-edit-btn"
                          onClick={() => handleEdit(location)}
                          title="Edit Location"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="AdminLocation-action-btn AdminLocation-delete-btn"
                          onClick={() => handleDelete(location)}
                          title="Delete Location"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No locations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddLocationOpen && (
        <AdminAddLocation
          onClose={() => setIsAddLocationOpen(false)}
          onSubmit={handleAddLocationSubmit}
        />
      )}

      {isEditLocationOpen && (
        <AdminAddLocation
          isEdit
          editLocation={editLocation}
          onClose={() => setIsEditLocationOpen(false)}
          onSubmit={handleEditLocationSubmit}
        />
      )}

      {isDeletePopupOpen && (
        <ConfirmPopup
          message={`Are you sure you want to delete "${deleteTarget?.locationName}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeletePopupOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLocation;
