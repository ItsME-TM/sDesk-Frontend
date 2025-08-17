import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './UserUpdateIncident.css';
import { IoIosArrowForward } from 'react-icons/io';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIncidentHistoryRequest,
  getIncidentByNumberRequest
} from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';

// Accept loggedInUser as a prop
const UserUpdateIncident = ({ incidentData, isPopup, onClose, loggedInUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { incidentHistory, loading: loadingHistory, error: errorHistory, currentIncident } = useSelector(state => state.incident);
  const { allUsers } = useSelector(state => state.sltusers);

  // Set formData to loggedInUser if available, else fallback to blank
  const [formData, setFormData] = useState({
    serviceNo: (loggedInUser?.serviceNum || incidentData?.informant || ''),
    tpNumber: loggedInUser?.contactNumber || '',
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

  const getUserName = (serviceNumber) => {
    const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
    return user ? user.display_name || user.user_name || user.name : serviceNumber;
  };

  useEffect(() => {
    dispatch(fetchAllUsersRequest());

    // Always set formData to loggedInUser if available (for popup)
    if (loggedInUser) {
      setFormData({
        serviceNo: loggedInUser.serviceNum || incidentData?.informant || '',
        tpNumber: loggedInUser.contactNumber || '',
        name: loggedInUser.name || '',
        designation: loggedInUser.role || '',
        email: loggedInUser.email || '',
      });
    } else if (incidentData && incidentData.informant) {
      setFormData(formData => ({
        ...formData,
        serviceNo: incidentData.informant
      }));
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
      const refNo = details.refNo;
      dispatch(getIncidentByNumberRequest({ incident_number: refNo }));
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
    }
    setIsLoading(false);
  }, [incidentData, location.state, loggedInUser, dispatch]);

  useEffect(() => {
    if (currentIncident && allUsers.length > 0) {
      setIncidentDetails({
        refNo: currentIncident.incident_number,
        category: currentIncident.category,
        location: currentIncident.location,
        priority: currentIncident.priority,
        status: currentIncident.status,
        assignedTo: getUserName(currentIncident.handler),
        updateBy: getUserName(currentIncident.update_by),
        updatedOn: currentIncident.update_on || new Date().toLocaleString(),
        comments: currentIncident.description || 'No comments'
      });
    }
  }, [currentIncident, allUsers]);

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
          historyData={incidentHistory}
          users={allUsers}
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
