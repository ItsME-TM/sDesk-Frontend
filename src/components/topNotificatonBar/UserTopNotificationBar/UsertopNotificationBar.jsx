import React from 'react';
import './UserTopNotificationBar.css';
import { FaListAlt } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoExit } from "react-icons/io5";

const UserTopNotificationBar = () => {
    const notificationCount = 15;
    return (
        <div className="UserTopNotificationBar-top-notification-bar">
            <div className="UserTopNotificationBar-notificationIcon-listIcon">
                <FaListAlt size="1.5em" className="UserTopNotificationBar-list-icon"/> 
                <div className="UserTopNotificationBar-notification-container">
                    <IoIosNotifications size="1.5em" className="UserTopNotificationBar-notification-icon"/> 
                    {notificationCount > 0 && (
                        <span className="UserTopNotificationBar-notification-badge">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </div>
            </div> 
            <div className="UserTopNotificationBar-profile-section">
                <span className="UserTopNotificationBar-userName">
                    User Name
                </span>
                <IoExit size="1.5em" className="UserTopNotificationBar-logout-icon"/> 
            </div>
        </div>
    );
};

export default UserTopNotificationBar;