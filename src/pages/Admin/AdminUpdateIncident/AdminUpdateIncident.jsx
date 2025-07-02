import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminUpdateIncident.css';
import { IoIosArrowForward } from 'react-icons/io';
import UpdateStatus from '../../../components/UpdateStatus/UpdateStatus';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';
import { sDesk_t2_location_dataset } from '../../../data/sDesk_t2_location_dataset';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';

const AdminUpdateIncident = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceNo: '',
    tpNumber: '',
    name: '',
    designation: '',
    email: '',
  });

  const [incidentDetails, setIncidentDetails] = useState({
    refNo: '',
    category: '',
    location: '',
    priority: '',
    status: '',
    assignedTo: '',
    updateBy: '',
    updatedOn: '',
    comments: ''
  });

  const [incident, setIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [updateStatusData, setUpdateStatusData] = useState({
    updatedBy: '',
    category: '',
    location: '',
    transferTo: '',
    description: '',
    priority: '',
    status: '',
  });

  const getUserName = (serviceNumber) => {
    const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
    return user ? user.user_name : serviceNumber;
  };

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }

    if (location.state?.incidentDetails) {
      const details = location.state.incidentDetails;
      const fullIncident = sDesk_t2_incidents_dataset.find(
        inc => inc.incident_number === details.refNo
      );

      if (fullIncident) {
        // Map dataset fields to display fields
        setIncidentDetails({
          refNo: details.refNo,
          category: details.category,
          location: details.location,
          priority: fullIncident.priority || details.priority,
          status: fullIncident.status || 'Open',
          assignedTo: getUserName(fullIncident.handler) || 'Unassigned',
          updateBy: getUserName(fullIncident.update_by) || 'System',
          updatedOn: fullIncident.update_on || new Date().toLocaleString(),
          comments: fullIncident.description || 'No comments'
        });

        // Set the full incident data
        setIncident({
          ...fullIncident,
          update_by: fullIncident.update_by || '123',
          status: fullIncident.status || 'Open',
        });

        // Prepare history data if available
        if (fullIncident.history) {
          setHistoryData(fullIncident.history.map(item => ({
            assignedTo: getUserName(item.handler) || 'Unassigned',
            updatedBy: getUserName(item.update_by) || 'System',
            updatedOn: item.update_on || new Date().toLocaleString(),
            status: item.status || 'Pending',
            comments: item.description || 'No comments'
          })));
        } else {
          // If no history, use current incident as the only history entry
          setHistoryData([{
            assignedTo: getUserName(fullIncident.handler) || 'Unassigned',
            updatedBy: getUserName(fullIncident.update_by) || 'System',
            updatedOn: fullIncident.update_on || new Date().toLocaleString(),
            status: fullIncident.status || 'Pending',
            comments: fullIncident.description || 'No comments'
          }]);
        }
      } else {
        setIncidentDetails({
          ...details,
          assignedTo: getUserName(details.assignedTo) || details.assignedTo,
          updateBy: getUserName(details.updateBy) || details.updateBy,
          status: 'Open'
        });
        setIncident({
          incident_number: details.refNo,
          category: details.category,
          location: details.location,
          priority: details.priority,
          update_by: '123',
          status: 'Open',
          description: '',
          urgent_notification_to: '',
        });
      }
    }
    setIsLoading(false);
  }, [location.state]);

  const handleUpdateStatusChange = (data) => {
    setUpdateStatusData(data);
  };

  const handleUpdateClick = () => {
    const currentDate = new Date().toLocaleString();

    const newHistoryEntry = {
      assignedTo: getUserName(updateStatusData.transferTo) || 'Not Assigned',
      updatedBy: getUserName(updateStatusData.updatedBy) || updateStatusData.updatedBy,
      updatedOn: currentDate,
      status: updateStatusData.status || 'Open',
      comments: updateStatusData.description || 'No comments'
    };

    const updatedHistory = [...historyData, newHistoryEntry];
    setHistoryData(updatedHistory);

    // Update incident details with new values
    setIncidentDetails(prev => ({
      ...prev,
      category: updateStatusData.category || prev.category,
      location: updateStatusData.location || prev.location,
      priority: updateStatusData.priority || prev.priority,
      status: updateStatusData.status || prev.status,
      assignedTo: getUserName(updateStatusData.transferTo) || prev.assignedTo,
      updateBy: getUserName(updateStatusData.updatedBy) || prev.updateBy,
      updatedOn: currentDate,
      comments: updateStatusData.description || prev.comments
    }));

    // Update the incident object
    if (incident) {
      setIncident(prev => ({
        ...prev,
        category: updateStatusData.category || prev.category,
        location: updateStatusData.location || prev.location,
        priority: updateStatusData.priority || prev.priority,
        status: updateStatusData.status || prev.status,
        handler: updateStatusData.transferTo || prev.handler,
        update_by: updateStatusData.updatedBy || prev.update_by,
        update_on: currentDate,
        description: updateStatusData.description || prev.description,
        history: updatedHistory
      }));
    }
  };

  const handleBackClick = () => {
    navigate('/admin/AdminAllIncidents');
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="AdminUpdateIncident-main-content">
      <div className="AdminUpdateIncident-direction-bar">
        <span className="AdminUpdateIncident-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="AdminUpdateIncident-created-ticket">Update Incident</span>
      </div>

      <div className="AdminUpdateIncident-content2">
        <AffectedUserDetail formData={formData} />
        <IncidentHistory
          refNo={incidentDetails.refNo}
          category={incidentDetails.category}
          location={incidentDetails.location}
          priority={incidentDetails.priority}
          status={incidentDetails.status}
          assignedTo={incidentDetails.assignedTo}
          updateBy={incidentDetails.updateBy}
          updatedOn={incidentDetails.updatedOn}
          comments={incidentDetails.comments}
          historyData={historyData}
        />
        
        {incident && (
          <UpdateStatus
            incidentData={incidentDetails}
            incident={incident}
            usersDataset={sDesk_t2_users_dataset}
            categoryDataset={sDesk_t2_category_dataset}
            locationDataset={sDesk_t2_location_dataset}
            onStatusChange={handleUpdateStatusChange}
          />
        )}

        <div className="AdminUpdateIncident-update-button-container">
          <button
            className="AdminUpdateIncident-details-back-btn"
            onClick={handleBackClick}
          >
            Go Back
          </button>
          <button
            className="AdminUpdateIncident-details-update-btn"
            onClick={handleUpdateClick}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateIncident;