import React from 'react';
import './IncidentHistory.css';
import { CiLink } from "react-icons/ci";

const IncidentHistory = ({ refNo, category, location, priority, historyData }) => {
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
                                        <td className="assigned-column">{entry.assignedTo}</td>
                                        <td className="updated-by-column">{entry.updatedBy}</td>
                                        <td className="updated-on-column">{entry.updatedOn}</td>
                                        <td className="status-column">{entry.status}</td>
                                        <td className="comments-column">{entry.comments}</td>
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
                        Category - <span>{category}</span> :
                        Location - <span>{location}</span> :
                        Priority - <span>{priority}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IncidentHistory;