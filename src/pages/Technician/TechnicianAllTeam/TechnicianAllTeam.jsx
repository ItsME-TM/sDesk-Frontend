import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllIncidentsRequest, 
    fetchCurrentTechnicianRequest 
} from '../../../redux/incident/incidentSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';
import './TechnicianAllTeam.css';

const TechnicianAllTeam = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Redux state
    const { incidents, currentTechnician, loading, error } = useSelector((state) => state.incident);
    const { user } = useSelector((state) => state.auth);
    const { allUsers } = useSelector((state) => state.sltusers);
    const { locations } = useSelector((state) => state.location);
    const { categoryItems } = useSelector((state) => state.categories);
    
    // Local state for UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [teamIncidents, setTeamIncidents] = useState([]);

    // Check if user is technician
    if (!user || user.role !== 'technician') {
        return (
            <div className="TechnicianAllTeam-main-content">
                <div className="TechnicianAllTeam-tickets-creator">
                    <span className="TechnicianAllTeam-svr-desk">Incidents</span>
                    <IoIosArrowForward />
                    <span className="TechnicianAllTeam-created-ticket">All Team</span>
                </div>
                <div className="TechnicianAllTeam-content2">
                    <div style={{
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
                        <p>Your current role: <strong>{user?.role || 'Unknown'}</strong></p>
                        <p>Contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch data on component mount
    useEffect(() => {
        // Fetch all incidents
        dispatch(fetchAllIncidentsRequest());

        // Fetch current technician data
        if (user && user.serviceNum) {
            dispatch(fetchCurrentTechnicianRequest({ serviceNum: user.serviceNum }));
        }

        // Fetch categories, users, and locations
        dispatch(fetchCategoryItemsRequest());
        dispatch(fetchAllUsersRequest());
        dispatch(fetchLocationsRequest());
    }, [dispatch, user]);

    // Filter team incidents when incidents or technician data changes
    useEffect(() => {
        if (incidents && incidents.length > 0 && currentTechnician && categoryItems.length > 0) {
            console.log('Filtering team incidents...');
            console.log('Current technician team:', currentTechnician.team);
            console.log('Total incidents:', incidents.length);
            console.log('Categories:', categoryItems.length);

            // Find categories that belong to the technician's team
            const teamCategories = categoryItems.filter(cat => {
                // The category has subCategory.mainCategory relationship
                const mainCategoryId = cat.subCategory?.mainCategory?.id;
                const mainCategoryName = cat.subCategory?.mainCategory?.name;
                
                // Check if this category belongs to technician's team
                return mainCategoryId === currentTechnician.team || mainCategoryName === currentTechnician.team;
            });

            console.log('Team categories found:', teamCategories.length);
            const teamCategoryNames = teamCategories.map(cat => cat.name);
            console.log('Team category names:', teamCategoryNames);

            // Filter incidents that belong to team categories
            const filteredIncidents = incidents.filter(incident => 
                teamCategoryNames.includes(incident.category)
            );

            console.log('Filtered team incidents:', filteredIncidents.length);
            setTeamIncidents(filteredIncidents);
        }
    }, [incidents, currentTechnician, categoryItems]);

    // Helper functions
    const getCategoryName = (categoryName) => {
        return categoryName || 'Unknown Category';
    };

    const getUserName = (serviceNumber) => {
        const foundUser = allUsers.find(user => user.serviceNum === serviceNumber || user.service_number === serviceNumber);
        return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name) : serviceNumber;
    };

    const getLocationName = (locationId) => {
        const location = locations.find(loc => loc.id === locationId || loc.loc_number === locationId);
        return location ? (location.name || location.loc_name) : locationId;
    };

    // Process incidents data for table display
    const tableData = teamIncidents.map(incident => ({
        refNo: incident.incident_number,
        assignedTo: getUserName(incident.handler),
        affectedUser: getUserName(incident.informant),
        category: getCategoryName(incident.category),
        status: incident.status,
        rawCategory: incident.category,
        location: getLocationName(incident.location),
        priority: incident.priority,
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
    const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

    const handleRowClick = (refNo) => {
        const incident = teamIncidents.find(item => item.incident_number === refNo);
        if (incident) {
            const informant = allUsers.find(user => 
                user.serviceNum === incident.informant || 
                user.service_number === incident.informant
            );
            if (informant) {
                navigate('/technician/TechnicianMyReportedUpdate', {
                    state: {
                        formData: {
                            serviceNo: informant.serviceNum || informant.service_number,
                            tpNumber: informant.tp_number || informant.contactNumber || '',
                            name: informant.display_name || informant.user_name || informant.name,
                            designation: informant.designation || informant.role,
                            email: informant.email,
                        },
                        incidentDetails: {
                            refNo: incident.incident_number,
                            category: getCategoryName(incident.category),
                            location: getLocationName(incident.location),
                            priority: incident.priority,
                            status: incident.status,
                        },
                    },
                });
            }
        }
    };

    const renderTableRows = () => {
        return currentRows.map((row, idx) => (
            <tr
                key={idx}
                onClick={() => handleRowClick(row.refNo)}
                style={{ cursor: 'pointer' }}
            >
                <td className='team-refno'>{row.refNo}</td>
                <td>{row.assignedTo}</td>
                <td>{row.affectedUser}</td>
                <td>{row.category}</td>
                <td className='team-status-text'>{row.status}</td>
                <td>{row.location}</td>
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

    // Show loading state
    if (loading) {
        return (
            <div className="TechnicianAllTeam-main-content">
                <div className="TechnicianAllTeam-tickets-creator">
                    <span className="TechnicianAllTeam-svr-desk">Incidents</span>
                    <IoIosArrowForward />
                    <span className="TechnicianAllTeam-created-ticket">All Team</span>
                </div>
                <div className="TechnicianAllTeam-content2">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        fontSize: '18px'
                    }}>
                        Loading team incidents...
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="TechnicianAllTeam-main-content">
                <div className="TechnicianAllTeam-tickets-creator">
                    <span className="TechnicianAllTeam-svr-desk">Incidents</span>
                    <IoIosArrowForward />
                    <span className="TechnicianAllTeam-created-ticket">All Team</span>
                </div>
                <div className="TechnicianAllTeam-content2">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#d32f2f' }}>Error Loading Team Incidents</h3>
                        <p>{error}</p>
                        <button 
                            onClick={() => dispatch(fetchAllIncidentsRequest())}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const uniqueCategories = categoryItems.map(cat => ({
        number: cat.name,
        name: cat.name
    })).filter((v, i, a) => a.findIndex(t => t.number === v.number) === i);

    // Debug logging
    console.log('🔍 TechnicianAllTeam Debug Info:');
    console.log('  User:', user);
    console.log('  Team Incidents:', teamIncidents);
    console.log('  Loading:', loading);
    console.log('  Error:', error);
    console.log('  Categories:', categoryItems.length);
    console.log('  Users:', allUsers.length);
    console.log('  Locations:', locations.length);

    return (
        <div className="TechnicianAllTeam-main-content">
            <div className="TechnicianAllTeam-tickets-creator">
                <span className="TechnicianAllTeam-svr-desk">Incidents</span>
                <IoIosArrowForward />
                <span className="TechnicianAllTeam-created-ticket">All Team</span>
            </div>
            <div className="TechnicianAllTeam-content2">
                <div className="TechnicianAllTeam-TitleBar">
                    <div className="TechnicianAllTeam-TitleBar-NameAndIcon">
                        <FaHistory size={20} />
                        Incident History - {user?.team || 'Team'} - All Team Members
                    </div>
                    <div className="TechnicianAllTeam-TitleBar-buttons">
                        <button className="TechnicianAllTeam-TitleBar-buttons-ExportData">
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="TechnicianAllTeam-showSearchBar">
                    <div className="TechnicianAllTeam-showSearchBar-Show">
                        Entries:
                        <select
                            onChange={e => setRowsPerPage(Number(e.target.value))}
                            value={rowsPerPage}
                            className="TechnicianAllTeam-showSearchBar-Show-select"
                        >
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size} entries</option>
                            ))}
                        </select>
                        Status:
                        <select
                            onChange={e => setStatusFilter(e.target.value)}
                            value={statusFilter}
                            className="TechnicianAllTeam-showSearchBar-Show-select"
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Hold">Hold</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                        Category:
                        <select
                            onChange={e => setCategoryFilter(e.target.value)}
                            value={categoryFilter}
                            className="TechnicianAllTeam-showSearchBar-Show-select2"
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat.number} value={cat.number}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="TechnicianAllTeam-showSearchBar-SearchBar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="TechnicianAllTeam-showSearchBar-SearchBar-input"
                        />
                    </div>
                </div>
                <div className="TechnicianAllTeam-table">
                    <table className="TechnicianAllTeam-table-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
                                <th>Assigned To</th>
                                <th>Affected User</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
                <div className="TechnicianAllTeam-content3">
                    <span className="TechnicianAllTeam-content3-team-entry-info">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="TechnicianAllTeam-content3-team-pagination-buttons">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {renderPaginationButtons()}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianAllTeam;
