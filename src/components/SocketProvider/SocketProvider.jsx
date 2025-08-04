import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../utils/socket.js";
import AlertPopup from "../AlertPopup/AlertPopup.jsx";
import {
  getAssignedToMeRequest,
  getAssignedByMeRequest,
  fetchAllIncidentsRequest,
} from "../../redux/incident/incidentSlice.js";

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [alerts, setAlerts] = useState([]);

  // Function to add new alert
  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now(),
      ...alert,
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  // Function to remove alert
  const removeAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  useEffect(() => {
    if (!user) return; // Only set up socket listeners for logged-in users

    // Send user info to server for targeted notifications
    socket.emit("user_connected", {
      serviceNum: user.serviceNum,
      role: user.role,
      name: user.name,
    });

    // Connection events
    const handleConnect = () => {

      // Re-send user info on reconnection
      socket.emit("user_connected", {
        serviceNum: user.serviceNum,
        role: user.role,
        name: user.name,
      });
    };

    const handleDisconnect = () => {
    };

    // General incident creation events (everyone receives these - NO POPUP, only Redux update)
    const handleIncidentCreated = () => {


      // Dispatch different Redux actions based on user role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());
      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));
      } else {
        // Default fallback for any unrecognized roles - treat as user
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      }
    };

    // Targeted incident assignment (only for assigned handler - SHOW POPUP)
    const handleIncidentAssignedTechnician = (data) => {


      // Show popup for assigned handler
      addAlert({
        type: "incident_assigned",
        title: "Incident Assigned to You!",
        message:
          data.message ||
          `You have been assigned a new incident. Please check your assigned incidents list.`,
        incidentNumber: data.incident.incident_number,
      });

      // Also update Redux state for assigned handler based on their role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };

    // General incident update events (everyone receives these - NO POPUP, only Redux update)
    const handleIncidentUpdated = () => {

      // Dispatch different Redux actions based on user role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles - treat as user
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };

    // Targeted incident update notification (only for assigned handler - SHOW POPUP)
    const handleIncidentUpdatedAssigned = (data) => {


      // Show popup for assigned handler
      addAlert({
        type: "incident_updated",
        title: "Incident Updated!",
        message:
          data.message ||
          `Incident ${data.incident.incident_number} has been updated. Please check the latest details.`,
        incidentNumber: data.incident.incident_number,
      });

      // Also update Redux state for assigned handler based on their role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };

    // Set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("incident_created", handleIncidentCreated);
    socket.on("incident_assigned_technician", handleIncidentAssignedTechnician);
    socket.on("incident_updated", handleIncidentUpdated);
    socket.on("incident_updated_assigned", handleIncidentUpdatedAssigned);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("incident_created", handleIncidentCreated);
      socket.off(
        "incident_assigned_technician",
        handleIncidentAssignedTechnician
      );
      socket.off("incident_updated", handleIncidentUpdated);
      socket.off("incident_updated_assigned", handleIncidentUpdatedAssigned);
    };
  }, [user, dispatch]);

  return (
    <>
      {children}
      {/* Render alert popups */}
      {alerts.map((alert) => (
        <AlertPopup
          key={alert.id}
          alert={alert}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </>
  );
};

export default SocketProvider;
