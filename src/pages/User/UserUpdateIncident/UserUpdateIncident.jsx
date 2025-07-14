import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './UserUpdateIncident.css';
import { IoIosArrowForward } from 'react-icons/io';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncidentHistoryRequest } from '../../../redux/incident/incidentSlice';

// Accept loggedInUser as a prop
const UserUpdateIncident = ({ incidentData, isPopup, onClose, loggedInUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const historyData = useSelector(state => state.incident.incidentHistory) || [];
  const loadingHistory = useSelector(state => state.incident.loadingHistory);
  const errorHistory = useSelector(state => state.incident.errorHistory);
  // Set formData to loggedInUser if available, else fallback to blank
  const [formData, setFormData] = useState({
    serviceNo: loggedInUser?.serviceNum || '',
    tpNumber: '',
    name: loggedInUser?.name || '',
    designation: loggedInUser?.role || '',
    email: loggedInUser?.email || '',
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

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Always set formData to loggedInUser if available (for popup)
    if (loggedInUser) {
      setFormData({
        serviceNo: loggedInUser.serviceNum || '',
        tpNumber: loggedInUser.tpNumber || '',
        name: loggedInUser.name || '',
        designation: loggedInUser.role || '',
        email: loggedInUser.email || '',
      });
    } else if (location.state?.formData) {
      setFormData({
        serviceNo: location.state.formData.serviceNo || location.state.formData.serviceNum || '',
        tpNumber: location.state.formData.tpNumber || '',
        name: location.state.formData.name || '',
        designation: location.state.formData.designation || location.state.formData.role || '',
        email: location.state.formData.email || '',
      });
    }

    // Incident details
    console.log('[UserUpdateIncident] incidentData:', incidentData);
    if (incidentData) {
      setIncidentDetails({
        refNo: incidentData.incident_number || incidentData.refNo,
        category: incidentData.category,
        location: incidentData.location,
        priority: incidentData.priority,
        status: incidentData.status,
        assignedTo: incidentData.handler || incidentData.assignedTo,
        updateBy: incidentData.update_by || incidentData.updateBy,
        updatedOn: incidentData.update_on || incidentData.updatedOn,
        comments: incidentData.description || incidentData.comments,
      });
      // Fetch incident history using redux-saga
      const refNo = String(incidentData.incident_number || incidentData.refNo);
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
      setIsLoading(false);
    } else if (location.state?.incidentDetails) {
      const details = location.state.incidentDetails;
      const fullIncident = sDesk_t2_incidents_dataset.find(
        inc => inc.incident_number === details.refNo
      );
      if (fullIncident) {
        setIncidentDetails({
          refNo: details.refNo,
          category: details.category,
          location: details.location,
          priority: fullIncident.priority || details.priority,
          status: fullIncident.status || details.status,
          assignedTo: getUserName(fullIncident.handler) || 'Unassigned',
          updateBy: getUserName(fullIncident.update_by) || 'System',
          updatedOn: fullIncident.update_on || new Date().toLocaleString(),
          comments: fullIncident.description || 'No comments'
        });
        if (fullIncident.history) {
          setHistoryData(fullIncident.history.map(item => ({
            assignedTo: getUserName(item.handler) || 'Unassigned',
            updatedBy: getUserName(item.update_by) || 'System',
            updatedOn: item.update_on || new Date().toLocaleString(),
            status: item.status || 'Pending',
            comments: item.description || 'No comments'
          })));
        } else {
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
        });
      }
    }
    setIsLoading(false);
  }, [incidentData, location.state, loggedInUser]);

  const getUserName = (serviceNumber) => {
    const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
    return user ? user.user_name : serviceNumber;
  };

  const handleBackClick = () => {
    navigate('/user/UserViewIncident');
  };


  if (isLoading || loadingHistory) {
    return <div className="loading-container">Loading...</div>;
  }
  if (errorHistory) {
    return <div className="loading-container">Error: {errorHistory}</div>;
  }

  return (
    <div className={isPopup ? "UserUpdateIncident-modal-content" : "UserUpdateIncident-main-content"}>
      {isPopup && (
        <button style={{ float: "right" }} onClick={onClose}>Close</button>
      )}
      <div className="UserUpdateIncident-direction-bar">
        <span className="UserUpdateIncident-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="UserUpdateIncident-created-ticket">My Incidents</span>
      </div>

      <div className="UserUpdateIncident-content2">
        <AffectedUserDetail formData={formData} />
        {/* historyData now comes from redux */}
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
          users={sDesk_t2_users_dataset}
        />
        <div className="UserUpdateIncident-button-container">
          {!isPopup && (
            <button
              className="UserUpdateIncident-details-back-btn"
              onClick={handleBackClick}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserUpdateIncident;