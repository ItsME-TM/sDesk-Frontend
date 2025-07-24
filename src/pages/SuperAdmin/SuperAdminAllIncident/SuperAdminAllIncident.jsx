import React, { useState, useEffect } from "react";
import TechnicianInsident from "../../Technician/TechnicianIncident/TechnicianInsident";
import { FaHistory, FaSearch } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminTeamDataRequest } from "../../../redux/incident/incidentSlice";
import { useNavigate } from "react-router-dom";
import "./SuperAdminAllIncident.css";

const SuperAdminAllIncident = () => {
  const [showIncidentPopup, setShowIncidentPopup] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Remove local state for fetched data, use Redux selectors instead

  // Use Redux selectors for all required data
  const {
    incidents,
    loading,
    error,
    mainCategories,
    categoryItems,
    users,
    locations,
  } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);

  console.log("Redux state - incidents:", incidents);
  console.log("Redux state - loading:", loading);
  console.log("Redux state - error:", error);
  console.log("Redux state - user:", user);

  const currentUser = user;

  // Remove directIncidents state, only use Redux state

  useEffect(() => {
    // Dispatch a single saga action to fetch all required data for super admin
    dispatch(fetchAdminTeamDataRequest());
  }, [dispatch, user]);

  if (!user) {
    return <div>Error: User not found. Please login again.</div>;
  }

  if (!currentUser) {
    return <div>Error: Admin user not found.</div>;
  }

  // Use Redux state for categoryItems/mainCategories
  const getMainCategoryNameFromDatabase = (categoryItemCode) => {
    // First, try to find from the loaded categoryItems
    const categoryItem = categoryItems?.find(
      (cat) => cat.grandchild_category_number === categoryItemCode
    );
    if (categoryItem) {
      return categoryItem.parent_category_name;
    }
    // If not found in categoryItems, search by name
    const categoryByName = categoryItems?.find(
      (cat) =>
        cat.grandchild_category_name &&
        cat.grandchild_category_name.toLowerCase() ===
          String(categoryItemCode).toLowerCase()
    );
    if (categoryByName) {
      return categoryByName.parent_category_name;
    }
    // Check if the code itself is a main category
    const mainCategory = mainCategories?.find(
      (mainCat) =>
        mainCat.category_code === categoryItemCode ||
        mainCat.parent_category_number === categoryItemCode
    );
    if (mainCategory) {
      return mainCategory.name || mainCategory.parent_category_name;
    }
    return "Unknown";
  };

  const getCategoryName = (categoryNumber) => {
    const category = categoryItems?.find(
      (cat) => cat.grandchild_category_number === categoryNumber
    );
    return category ? category.grandchild_category_name : categoryNumber;
  };

  const getSubcategoryName = (categoryNumber) => {
    const category = categoryItems?.find(
      (cat) => cat.grandchild_category_number === categoryNumber
    );
    return category ? category.child_category_name : "Unknown";
  };

  const getUserName = (serviceNumber) => {
    const foundUser = users?.find(
      (user) => user.service_number === serviceNumber
    );
    return foundUser ? foundUser.user_name : serviceNumber;
  };

  const getLocationName = (locationCode) => {
    const location = locations?.find((loc) => loc.loc_number === locationCode);
    return location ? location.loc_name : locationCode;
  };

  // Only use incidents from Redux state
  const incidentsToUse = incidents || [];

  console.log("=== DEBUGGING DATA FLOW ===");
  console.log("Redux incidents:", incidents);
  // Removed reference to directIncidents (no longer used)
  console.log("Using incidents:", incidentsToUse);
  console.log("Current user:", currentUser);
  console.log("CategoryItems loaded:", categoryItems?.length || 0);
  console.log("Main categories loaded:", mainCategories?.length || 0);
  console.log("Main categories data:", mainCategories);
  console.log("Users loaded:", users?.length || 0);
  console.log("Locations loaded:", locations?.length || 0);

  const processedIncidents = [];

  if (incidentsToUse && incidentsToUse.length > 0) {
    incidentsToUse.forEach((dbIncident, index) => {
      console.log(`Processing incident ${index}:`, dbIncident);
      console.log(`Incident category:`, dbIncident.category);

      const processedIncident = {
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
        notify_infromant: dbIncident.notify_informant,
        Attachment: dbIncident.Attachment,
      };

      processedIncidents.push(processedIncident);
    });
  }

  console.log("Processed incidents:", processedIncidents);

  const transformedTeamIncidents = processedIncidents;

  console.log("Final team incidents for table:", transformedTeamIncidents);

  const tableData = transformedTeamIncidents.map((incident) => ({
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

  console.log("Table data:", tableData);
  console.log(
    "Table data with main categories:",
    tableData.map((item) => ({
      refNo: item.refNo,
      rawCategory: item.rawCategory,
      mainCategory: item.mainCategory,
    }))
  );
  console.log(
    "Available main categories for dropdown:",
    mainCategories.map((cat) => cat.name || cat.parent_category_name)
  );
  console.log("Sample categoryItems array:", categoryItems?.slice(0, 3));
  console.log("Unique incident categories:", [
    ...new Set(tableData.map((item) => item.rawCategory)),
  ]);
  console.log("Unique main categories from incidents:", [
    ...new Set(tableData.map((item) => item.mainCategory)),
  ]);
  console.log("Category filter value:", categoryFilter);

  const filteredData = tableData.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    // Category filtering with improved logic
    let matchesCategory = true;
    if (categoryFilter) {
      const itemMainCategory = item.mainCategory;
      matchesCategory = itemMainCategory === categoryFilter;

      console.log("Category filtering debug:", {
        refNo: item.refNo,
        rawCategory: item.rawCategory,
        itemMainCategory,
        categoryFilter,
        matchesCategory,
      });
    }

    const finalMatch = matchesSearch && matchesStatus && matchesCategory;

    if (categoryFilter) {
      console.log("Final filtering result:", {
        refNo: item.refNo,
        matchesSearch,
        matchesStatus,
        matchesCategory,
        finalMatch,
      });
    }

    return finalMatch;
  });

  console.log("Filtered data:", filteredData);
  console.log("Search term:", searchTerm);
  console.log("Status filter:", statusFilter);
  console.log("Category filter:", categoryFilter);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  console.log("Current rows for display:", currentRows);

  const handleRowClick = (refNo) => {
    const incident = transformedTeamIncidents.find(
      (item) => item.incident_number === refNo
    );
    if (incident) {
      setSelectedIncident(incident);
      setShowIncidentPopup(true);
    }
  };

  const renderTableRows = () => {
    console.log("=== RENDERING TABLE ROWS ===");
    console.log("Current rows:", currentRows);
    console.log("Current rows length:", currentRows.length);

    if (currentRows.length === 0) {
      return (
        <>
          <tr>
            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
              DEBUG: No incidents found.
              <br />
              Total incidents: {transformedTeamIncidents.length}
              <br />
              Filtered: {filteredData.length}
              <br />
              Redux loading: {loading ? "true" : "false"}
              <br />
              Redux error: {error || "none"}
              <br />
            </td>
          </tr>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <td className="team-refno">TEST001</td>
            <td>Test Technician</td>
            <td>Test User</td>
            <td>Test Category</td>
            <td>Test Location</td>
            <td className="team-status-text">Open</td>
          </tr>
        </>
      );
    }

    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row.refNo)}
        style={{ cursor: "pointer" }}
      >
        <td className="team-refno">
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
        <td>{row.assignedTo}</td>
        <td>{row.affectedUser}</td>
        <td>{row.category}</td>
        <td>{row.location}</td>
        <td className="team-status-text">{row.status}</td>
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
          className={currentPage === i + 1 ? "active" : ""}
        >
          {i + 1}
        </button>
      ));
    }

    buttons.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={currentPage === 1 ? "active" : ""}
      >
        1
      </button>,
      <button
        key={2}
        onClick={() => setCurrentPage(2)}
        className={currentPage === 2 ? "active" : ""}
      >
        2
      </button>
    );

    if (currentPage > 3) buttons.push(<span key="ellipsis1">...</span>);

    if (currentPage > 3 && currentPage < totalPages - 2) {
      buttons.push(
        <button
          key={currentPage}
          onClick={() => setCurrentPage(currentPage)}
          className="active"
        >
          {currentPage}
        </button>
      );
    }

    if (currentPage < totalPages - 2)
      buttons.push(<span key="ellipsis2">...</span>);

    buttons.push(
      <button
        key={totalPages - 1}
        onClick={() => setCurrentPage(totalPages - 1)}
        className={currentPage === totalPages - 1 ? "active" : ""}
      >
        {totalPages - 1}
      </button>,
      <button
        key={totalPages}
        onClick={() => setCurrentPage(totalPages)}
        className={currentPage === totalPages ? "active" : ""}
      >
        {totalPages}
      </button>
    );

    return buttons;
  };

  if (error) {
    return (
      <div className="SuperAdminincidentViewAll-main-content">
        <div className="SuperAdminincidentViewAll-direction-bar">
          Incidents {">"} All Incidents
        </div>
        <div className="SuperAdminincidentViewAll-content2">
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            Error loading incidents: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="SuperAdminincidentViewAll-main-content">
      <div className="SuperAdminincidentViewAll-direction-bar">
        Incidents {">"} All Incidents
      </div>
      <div className="SuperAdminincidentViewAll-content2">
        <div className="SuperAdminincidentViewAll-TitleBar">
          <div className="SuperAdminincidentViewAll-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            All Incidents Log
          </div>
          <div className="SuperAdminincidentViewAll-TitleBar-buttons">
            <button className="SuperAdminincidentViewAll-TitleBar-buttons-ExportData">
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        <div className="SuperAdminincidentViewAll-showSearchBar">
          <div className="SuperAdminincidentViewAll-showSearchBar-Show">
            Entries:
            <select
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
              className="SuperAdminincidentViewAll-showSearchBar-Show-select"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} entries
                </option>
              ))}
            </select>
            Status:
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="SuperAdminincidentViewAll-showSearchBar-Show-select"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Hold">Hold</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            Category:
            <select
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
              className="SuperAdminincidentViewAll-showSearchBar-Show-select2"
            >
              <option value="">All Categories</option>
              {mainCategories?.map((category) => (
                <option
                  key={
                    category.category_code || category.parent_category_number
                  }
                  value={category.name || category.parent_category_name}
                >
                  {category.name || category.parent_category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="SuperAdminincidentViewAll-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="SuperAdminincidentViewAll-showSearchBar-SearchBar-input"
            />
          </div>
        </div>
        <div className="SuperAdminincidentViewAll-table">
          <table className="SuperAdminincidentViewAll-table-table">
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
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
        <div className="SuperAdminincidentViewAll-content3">
          <span className="SuperAdminincidentViewAll-content3-team-entry-info">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="SuperAdminincidentViewAll-content3-team-pagination-buttons">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
        {showIncidentPopup && selectedIncident && (
          <div className="incident-popup-overlay">
            <div className="incident-popup-content">
              <button
                className="incident-popup-close-btn"
                onClick={() => setShowIncidentPopup(false)}
              >
                X
              </button>
              <TechnicianInsident
                incidentData={selectedIncident}
                isPopup={true}
                loggedInUser={user}
                updateBy={
                  user?.name ||
                  user?.user_name ||
                  user?.display_name ||
                  user?.email
                }
                affectedUserDetails={(() => {
                  const affectedUser = users?.find(
                    (u) =>
                      u.service_number === selectedIncident?.informant ||
                      u.serviceNum === selectedIncident?.informant
                  );
                  return {
                    serviceNo: selectedIncident?.informant,
                    name:
                      affectedUser?.display_name ||
                      affectedUser?.user_name ||
                      "",
                    designation: affectedUser?.role || "",
                    email: affectedUser?.email || "",
                  };
                })()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminAllIncident;
