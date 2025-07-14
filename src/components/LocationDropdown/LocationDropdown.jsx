import React, { useState, useEffect } from 'react';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import './LocationDropdown.css';

const LocationDropdown = ({ onSelect, onClose }) => {
    const [expanded, setExpanded] = useState({});
    const [locations, setLocations] = useState([]);
    const [groupedLocations, setGroupedLocations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:8000/locations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLocations(data);
                
                // Group locations by region and province
                const grouped = data.reduce((acc, location) => {
                    if (!acc[location.region]) {
                        acc[location.region] = {};
                    }
                    if (!acc[location.region][location.province]) {
                        acc[location.region][location.province] = [];
                    }
                    acc[location.region][location.province].push(location);
                    return acc;
                }, {});
                setGroupedLocations(grouped);
            } catch (error) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocations();
    }, []);

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
        return <div className="AdminLocationTree-content">Error: {error.message}</div>;
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
                    {Object.entries(groupedLocations).map(([region, provinces], regionIndex) => (
                        <div key={region} className="AdminLocationTree-node">
                            <div
                                className="AdminLocationTree-content-TreePopup-Body-Label"
                                onClick={() => toggleExpand(`region-${region}`)}
                            >
                                {expanded[`region-${region}`] ? (
                                    <IoMdArrowDropdown className="arrow-icon" />
                                ) : (
                                    <IoMdArrowDropright className="arrow-icon" />
                                )}
                                {region}
                            </div>
                            {expanded[`region-${region}`] && (
                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                    {Object.entries(provinces).map(([province, locationsList], provinceIndex) => (
                                        <div key={province} className="AdminLocationTree-node">
                                            <div
                                                className="AdminLocationTree-content-TreePopup-Body-Label"
                                                onClick={() => toggleExpand(`province-${region}-${province}`)}
                                                style={{ marginLeft: '20px' }}
                                            >
                                                {expanded[`province-${region}-${province}`] ? (
                                                    <IoMdArrowDropdown className="arrow-icon" />
                                                ) : (
                                                    <IoMdArrowDropright className="arrow-icon" />
                                                )}
                                                {province}
                                            </div>
                                            {expanded[`province-${region}-${province}`] && (
                                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                                    {locationsList.map((location) => (
                                                        <div
                                                            key={location.id}
                                                            className="AdminLocationTree-content-TreePopup-Body-SubNodes-Label AdminLocationTree-item"
                                                            onClick={() => handleSelect(location)}
                                                            style={{ marginLeft: '40px' }}
                                                        >
                                                            {location.locationName}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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