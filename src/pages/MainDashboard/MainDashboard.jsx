import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./MainDashboard.css";
import { FaBell, FaSnowflake, FaTag, FaTruck } from "react-icons/fa";
import { fetchDashboardStatsRequest } from "../../redux/incident/incidentSlice";
import { fetchMainCategoriesRequest } from "../../redux/categories/categorySlice";

function MainDashboard() {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector(
    (state) => state.incident
  );
  const { mainCategories } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);

  const userType = user?.userType || user?.role || user?.type || "Unknown";
  const userParentCategory = "PAC001";

  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
    if (isTechnician && user?.id) {
      dispatch(
        fetchDashboardStatsRequest({
          userParentCategory,
          userType,
          technicianId: user.id,
        })
      );
    } else if (userType === "admin" && user?.teamName) {
      dispatch(
        fetchDashboardStatsRequest({
          userParentCategory,
          userType,
          teamName: user.teamName,
        })
      );
    } else {
      dispatch(fetchDashboardStatsRequest({ userParentCategory, userType }));
    }
  }, [dispatch, userParentCategory, userType, user?.id, user?.teamName, isTechnician]);

  const cardData = [
    { title: "Open", color: "#f5a623", icon: <FaBell /> },
    { title: "Hold", color: "#00c4b4", icon: <FaSnowflake /> },
    { title: "In Progress", color: "#4a90e2", icon: <FaTag /> },
    { title: "Closed", color: "#007bff", icon: <FaTruck /> },
  ];

  // Determine user role for data filtering
  const isSuperAdmin = 
    userType.toLowerCase().includes("superadmin") ||
    userType.toLowerCase().includes("super admin") ||
    userType.toLowerCase() === "superadmin" ||
    userType.toLowerCase() === "super admin" ||
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "super admin";

  const isTechnician = userType.toLowerCase() === "technician";

  console.log('[MainDashboard] User info:', { userType, isSuperAdmin, isTechnician, user });
  console.log('[MainDashboard] Dashboard stats:', dashboardStats);

  let cardCounts = {};
  let cardSubCounts = {};

  if (isSuperAdmin) {
    // For Super Admin: card value = today's count, total = all-time count
    const totalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
    
    // Extract today's counts from overallStatusCounts
    cardCounts = {
      "Open": totalCounts["Open (Today)"] || 0,
      "Hold": totalCounts["Hold (Today)"] || 0,
      "In Progress": totalCounts["In Progress (Today)"] || 0,
      "Closed": totalCounts["Closed (Today)"] || 0,
    };
    
    // Total counts for all time
    cardSubCounts = {
      "Open": totalCounts["Open"] || 0,
      "Hold": totalCounts["Hold"] || 0,
      "In Progress": totalCounts["In Progress"] || 0,
      "Closed": totalCounts["Closed"] || 0,
    };
  } else if (isTechnician) {
    // For Technician: card value = today's assigned incidents, total = all assigned incidents
    const totalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
    
    // Today's incidents assigned to this technician
    cardCounts = {
      "Open": totalCounts["Open (Today)"] || 0,
      "Hold": totalCounts["Hold (Today)"] || 0,
      "In Progress": totalCounts["In Progress (Today)"] || 0,
      "Closed": totalCounts["Closed (Today)"] || 0,
    };
    
    // Total incidents ever assigned to this technician
    cardSubCounts = {
      "Open": totalCounts["Open"] || 0,
      "Hold": totalCounts["Hold"] || 0,
      "In Progress": totalCounts["In Progress"] || 0,
      "Closed": totalCounts["Closed"] || 0,
    };
  } else {
    // For other user types, use existing logic
    cardCounts = dashboardStats?.todayStatusCounts || {};
    cardSubCounts = dashboardStats?.totalStatusCounts || {};
  }

  if (loading) {
    return (
      <div className="MainDashboard-main-content">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-loading-container">
          <div className="MainDashboard-loading-spinner"></div>
          <p className="MainDashboard-loading-text">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="MainDashboard-main-content">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-error-container">
          <div className="MainDashboard-error-icon">⚠️</div>
          <h3 className="MainDashboard-error-title">Error Loading Dashboard</h3>
          <p className="MainDashboard-error-message">{error}</p>
          <button
            className="MainDashboard-retry-button"
            onClick={() => {
              dispatch(fetchMainCategoriesRequest());
              if (isTechnician && user?.id) {
                dispatch(
                  fetchDashboardStatsRequest({
                    userParentCategory,
                    userType,
                    technicianId: user.id,
                  })
                );
              } else if (userType === "Admin" && user?.teamName) {
                dispatch(
                  fetchDashboardStatsRequest({
                    userParentCategory,
                    userType,
                    teamName: user.teamName,
                  })
                );
              } else {
                dispatch(fetchDashboardStatsRequest({ userParentCategory, userType }));
              }
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const username = user?.name;

  return (
    <div className="MainDashboard-main-content">
      <div className="MainDashboard-header">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-welcome-section">
          <h1 className="MainDashboard-title">Welcome {username}</h1>
          <p className="MainDashboard-subtitle">
            Monitor your team's incident management performance
          </p>
        </div>
      </div>

      <div className="MainDashboard-cards-container">
        {cardData.map((card, index) => (
          <div key={index} className="MainDashboard-white-box">
            <div
              className="MainDashboard-colored-card"
              style={{ backgroundColor: card.color }}
            >
              <div className="MainDashboard-card-icon">{card.icon}</div>
            </div>
            <div className="MainDashboard-card-content">
              <h3 className="MainDashboard-card-title">{card.title}</h3>
              <div className="MainDashboard-card-value">
                {cardCounts[card.title] || 0}
              </div>
              <div className="MainDashboard-card-subvalue">
                <span className="MainDashboard-card-label">Today's Count</span>
              </div>
              <div className="MainDashboard-card-total">
                <span className="MainDashboard-card-total-label">Total: </span>
                <span className="MainDashboard-card-total-value">
                  {cardSubCounts[card.title] || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="MainDashboard-stats-summary">
        <div className="MainDashboard-summary-card">
          <h3>Quick Stats</h3>
          <div className="MainDashboard-summary-grid">
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                Total Incidents
              </span>
              <span className="MainDashboard-summary-value">
                {Object.values(cardSubCounts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                Today's Activity
              </span>
              <span className="MainDashboard-summary-value">
                {Object.values(cardCounts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                {isTechnician ? "High Priority (Today)" : "Unresolved (Today)"}
              </span>
              <span className="MainDashboard-summary-value">
                {isTechnician 
                  ? (dashboardStats?.priorityCounts?.["High (Today)"] || 0)
                  : ((cardCounts["Hold"] || 0) + (cardCounts["In Progress"] || 0))
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
