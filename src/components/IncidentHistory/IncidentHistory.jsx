
import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { CiLink } from "react-icons/ci";
import { useSelector } from 'react-redux';
import './IncidentHistory.css';

// Helper function to format date as 'YYYY-MM-DD HH:mm:ss'
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const IncidentHistory = ({ refNo, category, location, priority, historyData, users }) => {
    const { locations } = useSelector((state) => state.location);

    const getCategoryName = (categoryName) => categoryName || 'N/A';

    const getLocationName = (locationId) => {
        const foundLocation = locations.find(loc => loc.id === locationId || loc.loc_number === locationId);
        return foundLocation ? (foundLocation.name || foundLocation.loc_name) : locationId || 'N/A';
    };

    const getUserName = (serviceNumber) => {
        if (!Array.isArray(users) || !serviceNumber) return serviceNumber || 'N/A';
        const user = users.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
        return user ? user.display_name || user.user_name || user.name : serviceNumber;
    };

    const getStatusBadge = (status) => {
        let variant;
        switch (status) {
            case 'Closed':
                variant = 'success';
                break;
            case 'In Progress':
                variant = 'warning';
                break;
            case 'New':
                variant = 'primary';
                break;
            default:
                variant = 'secondary';
        }
        return <Badge bg={variant}>{status}</Badge>;
    };

    return (
        <Card className="incident-history-card-modern shadow-sm">
            <Card.Header as="h5" className="bg-light text-dark d-flex justify-content-between align-items-center">
                <span>Incident History - <span className="fw-bold text-primary">{refNo}</span></span>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover className="incident-history-table-modern">
                        <thead className="table-light">
                            <tr>
                                <th><CiLink className="me-1" />Assigned To</th>
                                <th>Updated By</th>
                                <th>Updated On</th>
                                <th>Status</th>
                                <th className="comments-column">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length > 0 ? (
                                historyData.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{getUserName(entry.assignedTo)}</td>
                                        <td>{getUserName(entry.updatedBy)}</td>
                                        <td>{formatDateTime(entry.updatedOn)}</td>
                                        <td>{getStatusBadge(entry.status)}</td>
                                        <td className="comments-column">{entry.comments}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">No history available</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
            <Card.Footer className="bg-light text-muted d-flex flex-row gap-2 justify-content-start flex-wrap" style={{gap: '0.75rem'}}>
                <div className="me-2"><strong>Category:</strong> {getCategoryName(category)}</div>
                <div className="me-2"><strong>Location:</strong> {getLocationName(location)}</div>
                <div><strong>Priority:</strong> {priority}</div>
            </Card.Footer>
        </Card>
    );
};

export default IncidentHistory;
