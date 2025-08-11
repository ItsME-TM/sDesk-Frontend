import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';
import { sDesk_t2_location_dataset } from '../../../data/sDesk_t2_location_dataset';
import { useNavigate } from 'react-router-dom';
import { fetchAssignedToMeRequest } from '../../../redux/incident/incidentSlice';
import './AdminMyAssignedIncidents.css';

const AdminMyAssignedIncidents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { assignedToMe, loading, error } = useSelector((state) => state.incident);
  
  const currentAdmin = sDesk_t2_users_dataset.find(
    user => user.service_number === 'SV001' && user.role === 'admin'
  );

  const assignedUser = currentAdmin ? currentAdmin.service_number : null;
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch assigned incidents on component mount
  useEffect(() => {
    if (assignedUser) {
      dispatch(fetchAssignedToMeRequest(assignedUser));
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
    const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
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
            <button onClick={() => dispatch(fetchAssignedToMeRequest(assignedUser))}>
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
      const informant = sDesk_t2_users_dataset.find(user => user.service_number === incident.informant);
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
    <div className="AdminMyAssignedIncidents-main-content bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen">
      {/* Responsive direction bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-base font-semibold text-purple-700 bg-gradient-to-r from-white via-purple-50 to-pink-50 shadow mb-4 rounded-lg border border-purple-200">
        <span>Incidents</span>
        <span className="mx-1 text-pink-500">{'>'}</span>
        <span>My Assigned Incidents</span>
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-3 text-2xl font-bold text-blue-700 drop-shadow">
            <FaHistory size={28} className="text-pink-500" />
            <span>My Assigned Incidents - <span className="text-purple-600">{currentAdmin.user_name}</span></span>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition text-base font-semibold border-2 border-blue-300">
            <TiExportOutline className="text-yellow-200" />
            Export Data
          </button>
        </div>
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6 w-full">
          <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-6 w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
              <span className="font-semibold text-blue-700">Entries:</span>
              <select
                onChange={e => setRowsPerPage(Number(e.target.value))}
                value={rowsPerPage}
                className="border-2 border-blue-300 rounded-lg px-3 py-2 text-base w-full md:w-32 bg-blue-50 focus:ring-2 focus:ring-blue-400"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} entries</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
              <span className="font-semibold text-purple-700">Status:</span>
              <select
                onChange={e => setStatusFilter(e.target.value)}
                value={statusFilter}
                className="border-2 border-purple-300 rounded-lg px-3 py-2 text-base w-full md:w-36 bg-purple-50 focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Hold">Hold</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
              <span className="font-semibold text-pink-700">Category:</span>
              <select
                onChange={e => setCategoryFilter(e.target.value)}
                value={categoryFilter}
                className="border-2 border-pink-300 rounded-lg px-3 py-2 text-base w-full md:w-44 bg-pink-50 focus:ring-2 focus:ring-pink-400"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat.number} value={cat.number}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 border-2 border-purple-300 rounded-lg px-3 py-2 bg-white w-full md:w-72 shadow focus-within:ring-2 focus-within:ring-purple-400">
            <FaSearch className="text-pink-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="outline-none w-full text-base bg-transparent text-purple-700 placeholder:text-purple-400"
            />
          </div>
        </div>
        {/* Responsive Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-blue-200">
          <table className="min-w-full text-base">
            <thead className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
              <tr>
                <th className="px-4 py-3 text-left text-blue-700 font-bold">Ref No</th>
                <th className="px-4 py-3 text-left text-purple-700 font-bold">Affected User</th>
                <th className="px-4 py-3 text-left text-pink-700 font-bold">Category</th>
                <th className="px-4 py-3 text-left text-green-700 font-bold">Status</th>
                <th className="px-4 py-3 text-left text-blue-700 font-bold">Assigned Technician</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => {
                const incident = assignedToMe.find(item => item.incident_number === row.refNo);
                const technician = incident ? sDesk_t2_users_dataset.find(u => u.service_number === incident.technician) : null;
                return (
                  <tr key={idx} className="border-b hover:bg-blue-50 cursor-pointer transition-all duration-150" onClick={() => handleRowClick(row.refNo)}>
                    <td className="px-4 py-3 text-blue-700 font-semibold underline">{row.refNo}</td>
                    <td className="px-4 py-3 text-purple-700">{row.affectedUser}</td>
                    <td className="px-4 py-3 text-pink-700">{row.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 ${row.status === 'Open' ? 'bg-green-200 text-green-800 border-green-400' : row.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800 border-yellow-400' : row.status === 'Hold' ? 'bg-orange-200 text-orange-800 border-orange-400' : 'bg-gray-200 text-gray-700 border-gray-400'}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-blue-700">{technician ? technician.user_name : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <span className="text-base text-purple-700 font-semibold">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border-2 border-blue-300 bg-white text-blue-700 font-bold disabled:opacity-50 shadow">Previous</button>
            {renderPaginationButtons()}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border-2 border-blue-300 bg-white text-blue-700 font-bold disabled:opacity-50 shadow">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMyAssignedIncidents;