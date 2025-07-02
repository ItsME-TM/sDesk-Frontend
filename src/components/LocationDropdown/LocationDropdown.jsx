import React, { useState,  useEffect} from 'react';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import { sDesk_t2_location_dataset } from '../../data/sDesk_t2_location_dataset';
import './LocationDropdown.css';

const LocationDropdown = ({ onSelect, onClose }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (sublocation) => {
        onSelect({ name: sublocation.loc_name, number: sublocation.loc_number });
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

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
                    {sDesk_t2_location_dataset.map((mainLocation, index) => (
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
                                {mainLocation.district_name}
                            </div>
                            {expanded[`main-${index}`] && (
                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                    {mainLocation.sublocations.map((sublocation, subIndex) => (
                                        <div key={subIndex} className="AdminLocationTree-sublocation">
                                            <div
                                                className="AdminLocationTree-content-TreePopup-Body-SubNodes-Label AdminLocationTree-item"
                                                onClick={() => handleSelect(sublocation)}
                                            >
                                                {sublocation.loc_name}
                                            </div>
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