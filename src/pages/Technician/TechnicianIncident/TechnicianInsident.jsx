import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TechnicianInsident.css';
import { IoIosArrowForward } from 'react-icons/io';
import UpdateStatus from '../../../components/UpdateStatus/UpdateStatus';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';
import { sDesk_t2_location_dataset } from '../../../data/sDesk_t2_location_dataset';
import { fetchIncidentByIdRequest, updateIncidentRequest } from '../../../redux/incident/incidentSlice';
import 'bootstrap/dist/css/bootstrap.min.css';

const TechnicianInsident = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const dispatch = useDispatch();
  
  // Redux state
  const { currentIncident, loading, error } = useSelector((state) => state.incident);
  
  // Local state
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
    status: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const getUserName = (serviceNumber) => {
    const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
    return user ? user.user_name : serviceNumber;
  };
  // Fetch incident from Redux if incidentId is provided
  useEffect(() => {
    if (incidentId) {
      dispatch(fetchIncidentByIdRequest(incidentId));
    }
  }, [dispatch, incidentId]);

  // Handle incident data from location state or Redux
  useEffect(() => {
    // Check if data comes from navigation state
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }

    // Use Redux currentIncident if available, otherwise use location state
    const incidentToUse = currentIncident || (location.state?.incidentDetails ? 
      { 
        incident_number: location.state.incidentDetails.refNo,
        ...location.state.incidentDetails 
      } : null);

    if (incidentToUse) {
      const details = location.state?.incidentDetails;
      
      // Map incident fields to display fields
      setIncidentDetails({
        refNo: incidentToUse.incident_number || details?.refNo || '',
        category: details?.category || incidentToUse.category || '',
        location: details?.location || incidentToUse.location || '',
        priority: incidentToUse.priority || details?.priority || '',
        status: incidentToUse.status || 'Open',
        assignedTo: getUserName(incidentToUse.handler) || 'Unassigned',
        updateBy: getUserName(incidentToUse.update_by) || 'System',
        updatedOn: incidentToUse.update_on || incidentToUse.updated_at || new Date().toLocaleString(),
        comments: incidentToUse.description || 'No comments'
      });

      // Set the full incident data
      setIncident({
        ...incidentToUse,
        update_by: incidentToUse.update_by || '123',
        status: incidentToUse.status || 'Open',
      });      // Prepare history data if available
      if (incidentToUse.history) {
        setHistoryData(incidentToUse.history.map(item => ({
          assignedTo: getUserName(item.handler) || 'Unassigned',
          updatedBy: getUserName(item.update_by) || 'System',
          updatedOn: item.update_on || new Date().toLocaleString(),
          status: item.status || 'Pending',
          comments: item.description || 'No comments'
        })));
      } else {
        // If no history, use current incident as the only history entry
        setHistoryData([{
          assignedTo: getUserName(incidentToUse.handler) || 'Unassigned',
          updatedBy: getUserName(incidentToUse.update_by) || 'System',
          updatedOn: incidentToUse.update_on || incidentToUse.updated_at || new Date().toLocaleString(),
          status: incidentToUse.status || 'Pending',
          comments: incidentToUse.description || 'No comments'
        }]);
      }
    } else if (location.state?.incidentDetails) {
      const details = location.state.incidentDetails;
      setIncidentDetails({
        ...details,
        status: 'Open',
        assignedTo: getUserName(details.assignedTo) || details.assignedTo,
        updateBy: getUserName(details.updateBy) || details.updateBy,
        updatedOn: new Date().toLocaleString(),
        comments: details.description || 'No comments'
      });
      setIncident({
        incident_number: details.refNo,
        category: details.category,
        location: details.location,
        priority: details.priority,
        update_by: '123',
        status: 'Open',
        description: details.description || '',
        urgent_notification_to: '',
      });
    }
    setIsLoading(false);
  }, [location.state, currentIncident]);

  const handleUpdateStatusChange = (data) => {
    setUpdateStatusData(data);
  };
  const handleUpdateClick = () => {
    if (!incident) return;

    const updateData = {
      id: incident.id || incident.incident_number,
      category: updateStatusData.category || incident.category,
      location: updateStatusData.location || incident.location,
      priority: updateStatusData.priority || incident.priority,
      status: updateStatusData.status || incident.status,
      handler: updateStatusData.transferTo || incident.handler,
      description: updateStatusData.description || incident.description,
      updatedBy: updateStatusData.updatedBy,
    };

    dispatch(updateIncidentRequest(updateData));

    // Local state updates for immediate UI feedback
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

    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleBackClick = () => {
    navigate('/technician/TechnicianAssignedIncidents');
  };
  if (loading || isLoading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>Error loading incident: {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => incidentId ? dispatch(fetchIncidentByIdRequest(incidentId)) : navigate(-1)}
          >
            {incidentId ? 'Retry' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard container-fluid p-0">
      <div className="technician-dashboard-main row m-0">
        <div className="technicianinsident-tickets-creator col-12 d-flex align-items-center mb-3">
          <span className="technicianinsident-svr-desk">Dashboard</span>
          <IoIosArrowForward className="mx-2" />
          <span className="technicianinsident-created-ticket">Incident Update</span>
        </div>
        
        <div className="technician-main-content col-12">
          <div className="row">
            <div className="col-12 mb-3">
              <AffectedUserDetail formData={formData} />
            </div>
            
            <div className="col-12 mb-3">
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
            </div>
            
            {incident && (
              <div className="col-12 mb-3">
                <UpdateStatus
                  incidentData={incidentDetails}
                  incident={incident}
                  usersDataset={sDesk_t2_users_dataset}
                  categoryDataset={sDesk_t2_category_dataset}
                  locationDataset={sDesk_t2_location_dataset}
                  onStatusChange={handleUpdateStatusChange}
                />
              </div>
            )}
            
            <div className="col-12 d-flex justify-content-between">
              <button 
                className="technician-details-back-btn"
                onClick={handleBackClick}
              >
                Go Back
              </button>
              <button 
                className="technician-details-update-btn"
                onClick={handleUpdateClick}
              >
                Update
              </button>
            </div>
            
            {showSuccessMessage && (
              <div className="col-12 mt-3">
                <div className="alert alert-success">
                  Incident updated successfully!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianInsident;