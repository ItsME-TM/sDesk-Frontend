import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./MainDashboard.css";
import { FaBell, FaSnowflake, FaTag, FaTruck,FaUsers } from "react-icons/fa";
import { fetchDashboardStatsRequest, fetchAssignedToMeRequest } from "../../redux/incident/incidentSlice";
import { fetchMainCategoriesRequest } from "../../redux/categories/categorySlice";

function MainDashboard() {
  const dispatch = useDispatch();
  const { dashboardStats, assignedToMe, loading, error } = useSelector(
    (state) => state.incident
  );
  const { user } = useSelector((state) => state.auth);

  const userType = user.role;

  // Determine user role for data filtering
  const isSuperAdmin = 
    userType.toLowerCase().includes("superadmin") ||
    userType.toLowerCase().includes("super admin") ||
    userType.toLowerCase() === "superadmin" ||
    userType.toLowerCase() === "super admin" ||
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "super admin";

  const isTechnician = userType.toLowerCase() === "technician";
  const isAdmin = userType.toLowerCase() === "admin";

  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
    // Always fetch global dashboard stats for pending assignment counts
    dispatch(fetchDashboardStatsRequest({}));
    
    if (isTechnician && user?.serviceNum) {
      // For technicians, use getAssignedToMe directly
      dispatch(fetchAssignedToMeRequest({ serviceNum: user.serviceNum }));
    } else if (isAdmin && user?.serviceNum) {
      dispatch(
        fetchDashboardStatsRequest({
          userType,
          adminServiceNum: user.serviceNum,
        })
      );
    }
  }, [dispatch, userType, user?.serviceNum, isTechnician, isAdmin]);

  // Helper function to calculate stats from assignedToMe incidents for technicians
  const calculateTechnicianStats = (incidents) => {
    if (!incidents || !Array.isArray(incidents)) {
      return { cardCounts: {}, cardSubCounts: {} };
    }

    const today = new Date().toISOString().split('T')[0];

    const cardCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open' && inc.update_on === today).length,
      "Hold": incidents.filter(inc => inc.status === 'Hold' && inc.update_on === today).length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress' && inc.update_on === today).length,
      "Closed": incidents.filter(inc => inc.status === 'Closed' && inc.update_on === today).length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment' && inc.update_on === today).length,
    };

    const cardSubCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open').length,
      "Hold": incidents.filter(inc => inc.status === 'Hold').length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress').length,
      "Closed": incidents.filter(inc => inc.status === 'Closed').length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment').length,
    };

    return { cardCounts, cardSubCounts };
  };

  const cardData = [
    { title: "Open", color: "#f5a623", icon: <FaBell /> },
    { title: "Hold", color: "#00c4b4", icon: <FaSnowflake /> },
    { title: "In Progress", color: "#4a90e2", icon: <FaTag /> },
    { title: "Closed", color: "#007bff", icon: <FaTruck /> },
    { title: "Pending Assignment", color: "#ff6b6b", icon: <FaUsers /> },
  ];


  let cardCounts = {};
  let cardSubCounts = {};

  // Get global pending assignment counts for all roles
  const globalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
  const globalPendingAssignmentToday = globalCounts["Pending Assignment (Today)"] || 0;
  const globalPendingAssignmentTotal = globalCounts["Pending Assignment"] || 0;

  if (isSuperAdmin) {
    // For Super Admin: card value = today's count, total = all-time count
    const totalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
    
    // Extract today's counts from overallStatusCounts
    cardCounts = {
      "Open": totalCounts["Open (Today)"] || 0,
      "Hold": totalCounts["Hold (Today)"] || 0,
      "In Progress": totalCounts["In Progress (Today)"] || 0,
      "Closed": totalCounts["Closed (Today)"] || 0,
      "Pending Assignment": globalPendingAssignmentToday,
    };
    
    // Total counts for all time
    cardSubCounts = {
      "Open": totalCounts["Open"] || 0,
      "Hold": totalCounts["Hold"] || 0,
      "In Progress": totalCounts["In Progress"] || 0,
      "Closed": totalCounts["Closed"] || 0,
      "Pending Assignment": globalPendingAssignmentTotal,
    };
  } else if (isTechnician) {
    // For Technician: use assignedToMe incidents directly, but global pending assignment
    const technicianStats = calculateTechnicianStats(assignedToMe);
    cardCounts = {
      ...technicianStats.cardCounts,
      "Pending Assignment": globalPendingAssignmentToday, // Override with global count
    };
    cardSubCounts = {
      ...technicianStats.cardSubCounts,
      "Pending Assignment": globalPendingAssignmentTotal, // Override with global count
    };
  } else if (isAdmin) {
    // For Admin: card value = today's incidents under their main categories, total = all incidents under their main categories
    const totalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
    
    // Today's incidents under admin's main categories and subcategories
    cardCounts = {
      "Open": totalCounts["Open (Today)"] || 0,
      "Hold": totalCounts["Hold (Today)"] || 0,
      "In Progress": totalCounts["In Progress (Today)"] || 0,
      "Closed": totalCounts["Closed (Today)"] || 0,
      "Pending Assignment": globalPendingAssignmentToday,
    };
    
    // Total incidents under admin's main categories and subcategories
    cardSubCounts = {
      "Open": totalCounts["Open"] || 0,
      "Hold": totalCounts["Hold"] || 0,
      "In Progress": totalCounts["In Progress"] || 0,
      "Closed": totalCounts["Closed"] || 0,
      "Pending Assignment": globalPendingAssignmentTotal,
    };
  } else {
    // For other user types, use existing logic but with global pending assignment
    const todayStats = dashboardStats?.todayStatusCounts || {};
    const totalStats = dashboardStats?.totalStatusCounts || {};
    
    cardCounts = {
      ...todayStats,
      "Pending Assignment": globalPendingAssignmentToday,
    };
    cardSubCounts = {
      ...totalStats,
      "Pending Assignment": globalPendingAssignmentTotal,
    };
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
              // Always fetch global dashboard stats for pending assignment counts
              dispatch(fetchDashboardStatsRequest({}));
              
              if (isTechnician && user?.serviceNum) {
                dispatch(fetchAssignedToMeRequest({ serviceNum: user.serviceNum }));
              } else if (isAdmin && user?.serviceNum) {
                dispatch(
                  fetchDashboardStatsRequest({
                    userType,
                    adminServiceNum: user.serviceNum,
                  })
                );
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
                Unresolved (Today)
              </span>
              <span className="MainDashboard-summary-value">
                {(cardCounts["Hold"] || 0) + (cardCounts["In Progress"] || 0) + (cardCounts["Pending Assignment"] || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;