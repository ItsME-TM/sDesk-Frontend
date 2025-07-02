import React, { useState } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';
import { sDesk_t2_location_dataset } from '../../../data/sDesk_t2_location_dataset'; // Import the location dataset
import { useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import './TechnicianAllTeam.css';

const TechnicianAllTeam = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const currentAdmin = sDesk_t2_users_dataset.find(user => user.service_number === 'SV001' && user.role === 'admin');

    const getCategoryName = (categoryNumber) => {
        for (const parent of sDesk_t2_category_dataset) {
            for (const subcategory of parent.subcategories) {
                const item = subcategory.items.find(item => item.grandchild_category_number === categoryNumber);
                if (item) {
                    return item.grandchild_category_name;
                }
            }
        }
        return categoryNumber;
    };

    const getUserName = (serviceNumber) => {
        const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
        return user ? user.user_name : serviceNumber;
    };

    const getLocationName = (locationNumber) => {
        for (const district of sDesk_t2_location_dataset) {
            const location = district.sublocations.find(loc => loc.loc_number === locationNumber);
            if (location) {
                return location.loc_name;
            }
        }
        return locationNumber;
    };

    const tableData = sDesk_t2_incidents_dataset.map(incident => ({
        refNo: incident.incident_number,
        assignedTo: getUserName(incident.handler),
        affectedUser: getUserName(incident.informant),
        category: getCategoryName(incident.category),
        status: incident.status,
        rawCategory: incident.category,
        location: getLocationName(incident.location), // Use the new function to get the location name
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
        const incident = sDesk_t2_incidents_dataset.find(item => item.incident_number === refNo);
        if (incident) {
            const informant = sDesk_t2_users_dataset.find(user => user.service_number === incident.informant);
            if (informant) {
                navigate('/technician/TechnicianMyReportedUpdate', {
                    state: {
                        formData: {
                            serviceNo: informant.service_number,
                            tpNumber: informant.tp_number,
                            name: informant.user_name,
                            designation: informant.designation,
                            email: informant.email,
                        },
                        incidentDetails: {
                            refNo: incident.incident_number,
                            category: getCategoryName(incident.category),
                            location: getLocationName(incident.location), // Use the new function to get the location name
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

    const uniqueCategories = sDesk_t2_category_dataset
        .flatMap(parent => parent.subcategories.flatMap(sub => sub.items))
        .map(item => ({ number: item.grandchild_category_number, name: item.grandchild_category_name }))
        .filter((v, i, a) => a.findIndex(t => t.number === v.number) === i);

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
                        Incident History - All - Team
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
