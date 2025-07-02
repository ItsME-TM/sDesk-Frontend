import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLoggedUserRequest } from '../../redux/auth/authSlice';

const PrivateRoute = () => {
    const dispatch = useAppDispatch();
    const { isLoggedIn, loading, user } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (!user) {
            console.log('[PrivateRoute] User not found, fetching logged user');
            dispatch(fetchLoggedUserRequest());
        }
    }, [dispatch, user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/LogIn" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;