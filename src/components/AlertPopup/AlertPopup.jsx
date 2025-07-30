import { useEffect } from "react";
import "./AlertPopup.css";

const AlertPopup = ({ alert, onClose }) => {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const getIcon = (type) => {
    switch (type) {
      case "incident_created":
        return "🆕";
      case "incident_assigned":
        return "🎯";
      case "technician_incident":
        return "🔧";
      default:
        return "📢";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "incident_created":
        return "#28a745"; // Green
      case "incident_assigned":
        return "#dc3545"; // Red (urgent)
      case "technician_incident":
        return "#007bff"; // Blue
      default:
        return "#6c757d"; // Gray
    }
  };

  return (
    <div className="alert-popup-overlay">
      <div
        className="alert-popup"
        style={{ borderLeftColor: getColor(alert.type) }}
      >
        <div className="alert-popup-header">
          <span className="alert-icon">{getIcon(alert.type)}</span>
          <span className="alert-title">{alert.title}</span>
          <button className="alert-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="alert-popup-body">
          <p>{alert.message}</p>
          {alert.incidentNumber && (
            <div className="alert-incident-info">
              <strong>Incident:</strong> {alert.incidentNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;
