import React, { useState, useEffect, useRef } from 'react';
import './UpdateStatus.css';
import { FaPlusSquare } from "react-icons/fa";
import CategoryDropdown from '../CategoryDropdown/CategoryDropDown';
import LocationDropdown from '../LocationDropdown/LocationDropdown';

const UpdateStatus = ({
  incidentData,
  usersDataset,
  categoryDataset,
  locationDataset,
  incident,
  onStatusChange,
  loggedInUser // <-- add this prop
}) => {
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const categoryPopupRef = useRef(null);
  const locationPopupRef = useRef(null);

  const [technicians, setTechnicians] = useState([]);
  const [notificationOptions, setNotificationOptions] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState({
    name: incidentData.category || '',
    number: ''
  });

  const [selectedLocation, setSelectedLocation] = useState({
    name: incidentData.location || '',
    number: ''
  });

  const [fileName, setFileName] = useState('No file chosen');
  const [updatedBy, setUpdatedBy] = useState('');
  const [notificationTo, setNotificationTo] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [description, setDescription] = useState('');
  const [notifyUser, setNotifyUser] = useState(false);
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const handleCategorySelect = (selectedCategory) => {
    setSelectedCategory(selectedCategory);
    setIsCategoryPopupOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setSelectedLocation(selectedLocation);
    setIsLocationPopupOpen(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory({ name: '', number: '' });
    setIsCategoryPopupOpen(false);
  };

  const handleClearLocation = () => {
    setSelectedLocation({ name: '', number: '' });
    setIsLocationPopupOpen(false);
  };

  const updateStatusData = () => {
    const data = {
      updatedBy,
      category: selectedCategory.number,
      location: selectedLocation.number,
      transferTo,
      description,
      priority,
      status
    };
    onStatusChange(data);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (categoryPopupRef.current && !categoryPopupRef.current.contains(e.target)) {
        setIsCategoryPopupOpen(false);
      }
      if (locationPopupRef.current && !locationPopupRef.current.contains(e.target)) {
        setIsLocationPopupOpen(false);
      }
    };

    if (isCategoryPopupOpen || isLocationPopupOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCategoryPopupOpen, isLocationPopupOpen]);

  useEffect(() => {
    updateStatusData();
  }, [updatedBy, selectedCategory, selectedLocation, transferTo, description, priority, status]);

  useEffect(() => {
    // Always set Update By to the currently logged-in user's name
    if (loggedInUser && loggedInUser.name) {
      setUpdatedBy(loggedInUser.name);
    } else {
      setUpdatedBy('');
    }
    // Set other fields if incident exists
    if (incident && usersDataset.length > 0 && categoryDataset.length > 0 && locationDataset.length > 0) {
      // Set Status
      setStatus(incident.status || '');

      // Set Priority
      setPriority(incident.priority || '');

      // Set Description
      setDescription(incident.description || '');

      // Set Notification To
      if (incident.urgent_notification_to) {
        const notificationUser = usersDataset.find(user => user.service_number === incident.urgent_notification_to);
        setNotificationTo(notificationUser ? notificationUser.display_name || notificationUser.user_name : incident.urgent_notification_to);
      }

      // Set Transfer To (handler)
      if (incident.handler) {
        const handlerUser = usersDataset.find(user => user.service_number === incident.handler);
        setTransferTo(handlerUser ? handlerUser.service_number : incident.handler); // Keep service_number for transferTo
      }

      // Load technicians
      const filteredTechnicians = usersDataset.filter(user => user.role === 'technician');
      setTechnicians(filteredTechnicians);

      // Load notification options (supervisors and admins)
      const supervisorsAndAdmins = usersDataset
        .filter(user => user.role === 'supervisor' || user.role === 'admin')
        .map(user => user.service_number); // Store service_number, display name in dropdown
      setNotificationOptions(supervisorsAndAdmins);

      // Set category name
      const categoryItem = categoryDataset.find(item => item.grandchild_category_number === incident.category);
      setSelectedCategory({
        name: categoryItem ? categoryItem.grandchild_category_name : incidentData.category || '',
        number: categoryItem ? categoryItem.grandchild_category_number : ''
      });

      // Set location name
      const locationItem = locationDataset.find(item => item.loc_number === incident.location);
      setSelectedLocation({
        name: locationItem ? locationItem.loc_name : incidentData.location || '',
        number: locationItem ? locationItem.loc_number : ''
      });
    }
  }, [incident, usersDataset, categoryDataset, locationDataset, incidentData, loggedInUser]);

  return (
    <div className="update-status-container">
      <div className="update-status-card card">
        <div className="card-body">
          <h5 className="update-status-title">
            Update Status - <span>{incidentData.regNo}</span>
          </h5>

          <div className="form-row">
            <div className="form-group col-md-3">
              <label htmlFor="updateBy">Update By</label>
              <input
                type="text"
                className="form-control"
                id="updateBy"
                value={updatedBy}
                style={{ fontSize: '12px' }}
                readOnly
              />
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="category">
                <FaPlusSquare onClick={() => setIsCategoryPopupOpen(true)} style={{ cursor: 'pointer' }} /> Category
              </label>
              <input
                type="text"
                className="form-control"
                id="category"
                value={selectedCategory.name}
                readOnly
                onClick={() => setIsCategoryPopupOpen(true)}
                style={{ fontSize: '12px' }}
              />
            </div>

            <div className="form-group col-md-2">
              <label htmlFor="location">
                <FaPlusSquare onClick={() => setIsLocationPopupOpen(true)} style={{ cursor: 'pointer' }} /> Location
              </label>
              <input
                type="text"
                className="form-control"
                id="location"
                value={selectedLocation.name}
                readOnly
                onClick={() => setIsLocationPopupOpen(true)}
                style={{ fontSize: '12px' }}
              />
            </div>

            <div className="form-group col-md-2">
              <label htmlFor="notificationTo">Urgent Notification to</label>
              <select
                className="form-control"
                id="notificationTo"
                value={notificationTo}
                onChange={(e) => setNotificationTo(e.target.value)}
              >
                <option value="">Select One</option>
                {notificationOptions.map((serviceNum, index) => {
                  const user = usersDataset.find(u => u.service_number === serviceNum);
                  return user ? (
                    <option key={index} value={serviceNum}>
                      {user.display_name || user.user_name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            <div className="form-group col-md-2">
              <label htmlFor="transferTo">Transfer Incident</label>
              <select
                className="form-control"
                id="transferTo"
                value={transferTo}
                onChange={(e) => {
                  setTransferTo(e.target.value);
                  updateStatusData();
                }}
              >
                <option value="">Select One</option>
                <option value="tier2-auto">Automatically Assign For Tier2</option>
                {technicians.map(technician => (
                  <option key={technician.service_number} value={technician.service_number}>
                    {technician.display_name || technician.user_name}
                  </option>
                ))}
              </select>
              {transferTo === "tier2-auto" && (
                <div style={{ color: '#007bff', fontWeight: 'bold', marginTop: '5px', fontSize: '13px' }}>
                  Automatically Assign For Tier2
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="description" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Description <span className="required">*</span>
                <input
                  type="checkbox"
                  style={{ marginLeft: '10px', marginRight: '5px' }}
                  checked={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.checked)}
                />
                <span className="notify-user">NotifyUser</span>
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  updateStatusData();
                }}
              ></textarea>
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="priority">Priority</label>
              <select
                className="form-control"
                id="priority"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  updateStatusData();
                }}
              >
                <option value="">Select One</option>
                <option value="Critical" className="priority-critical">Critical</option>
                <option value="High" className="priority-high">High</option>
                <option value="Medium" className="priority-medium">Medium</option>
              </select>
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="status">Status</label>
              <select
                className="form-control"
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  updateStatusData();
                }}
              >
                <option value="">Select One</option>
                <option value="Open">Open</option>
                <option value="Hold">Hold</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="file-upload-container col-md-12 mt-3">
              <label htmlFor="fileInput">Attachment</label>
              <div className="file-upload-controls">
                <input
                  type="file"
                  id="fileInput"
                  className="file-input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFileName(file ? file.name : 'No file chosen');
                  }}
                />
                <label htmlFor="fileInput" className="choose-file-button">Choose File</label>
                <span id="fileName" className="file-name">{fileName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCategoryPopupOpen && (
        <div ref={categoryPopupRef}>
          <CategoryDropdown
            onSelect={handleCategorySelect}
            onClose={() => setIsCategoryPopupOpen(false)}
            categoryDataset={categoryDataset}
          />
        </div>
      )}
      {isLocationPopupOpen && (
        <div ref={locationPopupRef}>
          <LocationDropdown
            onSelect={handleLocationSelect}
            onClose={() => setIsLocationPopupOpen(false)}
            locationDataset={locationDataset}
          />
        </div>
      )}
    </div>
  );
};

export default UpdateStatus;