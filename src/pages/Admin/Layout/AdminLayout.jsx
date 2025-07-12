import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../../components/SideBar/sideBar';
import './AdminLayout.css';
import { useAppSelector } from '../../../redux/hooks';
import TopNotificationBar from '../../../components/topNotificatonBar/TopNotificationBar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);
    const user = useAppSelector(state => state.auth.user);
    const role = user?.role;
    const loading = useAppSelector(state => state.auth.loading);
    const accessToken = useAppSelector(state => state.auth.accessToken); // adjust if your token is stored elsewhere

    useEffect(() => {
        const fetchAdminInfo = async () => {
            if (user?.serviceNum && accessToken) {
                try {
                    const response = await fetch(`/teamadmin/admin/serviceNumber/${user.serviceNum}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) throw new Error('Failed to fetch admin info');
                    const data = await response.json();
                    setAdminInfo(data);
                } catch (err) {
                    setAdminInfo(null);
                    // Optionally handle error
                }
            }
        };
        fetchAdminInfo();
    }, [user?.serviceNum, accessToken]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <div>User not found</div>;
    }
    return (
        <div className="Admin-layout-dashboard">
            <SideBar role={role} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
            <div className="Admin-layout-dashboard-main">
                <TopNotificationBar user={user} notificationCount={10} toggleSidebar={toggleSidebar} />
                {/* Example: Show team name and subcategories for admin */}
                {adminInfo && (
                  <div style={{padding: '8px', background: '#f5f5f5', marginBottom: '8px'}}>
                    <b>Team:</b> {adminInfo.teamName} <br/>
                    <b>Subcategories:</b> {[adminInfo.cat1, adminInfo.cat2, adminInfo.cat3, adminInfo.cat4].filter(Boolean).join(', ')}
                  </div>
                )}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;