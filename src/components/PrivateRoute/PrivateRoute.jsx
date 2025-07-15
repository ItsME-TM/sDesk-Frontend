import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLoggedUserRequest, refreshTokenRequest } from '../../redux/auth/authSlice';

const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const { user, isLoggedIn, loading, authInitialized } = useAppSelector((state) => state.auth);
  const hasJwtCookie = document.cookie.includes('jwt');

  // 🔁 Only try fetching once on mount if not initialized
  useEffect(() => {
    if (!authInitialized && !loading) {
      if (hasJwtCookie) {
        console.log('[PrivateRoute] Cookie present - dispatch fetchLoggedUserRequest');
        dispatch(fetchLoggedUserRequest());
      } else {
        console.log('[PrivateRoute] No JWT cookie - dispatch refreshTokenRequest');
        dispatch(refreshTokenRequest());
      }
    }
  }, [authInitialized, loading, dispatch, hasJwtCookie]);

  // 🟡 Still initializing: show loading
  if (!authInitialized || loading) {
    return <div>Loading...</div>;
  }

  // ❌ After initialization, if no user or not logged in —> redirect
  if (!user || !isLoggedIn) {
    console.log('[PrivateRoute] Redirecting - user:', user, 'isLoggedIn:', isLoggedIn);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
