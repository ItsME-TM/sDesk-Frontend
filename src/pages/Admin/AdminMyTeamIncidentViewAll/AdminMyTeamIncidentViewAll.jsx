import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllIncidentsRequest } from '../../../redux/incident/incidentSlice';
import { fetchMainCategoriesRequest, fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { useNavigate } from 'react-router-dom';
import './AdminMyTeamIncidentViewAll.css';

const AdminMyTeamIncidentViewAll = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

 
  const { incidents, loading, error } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);
  const { mainCategories, categoryItems } = useSelector((state) => state.categories);
  const { locations } = useSelector((state) => state.location);
  const { users } = useSelector((state) => state.sltusers);

  const currentAdmin = user;

  
  useEffect(() => {
    dispatch(fetchAllIncidentsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchLocationsRequest());
    dispatch(fetchAllUsersRequest());
  }, [dispatch]);

  if (!user) {
    return <div>Error: User not found. Please login again.</div>;
  }

  if (!currentAdmin) {
    return <div>Error: Admin user not found.</div>;
  }

  const adminTeam = currentAdmin.parent_category_name || 'Unknown Team';

  const getMainCategoryNameFromDatabase = (categoryItemCode) => {
   
    const categoryItem = categoryItems.find(cat => cat.category_code === categoryItemCode);
    if (categoryItem) {
      return categoryItem.subCategory?.mainCategory?.name || 'Unknown';
    }

    const categoryByName = categoryItems.find(cat => 
      cat.name && 
      cat.name.toLowerCase() === categoryItemCode.toLowerCase()
    );
    if (categoryByName) {
      return categoryByName.subCategory?.mainCategory?.name || 'Unknown';
    }
  
    const mainCategory = mainCategories.find(mainCat => 
      mainCat.category_code === categoryItemCode || mainCat.name === categoryItemCode
    );
    if (mainCategory) {
      return mainCategory.name;
    }
    
    return 'Unknown';
  };

  const getCategoryName = (categoryNumber) => {
    const category = categoryItems.find(cat => cat.category_code === categoryNumber);
    return category ? category.name : categoryNumber;
  };

  const getSubcategoryName = (categoryNumber) => {
    const category = categoryItems.find(cat => cat.category_code === categoryNumber);
    return category ? category.subCategory?.name || 'Unknown' : 'Unknown';
  };

  const getUserName = (serviceNumber) => {
    const foundUser = users.find(user => user.service_number === serviceNumber || user.serviceNum === serviceNumber);
    return foundUser ? foundUser.user_name || foundUser.display_name : serviceNumber;
  };

  const getLocationName = (locationCode) => {
    const location = locations.find(loc => loc.loc_number === locationCode);
    return location ? location.loc_name : locationCode;
  };

  
  const incidentsToUse = incidents || [];

  const transformedTeamIncidents = incidentsToUse.map((dbIncident) => {
    return {
      incident_number: dbIncident.incident_number,
      informant: dbIncident.informant,
      location: dbIncident.location,
      handler: dbIncident.handler,
      update_by: dbIncident.update_by,
      category: dbIncident.category,
      update_on: dbIncident.update_on,
      status: dbIncident.status,
      priority: dbIncident.priority,
      description: dbIncident.description,
      notify_informant: dbIncident.notify_informant,
      urgent_notification_to: dbIncident.urgent_notification_to,
      Attachment: dbIncident.Attachment
    };
  });

  const tableData = transformedTeamIncidents.map(incident => ({
    refNo: incident.incident_number,
    assignedTo: incident.handler,
    affectedUser: incident.informant, 
    category: incident.category, 
    subcategory: incident.category, 
    mainCategory: getMainCategoryNameFromDatabase(incident.category), 
    status: incident.status,
    location: incident.location, 
    rawCategory: incident.category,
  }));

  const filteredData = tableData.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
   
    let matchesCategory = true;
    if (categoryFilter) {
      const itemMainCategory = item.mainCategory;
      matchesCategory = itemMainCategory === categoryFilter;
    }
    
    const finalMatch = matchesSearch && matchesStatus && matchesCategory;
    
    return finalMatch;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const handleRowClick = (refNo) => {
    const incident = transformedTeamIncidents.find(item => item.incident_number === refNo);
    if (incident) {
      const informant = users.find(user => 
        user.service_number === incident.informant || user.serviceNum === incident.informant
      );
      if (informant) {
        navigate('/admin/AdminUpdateIncident', {
          state: {
            formData: {
              serviceNo: informant.service_number || informant.serviceNum,
              tpNumber: informant.tp_number,
              name: informant.user_name || informant.display_name,
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
    if (loading) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
            Loading incidents...
          </td>
        </tr>
      );
    }
        
    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
            {error ? `Error: ${error}` : 'No incidents found.'}
          </td>
        </tr>
      );
    }
    
    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row.refNo)}
        style={{ cursor: 'pointer' }}
      >
        <td className='team-refno'>{row.refNo}</td>
        <td>{getUserName(row.assignedTo)}</td>
        <td>{getUserName(row.affectedUser)}</td>
        <td>{getCategoryName(row.category)}</td>
        <td>{getLocationName(row.location)}</td>
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

  if (error) {
    return (
      <div className="AdminincidentViewAll-main-content">
        <div className="AdminincidentViewAll-direction-bar">
          Incidents {'>'} My Team Incidents
        </div>
        <div className="AdminincidentViewAll-content2">
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            Error loading incidents: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminincidentViewAll-main-content">
      <div className="AdminincidentViewAll-direction-bar">
        Incidents {'>'} My Team Incidents
      </div>
      <div className="AdminincidentViewAll-content2">
        <div className="AdminincidentViewAll-TitleBar">
          <div className="AdminincidentViewAll-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            {adminTeam} - Incident Log
          </div>
          <div className="AdminincidentViewAll-TitleBar-buttons">
            <button className="AdminincidentViewAll-TitleBar-buttons-ExportData">
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        <div className="AdminincidentViewAll-showSearchBar">
          <div className="AdminincidentViewAll-showSearchBar-Show">
            Entries:
            <select
              onChange={e => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
              className="AdminincidentViewAll-showSearchBar-Show-select"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} entries</option>
              ))}
            </select>
            Status:
            <select
              onChange={e => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="AdminincidentViewAll-showSearchBar-Show-select"
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
              className="AdminincidentViewAll-showSearchBar-Show-select2"
            >
              <option value="">All Categories</option>
              {mainCategories && mainCategories.map(category => (
                <option key={category.category_code || category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="AdminincidentViewAll-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="AdminincidentViewAll-showSearchBar-SearchBar-input"
            />
          </div>
        </div>
        <div className="AdminincidentViewAll-table">
          <table className="AdminincidentViewAll-table-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Assigned To</th>
                <th>Affected User</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        <div className="AdminincidentViewAll-content3">
          <span className="AdminincidentViewAll-content3-team-entry-info">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="AdminincidentViewAll-content3-team-pagination-buttons">
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

export default AdminMyTeamIncidentViewAll;