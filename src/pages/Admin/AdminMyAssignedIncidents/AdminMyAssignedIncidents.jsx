import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { IoIosArrowForward } from "react-icons/io";
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';
import { sDesk_t2_location_dataset } from '../../../data/sDesk_t2_location_dataset';
import { useNavigate } from 'react-router-dom';
import { fetchAssignedToMeRequest } from '../../../redux/incident/incidentSlice';
import './AdminMyAssignedIncidents.css';

const AdminMyAssignedIncidents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { assignedToMe, loading, error } = useSelector((state) => state.incident);
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.sltusers);

  const assignedUser = loggedInUser ? loggedInUser.serviceNumber : null;
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch assigned incidents on component mount
  useEffect(() => {
    if (assignedUser) {
      dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
    }
  }, [dispatch, assignedUser]);

  const getCategoryName = (categoryNumber) => {
    for (const parent of sDesk_t2_category_dataset) {
      for (const subcategory of parent.subcategories) {
        const item = subcategory.items.find(
          item => item.grandchild_category_number === categoryNumber
        );
        if (item) {
          return item.grandchild_category_name;
        }
      }
    }
    return categoryNumber;
  };

  const getUserName = (serviceNumber) => {
    const user = users.find(user => user.service_number === serviceNumber);
    return user ? user.user_name : serviceNumber;
  };

  const getLocationName = (locationCode) => {
    for (const district of sDesk_t2_location_dataset) {
      const location = district.sublocations.find(loc => loc.loc_number === locationCode);
      if (location) {
        return location.loc_name;
      }
    }
    return locationCode;
  };
  // Loading and error states
  if (loading) {
    return (
      <div className="AdminMyAssignedIncidents-main-content">
        <div className="AdminMyAssignedIncidents-direction-bar">
          Incidents {'>'} My Assigned Incidents
        </div>
        <div className="AdminMyAssignedIncidents-content2">
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
      <div className="AdminMyAssignedIncidents-main-content">
        <div className="AdminMyAssignedIncidents-direction-bar">
          Incidents {'>'} My Assigned Incidents
        </div>
        <div className="AdminMyAssignedIncidents-content2">
          <div className="error-container">
            <p>Error loading assigned incidents: {error}</p>
            <button onClick={() => dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }))}>
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
    rawCategory: item.category,
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
    const incident = assignedToMe.find(item => item.incident_number === refNo);
    if (incident) {
      const informant = users.find(user => user.service_number === incident.informant);
      if (informant) {
        navigate('/admin/AdminUpdateIncident', {
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
              location: getLocationName(incident.location),
              priority: incident.priority,
            },
          },
        });
      }
    }
  };

  const renderTableRows = () => {
    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
            No incidents found.
          </td>
        </tr>
      );
    }

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

  const uniqueCategories = [...new Set(tableData.map(item => item.rawCategory))]
    .map(catNumber => ({
      number: catNumber,
      name: getCategoryName(catNumber),
    }));

  return (
    <div className="AdminMyAssignedIncidents-main-content">
      <div className="AdminMyAssignedIncidents-tickets-creator flex flex-row items-center gap-2 whitespace-nowrap">
        <span className="AdminMyAssignedIncidents-svr-desk">Incidents</span>
        <IoIosArrowForward style={{ position: 'relative', top: '4px' }} />
        <span className="AdminMyAssignedIncidents-created-ticket">My Assigned Incidents</span>
      </div>
      <div className="AdminMyAssignedIncidents-content2">
        <div className="AdminMyAssignedIncidents-TitleBar">
          <div className="AdminMyAssignedIncidents-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            My Assigned Incidents - {loggedInUser ? loggedInUser.userName : ''}
          </div>
          <div className="AdminMyAssignedIncidents-TitleBar-buttons">
            <button className="AdminMyAssignedIncidents-TitleBar-buttons-ExportData">
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="AdminMyAssignedIncidents-showSearchBar flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div className="AdminMyAssignedIncidents-showSearchBar-Show flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <span>Entries:</span>
              <select 
                onChange={e => setRowsPerPage(Number(e.target.value))} 
                value={rowsPerPage} 
                className="AdminMyAssignedIncidents-showSearchBar-Show-select w-full sm:w-24"
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
                className="AdminMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-32"
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
                className="AdminMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-40"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat.number} value={cat.number}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="AdminMyAssignedIncidents-showSearchBar-SearchBar flex items-center gap-2 w-full sm:w-64">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="AdminMyAssignedIncidents-showSearchBar-SearchBar-input w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="AdminMyAssignedIncidents-table">
          <div className="hidden sm:block">
            <table className="AdminMyAssignedIncidents-table-table w-full">
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
            {/* Mobile view is disabled like in technician version */}
          </div>
        </div>

        <div className='AdminMyAssignedIncidents-footer-content'>
          <div className="AdminMyAssignedIncidents-content3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="AdminMyAssignedIncidents-content3-team-pagination-buttons flex gap-2 flex-wrap">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
              {renderPaginationButtons()}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMyAssignedIncidents;
