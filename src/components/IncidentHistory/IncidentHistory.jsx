import React from 'react';
import './IncidentHistory.css';
import { CiLink } from "react-icons/ci";
import { useSelector } from 'react-redux';

const IncidentHistory = ({ refNo, category, location, priority, historyData, users }) => {
    const { locations } = useSelector((state) => state.location);

    const getCategoryName = (categoryName) => categoryName;

    const getLocationName = (locationId) => {
        const foundLocation = locations.find(loc => loc.id === locationId || loc.loc_number === locationId);
        return foundLocation ? (foundLocation.name || foundLocation.loc_name) : locationId;
    };

    const getUserName = (serviceNumber) => {
        if (!Array.isArray(users)) return serviceNumber;
        const user = users.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
        return user ? user.display_name || user.user_name || user.name : serviceNumber;
    };

    return (
        <div className="incident-history-container">
            <div className="incident-history-card card">
                <div className="card-body">
                    <h5 className="incident-history-title">
                        Incident History - <span>{refNo}</span>
                    </h5>
                    <table className="incident-history-table table">
                        <thead className="incident-history-thead">
                            <tr>
                                <th className="assigned-column"><CiLink /> &nbsp; Assigned To</th>
                                <th className="updated-by-column">Update By</th>
                                <th className="updated-on-column">Updated On</th>
                                <th className="status-column">Status</th>
                                <th className="comments-column">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length > 0 ? (
                                historyData.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="assigned-column">{getUserName(entry.assignedTo)}</td>
                                        <td className="updated-by-column">{getUserName(entry.updatedBy)}</td>
                                        <td className="updated-on-column">{entry.updatedOn}</td>
                                        <td className="status-column">{entry.status}</td>
                                        <td className="comments-column">{entry.comments}</td>
                                        <td>
                                            {entry.attachment && entry.attachment.trim() !== '' ? (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleDownloadAttachment(entry.attachment, entry.attachmentOriginalName)}
                                                    className="d-flex align-items-center"
                                                    style={{ backgroundColor: '#007bff', color: '#fff', border: 'none' }}
                                                > 
                                                    <FaDownload className="me-1" />
                                                    {entry.attachmentOriginalName || entry.attachment}
                                                </Button>
                                            ) : (
                                                <span className="text-muted">No attachment</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center no-history">No history available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <p className="incident-history-category">
                        Category - <span>{getCategoryName(category)}</span> :
                        Location - <span>{getLocationName(location)}</span> :
                        Priority - <span>{priority}</span>
                    </p>
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
