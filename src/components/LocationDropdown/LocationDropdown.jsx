import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import './LocationDropdown.css';
import { fetchLocationsRequest } from '../../redux/location/locationSlice';

const LocationDropdown = ({ onSelect, onClose }) => {
    const [expanded, setExpanded] = useState({});
    const dispatch = useDispatch();
    
    // Get data from Redux store
    const { locations, loading: isLoading, error } = useSelector((state) => state.location);

    useEffect(() => {
        // Fetch locations using Redux action
        dispatch(fetchLocationsRequest());
    }, [dispatch]);

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (location) => {
        onSelect({ name: location.locationName, number: location.locationCode });
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (isLoading) {
        return <div className="AdminLocationTree-content">Loading locations...</div>;
    }

    if (error) {
        return <div className="AdminLocationTree-content">Error: {error}</div>;
    }

    return (
        <div className="AdminLocationTree-content">
            <div className="AdminLocationTree-content-TreePopup">
                <div className="AdminLocationTree-content-TreePopup-Header">
                    <h3>Select Location</h3>
                    <button
                        onClick={onClose}
                        className="AdminLocationTree-content-TreePopup-Header-closeButton"
                    >
                        <IoIosClose size={30} />
                    </button>
                </div>
                <div className="AdminLocationTree-content-TreePopup-Body">
                    {locations.map((mainLocation, index) => (
                        <div key={index} className="AdminLocationTree-node">
                            <div
                                className="AdminLocationTree-content-TreePopup-Body-Label"
                                onClick={() => toggleExpand(`main-${index}`)}
                            >
                                {expanded[`main-${index}`] ? (
                                    <IoMdArrowDropdown className="arrow-icon" />
                                ) : (
                                    <IoMdArrowDropright className="arrow-icon" />
                                )}
                                {mainLocation.locationName}
                            </div>
                            {expanded[`main-${index}`] && (
                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                    {/* Assuming locations don't have sub-levels like categories, just display them directly */}
                                    <div key={mainLocation.id} className="AdminLocationTree-sublocation">
                                        <div
                                            className="AdminLocationTree-content-TreePopup-Body-SubNodes-Label AdminLocationTree-item"
                                            onClick={() => handleSelect(mainLocation)}
                                        >
                                            {mainLocation.locationName}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationDropdown;