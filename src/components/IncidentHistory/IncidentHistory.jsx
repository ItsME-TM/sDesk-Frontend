import React from 'react';
import './IncidentHistory.css';
import { CiLink } from "react-icons/ci";
// import { sDesk_t2_category_dataset } from '../../data/sDesk_t2_category_dataset';
import { sDesk_t2_location_dataset } from '../../data/sDesk_t2_location_dataset';

const IncidentHistory = ({ refNo, category, location, priority, historyData, users }) => {

    // TODO: Replace with backend lookup or prop-based category name resolution
    const getCategoryName = (categoryNumber) => categoryNumber;

    const getLocationName = (locationNumber) => {
        for (const district of sDesk_t2_location_dataset) {
            for (const sublocation of district.sublocations) {
                if (sublocation.loc_number === locationNumber) {
                    return sublocation.loc_name;
                }
            }
        }
        return locationNumber;    };

    const getUserName = (serviceNumber) => {
        const user = users.find(user => user.service_number === serviceNumber);
        return user ? user.display_name || user.user_name : serviceNumber;
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
            </div>
        </div>
    );
};

export default IncidentHistory;