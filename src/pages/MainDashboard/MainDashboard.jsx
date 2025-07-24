import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './MainDashboard.css';
import { FaBell, FaSnowflake, FaTag, FaTruck} from 'react-icons/fa';
import { fetchDashboardStatsRequest } from '../../redux/incident/incidentSlice';
import { fetchMainCategoriesRequest } from '../../redux/categories/categorySlice';

function MainDashboard() {
    const dispatch = useDispatch();
    const { dashboardStats, loading, error } = useSelector(state => state.incident);
    const { mainCategories } = useSelector(state => state.categories);
    const { user } = useSelector(state => state.auth);

    // Detect user type from Redux auth state (populated from backend JWT/user fetch)
    const userType = user?.userType || user?.role || user?.type || 'Unknown';
    const userParentCategory = 'PAC001';

    // Console log to verify user role detection
    console.log('Detected userType:', userType, 'Full user object:', user);

    useEffect(() => {
        dispatch(fetchMainCategoriesRequest());
        // If user is Technician, fetch only incidents assigned to him
        if (userType === 'Technician' && user?.id) {
            dispatch(fetchDashboardStatsRequest({ userParentCategory, userType, technicianId: user.id }));
        }
        // If user is Admin, fetch only incidents for his team
        else if (userType === 'Admin' && user?.teamName) {
            dispatch(fetchDashboardStatsRequest({ userParentCategory, userType, teamName: user.teamName }));
        }
        // Default: fetch all incidents for the role
        else {
            dispatch(fetchDashboardStatsRequest({ userParentCategory, userType }));
        }
    }, [dispatch, userParentCategory, userType, user?.id, user?.teamName]);

    const cardData = [
        { title: 'Open', color: '#f5a623', icon: <FaBell /> },
        { title: 'Hold', color: '#00c4b4', icon: <FaSnowflake /> },
        { title: 'In Progress', color: '#4a90e2', icon: <FaTag /> },
        { title: 'Closed', color: '#007bff', icon: <FaTruck /> },
    ];

    // Primary count shows today's incidents, secondary shows total
    const cardCounts = dashboardStats?.todayStatusCounts || {};
    const cardSubCounts = dashboardStats?.totalStatusCounts || {};

    useEffect(() => {
        function handleResize() {
            // Resize handler for other components if needed
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading) {
        return (
            <div className="MainDashboard-main-content">
                <div className="MainDashboard-direction-bar">Dashboard</div>
                <div className="MainDashboard-loading-container">
                    <div className="MainDashboard-loading-spinner"></div>
                    <p className="MainDashboard-loading-text">Loading dashboard data...</p>
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
                            dispatch(fetchDashboardStatsRequest({ userParentCategory, userType }));
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
                    <p className="MainDashboard-subtitle">Monitor your team's incident management performance</p>
                </div>
            </div>
            
            <div className="MainDashboard-cards-container">
                {cardData.map((card, index) => (
                <div key={index} className="MainDashboard-white-box">
                    <div className="MainDashboard-colored-card" style={{ backgroundColor: card.color }}>
                        <div className="MainDashboard-card-icon">{card.icon}</div>
                    </div>
                    <div className="MainDashboard-card-content">
                        <h3 className="MainDashboard-card-title">{card.title}</h3>
                        <div className="MainDashboard-card-value">{cardCounts[card.title] || 0}</div>
                        <div className="MainDashboard-card-subvalue">
                            <span className="MainDashboard-card-label">Today's Count</span>
                        </div>
                        <div className="MainDashboard-card-total">
                            <span className="MainDashboard-card-total-label">Total: </span>
                            <span className="MainDashboard-card-total-value">{cardSubCounts[card.title] || 0}</span>
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
                            <span className="MainDashboard-summary-label">Total Incidents</span>
                            <span className="MainDashboard-summary-value">
                                {Object.values(cardSubCounts).reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                        <div className="MainDashboard-summary-item">
                            <span className="MainDashboard-summary-label">Today's Activity</span>
                            <span className="MainDashboard-summary-value">
                                {Object.values(cardCounts).reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                        <div className="MainDashboard-summary-item">
                            <span className="MainDashboard-summary-label">Unresolved (Today)</span>
                            <span className="MainDashboard-summary-value">
                                {(cardCounts['Hold'] || 0) + (cardCounts['In Progress'] || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }

export default MainDashboard;
