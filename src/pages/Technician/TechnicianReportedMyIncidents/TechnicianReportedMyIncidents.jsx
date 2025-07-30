import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { fetchAssignedByMeRequest, fetchIncidentHistoryRequest } from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import './TechnicianReportedMyIncidents.css';

const TechnicianReportedMyIncidents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { assignedByMe, loading, error, incidentHistory } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth); // Get logged-in user from auth slice
  const { allUsers } = useSelector((state) => state.sltusers);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Fetch incidents reported by the logged-in technician and all users
  useEffect(() => {
    if (user && user.role === 'technician' && user.serviceNum) {
      dispatch(fetchAssignedByMeRequest({ serviceNum: user.serviceNum }));
    }
    dispatch(fetchAllUsersRequest());
  }, [dispatch, user]);
  
  if (loading) {
    return (
      <div className="TechnicianReportedMyIncidents-main-content">
        <div className="TechnicianReportedMyIncidents-direction-bar">
          Incidents {'>'} My Reported Incidents
        </div>
        <div className="TechnicianReportedMyIncidents-content2">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading reported incidents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="TechnicianReportedMyIncidents-main-content">
        <div className="TechnicianReportedMyIncidents-direction-bar">
          Incidents {'>'} My Reported Incidents
        </div>
        <div className="TechnicianReportedMyIncidents-content2">
          <div className="error-container">
            <p>Error loading reported incidents: {error}</p>
            <button onClick={() => dispatch(fetchAssignedByMeRequest({ serviceNum: user.serviceNum }))}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tableData = (assignedByMe || []).map(item => ({
    refNo: item.incident_number,
    category: item.category, // Category name from backend
    status: item.status,
    priority: item.priority,
    informant: item.informant, // service_number of the reporter
  }));

  const filteredData = tableData.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const handleRowClick = (refNo) => {
    const incident = assignedByMe.find(item => item.incident_number === refNo);
    if (incident) {
        setSelectedIncident(incident);
        setIsPopupVisible(true);
        dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
    }
  };

  const renderTableRows = () => {
    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row.refNo)}
        style={{ cursor: 'pointer' }}
      >
        <td className='TechnicianReportedMyIncidents-refno'>{row.refNo}</td>
        <td>{row.category}</td>
        <td className='TechnicianReportedMyIncidents-status-text'>{row.status}</td>
        <td>{row.priority}</td>
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

  const renderPopup = () => {
    if (!isPopupVisible || !selectedIncident) {
        return null;
    }

    const formData = {
        serviceNo: user.serviceNum,
        tpNumber: user.tp_number || user.tpNumber || user.contactNumber ||  '',
        name: user.user_name || user.name || user.email,
        designation: user.designation || user.role || '',
        email: user.email,
    };

    const incidentDetails = {
        refNo: selectedIncident.incident_number,
        category: selectedIncident.category,
        location: selectedIncident.location,
        priority: selectedIncident.priority,
        status: selectedIncident.status,
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={() => setIsPopupVisible(false)}>X</button>
                <div className="TechnicianMyReportedUpdate-tickets-creator">
                    <span className="TechnicianMyReportedUpdate-svr-desk">Incidents</span>
                    <IoIosArrowForward />
                    <span className="TechnicianMyReportedUpdate-created-ticket">Reported My Update</span>
                </div>
                <div className="TechnicianMyReportedUpdate-content2">
                    <AffectedUserDetail formData={formData} />
                    <IncidentHistory
                        refNo={incidentDetails.refNo}
                        category={incidentDetails.category}
                        location={incidentDetails.location}
                        priority={incidentDetails.priority}
                        status={incidentDetails.status}
                        historyData={incidentHistory}
                        users={allUsers}
                    />
                </div>
            </div>
        </div>
    );
};


  const uniqueCategories = [...new Set(tableData.map(item => item.category))];

  if (!user) {
    return <div>Loading user data...</div>;
  }
  if (!user.serviceNum) {
    return <div>User data missing serviceNum. Please contact admin.</div>;
  }
  if (user.role !== 'technician') {
    return <div>Unauthorized: Only technicians can view this page.</div>;
  }

  return (
    <div className="TechnicianReportedMyIncidents-main-content">
        {renderPopup()}
      <div className="TechnicianReportedMyIncidents-tickets-creator">
        <span className="TechnicianReportedMyIncidents-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="TechnicianReportedMyIncidents-created-ticket">Reported My</span>
      </div>

      <div className="TechnicianReportedMyIncidents-content2">
        <div className="TechnicianReportedMyIncidents-TitleBar">
          <div className="TechnicianReportedMyIncidents-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            My Incidents - {user.name || user.email}
          </div>
          <div className="TechnicianReportedMyIncidents-TitleBar-buttons">
            <button className="TechnicianReportedMyIncidents-TitleBar-buttons-ExportData">
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        
        <div className="TechnicianReportedMyIncidents-showSearchBar container-fluid p-0">
          <div className="row m-0 w-100">
            <div className="col-md-7 col-lg-8 p-0">
              <div className="TechnicianReportedMyIncidents-showSearchBar-Show d-flex flex-wrap align-items-center">
                <div className="d-flex align-items-center me-3 mb-2 mb-sm-0">
                  Entries:
                  <select
                    onChange={e => setRowsPerPage(Number(e.target.value))}
                    value={rowsPerPage}
                    className="TechnicianReportedMyIncidents-showSearchBar-Show-select ms-2"
                  >
                    {[10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>{size} entries</option>
                    ))}
                  </select>
                </div>
                <div className="d-flex align-items-center me-3 mb-2 mb-sm-0">
                  Status:
                  <select
                    onChange={e => setStatusFilter(e.target.value)}
                    value={statusFilter}
                    className="TechnicianReportedMyIncidents-showSearchBar-Show-select ms-2"
                  >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Hold">Hold</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="d-flex align-items-center mb-2 mb-sm-0">
                  Category:
                  <select
                    onChange={e => setCategoryFilter(e.target.value)}
                    value={categoryFilter}
                    className="TechnicianReportedMyIncidents-showSearchBar-Show-select2 ms-2"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-5 col-lg-4 p-0 d-flex justify-content-md-end justify-content-start mt-2 mt-md-0">
              <div className="TechnicianReportedMyIncidents-showSearchBar-SearchBar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="TechnicianReportedMyIncidents-showSearchBar-SearchBar-input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="TechnicianReportedMyIncidents-table">
          <table className="TechnicianReportedMyIncidents-table-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        <div className="TechnicianReportedMyIncidents-content3">
          <span className="TechnicianReportedMyIncidents-content3-team-entry-info">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="TechnicianReportedMyIncidents-content3-team-pagination-buttons">
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

export default TechnicianReportedMyIncidents;
