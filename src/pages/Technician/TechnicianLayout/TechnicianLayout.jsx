import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import SideBar from '../../../components/SideBar/sideBar';
import TopNotificationBar from '../../../components/topNotificatonBar/TopNotificationBar';
import './TechnicianLayout.css';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchLoggedUserRequest, refreshTokenRequest } from '../../../redux/auth/authSlice';

const TechnicianLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const role = user?.role;
    const loading = useAppSelector(state => state.auth.loading);
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const hasJwtCookie = document.cookie.includes('jwt');
    
    const refreshTokenAvailable = useAppSelector(state => state.auth.hasRefreshToken);

    useEffect(() => {
        if (!user) {
            if (hasJwtCookie) {
                console.log('[TechnicianLayout] No user found, dispatching fetchLoggedUserRequest');
                dispatch(fetchLoggedUserRequest());
            } else {
                console.log('[TechnicianLayout] No JWT cookie found, trying refresh then fetch');
                dispatch(refreshTokenRequest());
                dispatch(fetchLoggedUserRequest());
            }
        } else {
            console.log('[TechnicianLayout] User already exists, no need to fetch again');
        }
    }, [dispatch, user]);

    // ✅ Mark inactive on tab close or reload
    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (user?.role === 'technician') {
                try {
                    await fetch(`/technician/${user.serviceNum}/deactivate`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
    'Content-Type': 'application/json',
  },
                    });
                    console.log('[TechnicianLayout] Technician marked inactive before unload');
                } catch (err) {
                    console.warn('[TechnicianLayout] Failed to mark technician inactive:', err);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user]);
//check active status periodically
useEffect(() => {
  const checkTechnicianStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/technician/check-status', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();  
      console.log('[CheckStatus] Status:', res.status, 'Message:', data.message); // <-- and this line

      if (res.status === 401) {
        alert('You have been deactivated by admin. Please log in again.');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('[TechnicianLayout] Failed to check technician status:', err);
    }
  };

  if (user?.role === 'technician') {
    checkTechnicianStatus();
    const interval = setInterval(checkTechnicianStatus, 30000);
    return () => clearInterval(interval);
  }
}, [user]);


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
        <div className="Technician-layout-dashboard">
            <SideBar role={role} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
            <div className="Technician-layout-dashboard-main">
                <TopNotificationBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <Outlet />
            </div>
        </div>
    );
};

export default TechnicianLayout;
