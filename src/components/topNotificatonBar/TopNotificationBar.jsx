import React, { useState } from 'react';
import './TopNotificationBar.css';
import { FaListAlt } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoExit } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { logoutRequest } from '../../redux/auth/authSlice';
import ConfirmPopup from '../ConfirmPopup/ConfirmPopup';

const roleDisplayNames = {
  user: 'User',
  admin: 'Admin',
  technician: 'Technician',
  teamLeader: 'Team Leader',
  superAdmin: 'Super Admin',
};

export default function TopNotificationBar({ user, notificationCount = 0, toggleSidebar }) {
  const navigate = useNavigate();
  let role;
  const dispatch = useAppDispatch();
  if(user.role === 'technician'){
    if(user.position){
      role = user.position;
    }
  }
  else{
    role = user?.role;
  }
  const displayName = user?.userName;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    dispatch(logoutRequest());
    navigate('/LogIn');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={`TopNotificationBar-top-notification-bar TopNotificationBar--${role || 'default'}`}>
      <div className="TopNotificationBar-notificationIcon-listIcon">
        <FaListAlt
          size="0.8em"
          className="TopNotificationBar-list-icon"
          onClick={toggleSidebar}
        />
        <div className="TopNotificationBar-notification-container">
          <IoIosNotifications size="1.2em" className="TopNotificationBar-notification-icon" />
          {notificationCount > 0 && (
            <span className="TopNotificationBar-notification-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </div>
      </div>
      <div className="TopNotificationBar-profile-section">
        <span className="TopNotificationBar-userName">
          {displayName || user?.username || user?.name || user?.email || 'User Name'}
        </span>
        {role && (
          <span className="TopNotificationBar-role">
            {roleDisplayNames[role] || role}
          </span>
        )}
        <button
          className="TopNotificationBar-logout-btn"
          onClick={handleLogoutClick}
          title="Logout">
          <IoExit size="1.2em" className="TopNotificationBar-logout-icon" />
          <span className="TopNotificationBar-logout-text">Logout</span>
        </button>
      </div>
      {showConfirm && (
        <ConfirmPopup
          message="Are you sure you want to log out?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
