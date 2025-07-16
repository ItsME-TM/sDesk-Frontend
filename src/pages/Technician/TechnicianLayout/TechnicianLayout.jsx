import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import SideBar from '../../../components/SideBar/sideBar';
import TopNotificationBar from '../../../components/topNotificatonBar/TopNotificationBar';
import './TechnicianLayout.css';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  fetchLoggedUserRequest,
  refreshTokenRequest,
} from '../../../redux/auth/authSlice';

const TechnicianLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const loading = useAppSelector((state) => state.auth.loading);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const authInitialized = useAppSelector((state) => state.auth.authInitialized);
  const hasJwtCookie = document.cookie.includes('jwt');

 //Attempt auto-login if cookies exist
  useEffect(() => {
    if (!user && !loading) {
      if (hasJwtCookie) {
        console.log('[TechnicianLayout] JWT cookie found, dispatching fetchLoggedUserRequest');
        dispatch(fetchLoggedUserRequest());
      } else {
        console.log('[TechnicianLayout] No JWT found, trying refresh');
        dispatch(refreshTokenRequest());
      }
    }
  }, [dispatch, user, loading]);

  //  Mark technician inactive on unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.role === 'technician') {
        try {
          await fetch(`/technician/${user.serviceNum}/deactivate`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          console.log('[TechnicianLayout] Technician marked inactive on unload');
        } catch (err) {
          console.warn('[TechnicianLayout] Failed to mark inactive:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  //  Periodic technician active status check
  useEffect(() => {
    const checkTechnicianStatus = async () => {
  try {
    const res = await fetch('http://localhost:8000/technician/check-status', {
      method: 'GET',
      credentials: 'include',
    });

    const contentType = res.headers.get('Content-Type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      console.error('[CheckStatus] Non-JSON response:', text);
      throw new Error('Non-JSON response returned');
    }

    const data = await res.json();
    console.log('[CheckStatus] Status:', res.status, 'Message:', data.message);

    if (res.status === 401) {
      alert('You have been deactivated by admin. Please log in again.');
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('[TechnicianLayout] Status check failed:', err);
  }
};

    if (user?.role === 'technician') {
      checkTechnicianStatus();
      const interval = setInterval(checkTechnicianStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  //  Guard: Wait for auth to initialize before redirecting
  if (!authInitialized || loading) return <div>Loading...</div>;

  // Guard: Not logged in
  if (!user || !isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="Technician-layout-dashboard">
      <SideBar role={role} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      <div className="Technician-layout-dashboard-main">
        <TopNotificationBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Outlet />
      </div>

      {showDeactivationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Account Deactivated</h2>
            <p>You have been deactivated by the admin. Please log in again.</p>
            <button onClick={() => (window.location.href = '/login')}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianLayout;
