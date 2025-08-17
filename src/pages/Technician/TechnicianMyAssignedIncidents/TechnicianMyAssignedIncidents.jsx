/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { fetchAssignedToMeRequest } from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';
import TechnicianInsident from '../../Technician/TechnicianIncident/TechnicianInsident';
import './TechnicianMyAssignedIncidents.css';
import './IncidentPopup.css';

const TechnicianMyAssignedIncidents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showIncidentPopup, setShowIncidentPopup] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showTransferSuccess, setShowTransferSuccess] = useState(false);

    // Redux state
    const { assignedToMe, loading, error } = useSelector((state) => state.incident);
    const { user } = useSelector((state) => state.auth);
    const { allUsers } = useSelector((state) => state.sltusers);
    const { categoryItems } = useSelector((state) => state.categories);
    const { locations } = useSelector((state) => state.location);
    
    // Real authentication check - no mock users
    if (!user) {
        return (
            <div className="TechnicianMyAssignedIncidents-main-content">
                <div className="TechnicianMyAssignedIncidents-direction-bar">
                    Incidents {'>'} My Assigned Incidents
                </div>
                <div className="TechnicianMyAssignedIncidents-content2">
                    <div className="auth-required-container" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <h3>Authentication Required</h3>
                        <p>Please log in with your Microsoft account to view assigned incidents.</p>
                        <button 
                            onClick={() => window.location.href = '/LogIn'}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#0078d4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (user.role !== 'technician') {
        return (
            <div className="TechnicianMyAssignedIncidents-main-content">
                <div className="TechnicianMyAssignedIncidents-direction-bar">
                    Incidents {'>'} My Assigned Incidents
                </div>
                <div className="TechnicianMyAssignedIncidents-content2">
                    <div className="role-error-container" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <h3>Access Denied</h3>
                        <p>This page is only accessible to technicians.</p>
                        <p>Your current role: <strong>{user.role}</strong></p>
                        <p>Contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentUser = user;
    const assignedUser = currentUser.serviceNum;
    
    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch assigned incidents on component mount
    useEffect(() => {
        if (assignedUser && currentUser) {
            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
        }
        dispatch(fetchAllUsersRequest());
        dispatch(fetchCategoryItemsRequest());
        dispatch(fetchLocationsRequest());

        // Listen for the custom event for successful transfer
        const handleIncidentTransferred = (event) => {
            const { incident_number } = event.detail;

            // Refetch the assigned incidents list
            if (assignedUser) {
                dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
            }

            // Show the success message
            setShowTransferSuccess(true);
            setTimeout(() => {
                setShowTransferSuccess(false);
            }, 3000); // Hide after 3 seconds

            // Close the popup
            setShowIncidentPopup(false);
        };

        window.addEventListener("incident-transferred", handleIncidentTransferred);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("incident-transferred", handleIncidentTransferred);
        };
    }, [dispatch, assignedUser, currentUser]);

    const getCategoryName = (categoryNumber) => {
        const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
        return category ? category.grandchild_category_name : categoryNumber;
    };

    const getUserName = (serviceNumber) => {
        if (!Array.isArray(allUsers)) return serviceNumber;
        const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
        return user ? (user.display_name || user.user_name || user.name) : serviceNumber;
    };

    const getLocationName = (locationNumber) => {
        const location = locations.find(loc => loc.loc_number === locationNumber || loc.id === locationNumber);
        return location ? (location.name || location.loc_name) : locationNumber;
    };

    // Only show loading spinner if loading is true AND assignedToMe is empty
    if (loading && (!assignedToMe || assignedToMe.length === 0)) {
        return (
            <div className="TechnicianMyAssignedIncidents-main-content">
                <div className="TechnicianMyAssignedIncidents-direction-bar">
                    Incidents {'>'} My Assigned Incidents
                </div>
                <div className="TechnicianMyAssignedIncidents-content2">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading assigned incidents...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="TechnicianMyAssignedIncidents-main-content">
                <div className="TechnicianMyAssignedIncidents-direction-bar">
                    Incidents {'>'} My Assigned Incidents
                </div>
                <div className="TechnicianMyAssignedIncidents-content2">
                    <div className="error-container">
                        <p>Error loading assigned incidents: {error}</p>
                        <button onClick={() => {
                            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
                        }}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tableData = assignedToMe.map(item => ({
        refNo: item.incident_number,
        affectedUser: getUserName(item.informant),
        category: getCategoryName(item.category),
        status: item.status,
        rawCategory: item.category
    }));

    const filteredData = tableData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter ? item.rawCategory === categoryFilter : true;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirst, indexOfLast);    const handleRowClick = (refNo) => {
        const incident = assignedToMe.find(item => item.incident_number === refNo);
        if (incident) {
            setSelectedIncident(incident);
            setShowIncidentPopup(true);
        }
    };

    const renderTableRows = () => {
        return currentRows.map((row, idx) => (
            <tr key={idx}>
                <td className='team-refno'>
                    <a
                        href="#"
                        className="refno-link"
                        onClick={(e) => {
                            e.preventDefault();
                            handleRowClick(row.refNo);
                        }}
                    >
                        {row.refNo}
                    </a>
                </td>
                <td>{row.affectedUser}</td>
                <td>{row.category}</td>
                <td className='team-status-text'>{row.status}</td>
            </tr>
        ));
    };

    const renderPaginationButtons = () => {
        const maxButtons = 7;
        const buttons = [];

        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                >
                    {i + 1}
                </button>
            ));
        }

        buttons.push(
            <button key={1} onClick={() => setCurrentPage(1)} className={currentPage === 1 ? 'active' : ''}>1</button>,
            <button key={2} onClick={() => setCurrentPage(2)} className={currentPage === 2 ? 'active' : ''}>2</button>
        );

        if (currentPage > 3) buttons.push(<span key="ellipsis1">...</span>);

        if (currentPage > 3 && currentPage < totalPages - 2) {
            buttons.push(
                <button key={currentPage} onClick={() => setCurrentPage(currentPage)} className="active">{currentPage}</button>
            );
        }

        if (currentPage < totalPages - 2) buttons.push(<span key="ellipsis2">...</span>);

        buttons.push(
            <button key={totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)} className={currentPage === totalPages - 1 ? 'active' : ''}>{totalPages - 1}</button>,
            <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={currentPage === totalPages ? 'active' : ''}>{totalPages}</button>
        );

        return buttons;
    };

    const uniqueCategories = [...new Set(tableData.map(item => item.rawCategory))].map(catNumber => ({
        number: catNumber,
        name: getCategoryName(catNumber)
    }));

    return (
        <div className="TechnicianMyAssignedIncidents-main-content">
            {showTransferSuccess && (
                <div className="transfer-success-popup">
                    <p>Incident Transfer Successful!</p>
                </div>
            )}

            <div className="TechnicianMyAssignedIncidents-tickets-creator">
                <span className="TechnicianMyAssignedIncidents-svr-desk">Incidents</span>
                <IoIosArrowForward />
                <span className="TechnicianMyAssignedIncidents-created-ticket">My Assigned Incidents</span>
            </div>
            <div className="TechnicianMyAssignedIncidents-content2">
                <div className="TechnicianMyAssignedIncidents-TitleBar">
                    <div className="TechnicianMyAssignedIncidents-TitleBar-NameAndIcon">
                        <FaHistory size={20} />
                        My Assigned Incidents - {currentUser.name || currentUser.display_name || currentUser.serviceNum}
                    </div>
                    <div className="TechnicianMyAssignedIncidents-TitleBar-buttons">
                        <button className="TechnicianMyAssignedIncidents-TitleBar-buttons-ExportData">
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar - moved above the table for all screen sizes */}
                <div className="TechnicianMyAssignedIncidents-showSearchBar flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div className="TechnicianMyAssignedIncidents-showSearchBar-Show flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                            <span>Entries:</span>
                            <select 
                                onChange={e => setRowsPerPage(Number(e.target.value))} 
                                value={rowsPerPage} 
                                className="TechnicianMyAssignedIncidents-showSearchBar-Show-select w-full sm:w-24"
                            >
                                {[10, 20, 50, 100].map(size => (
                                    <option key={size} value={size}>{size} entries</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                            <span>Status:</span>
                            <select 
                                onChange={e => setStatusFilter(e.target.value)} 
                                value={statusFilter} 
                                className="TechnicianMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-32"
                            >
                                <option value="">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Hold">Hold</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                            <span>Category:</span>
                            <select 
                                onChange={e => setCategoryFilter(e.target.value)} 
                                value={categoryFilter} 
                                className="TechnicianMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-40"
                            >
                                <option value="">All Categories</option>
                                {uniqueCategories.map(cat => (
                                    <option key={cat.number} value={cat.number}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="TechnicianMyAssignedIncidents-showSearchBar-SearchBar flex items-center gap-2 w-full sm:w-64">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="TechnicianMyAssignedIncidents-showSearchBar-SearchBar-input w-full"
                        />
                    </div>
                </div>

                {/* Table for desktop/tablet, cards for mobile */}
                <div className="TechnicianMyAssignedIncidents-table">
                    <div className="hidden sm:block">
                        <table className="TechnicianMyAssignedIncidents-table-table w-full">
                            <thead>
                                <tr>
                                    <th>Ref No</th>
                                    <th>Affected User</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>{renderTableRows()}</tbody>
                        </table>
                    </div>
                    <div className="sm:hidden flex flex-col gap-4">
                        {/* Removed extra incident details below the table. Mobile card rendering is now disabled. */}
                    </div>
                </div>

                <div className="TechnicianMyAssignedIncidents-content3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                    <span>
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="TechnicianMyAssignedIncidents-content3-team-pagination-buttons flex gap-2 flex-wrap">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                        {renderPaginationButtons()}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                    </div>
                </div>
            </div>
            {showIncidentPopup && selectedIncident && (
                <div className="incident-popup-overlay">
                    <div className="incident-popup-content">
                        <button className="incident-popup-close-btn" onClick={() => setShowIncidentPopup(false)}>X</button>
                        <TechnicianInsident incidentData={selectedIncident} isPopup={true} loggedInUser={currentUser} />
                    </div>
                </div>
            )}
        </div>
    );
};
export default TechnicianMyAssignedIncidents;