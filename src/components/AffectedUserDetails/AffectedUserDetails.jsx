import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './AffectedUserDetails.css';
import { lookupUserRequest, clearLookupUser } from '../../redux/userLookup/userLookupSlice';

// Debounce function to prevent too many API calls
const useDebounce = (callback, delay) => {
    const [debounceTimer, setDebounceTimer] = React.useState(null);
    
    const debouncedCallback = useCallback((...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);
        
        setDebounceTimer(newTimer);
    }, [callback, delay, debounceTimer]);
    
    return debouncedCallback;
};

const AffectedUserDetails = ({ formData, setFormData, handleInputChange }) => {
    const dispatch = useDispatch();
    const { loading, user, error } = useSelector((state) => state.userLookup);

    console.log('AffectedUserDetails: Component render - loading:', loading, 'user:', user, 'error:', error);

    // Debounced lookup function
    const debouncedLookup = useDebounce((serviceNum) => {
        console.log('AffectedUserDetails: Debounced lookup triggered for:', serviceNum);
        dispatch(lookupUserRequest(serviceNum));
    }, 500); // 500ms delay

    // Handle service number change with lookup
    const handleServiceNoChange = (e) => {
        const serviceNum = e.target.value;
        
        console.log('AffectedUserDetails: Service number input changed:', serviceNum);
        
        // Update form data immediately for UI responsiveness
        handleInputChange(e);
        
        // Perform lookup if service number exists and has minimum length
        if (serviceNum && serviceNum.trim() !== '' && serviceNum.trim().length >= 3) {
            console.log('AffectedUserDetails: Triggering debounced lookup for service number:', serviceNum.trim());
            debouncedLookup(serviceNum.trim());
        } else {
            console.log('AffectedUserDetails: Clearing lookup results - service number too short or empty');
            // Clear previous lookup results if service number is too short
            dispatch(clearLookupUser());
        }
    };    // Auto-fill form when user data is found
    useEffect(() => {
        console.log('AffectedUserDetails: useEffect triggered - user changed:', user);
        if (user) {
            console.log('AffectedUserDetails: Auto-filling user data:', user);
            setFormData(prevData => {
                const newData = {
                    ...prevData,
                    name: user.display_name || '',
                    email: user.email || '',
                    designation: user.role || '', // Auto-fill designation with user role
                };
                console.log('AffectedUserDetails: New form data:', newData);
                return newData;
            });
        }
    }, [user, setFormData]);

    return (
        <div className="AddInicident-content2-UserDetails">
            <div className="AddInicident-content2-UserDetails-TitleBar">
                Affected User Details
            </div>
            <div className="AddInicident-content2-UserDetails-UserInfo">
                <div className="AddInicident-content2-UserDetails-UserInfo-Cube1">
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
                        Service No
                    </div>
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
                        <input
                            type="text"
                            placeholder="Enter Service No"
                            name="serviceNo"
                            value={formData.serviceNo}
                            onChange={handleServiceNoChange}
                            required
                        />
                        {loading && (
                            <div className="lookup-status loading">
                                🔍 Looking up user...
                            </div>
                        )}
                        {error && (
                            <div className="lookup-status error">
                                {error.includes('User not found') ? (
                                    <>
                                        👤 {error}
                                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                                            Please check the service number and try again
                                        </div>
                                    </>
                                ) : error.includes('Cannot connect to server') ? (
                                    <>
                                        🌐 {error}
                                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                            Please ensure the backend server is running on port 8000
                                        </div>
                                    </>
                                ) : (
                                    <>❌ {error}</>
                                )}
                            </div>
                        )}
                        {user && (
                            <div className="lookup-status success">
                                ✅ User found: {user.display_name || user.name || 'Unknown'}
                                <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                                    Service No: {user.serviceNum} | Role: {user.role}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
                        TP Number
                    </div>
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
                        <input
                            type="text"
                            name="tpNumber"
                            value={formData.tpNumber}
                            onChange={handleInputChange}
                            placeholder="TP Number"
                        />
                    </div>
                </div>
                <div className="AddInicident-content2-UserDetails-UserInfo-Cube3">
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
                        Name
                    </div>
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                        />
                    </div>
                </div>
                <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
                        Designation
                    </div>
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            placeholder="Designation"
                        />
                    </div>
                </div>
                <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
                        Email
                    </div>
                    <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffectedUserDetails;
