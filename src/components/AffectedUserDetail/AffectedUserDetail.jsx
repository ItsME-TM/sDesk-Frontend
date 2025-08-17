import React from 'react';
import './AffectedUserDetail.css';

const AffectedUserDetail = ({ formData }) => {
    return (
        <div className="container mt-4">
            <div className="affected-user-card card">
                <div className="card-body">
                    <h5 className="card-title">Affected User Details</h5>
                    <br />
                    <table className="affected-user-table table">
                        <thead>
                            <tr>
                                <th>Service No</th>
                                <th>TP Number</th>
                                <th>Name</th>
                                <th>Designation</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                       
                                        name="serviceNo"
                                        value={formData.serviceNo}
                                        readOnly
                                    />
                                </td>
                                <td>{formData.tpNumber}</td>
                                <td>{formData.name}</td>
                                <td>{formData.designation}</td>
                                <td>{formData.email}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AffectedUserDetail;
