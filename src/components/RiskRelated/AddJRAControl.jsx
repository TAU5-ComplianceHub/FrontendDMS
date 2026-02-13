import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './JRAPopup.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddJRAControl = ({ onClose, onSubmit, readOnly = false }) => {
    const [hazardInput, setHazardInput] = useState("");
    const [ueInput, setUEInput] = useState("");
    const [controlInput, setControlInput] = useState("");
    const [hazardsOptions, setHazardsOptions] = useState([]);
    const [filteredHazards, setFilteredHazards] = useState([]);
    const [showHazardDropdown, setShowHazardDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [unwantedEvents, setUnwantedEvents] = useState([]);
    const ueRef = useRef(null);
    const [showUEDropdown, setShowUEDropdown] = useState(false);
    const [filteredUEs, setFilteredUEs] = useState([]);
    const hazardRef = useRef(null);
    const [UEDropdownPosition, setUEDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/riskInfo/unique-unwanted-events`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setHazardsOptions(response.data.events);
            } catch (error) {
                console.error("Error fetching unwanted events:", error);
                toast.error("Failed to load Unwanted Events list.");
            }
        };

        const fetchUnwantedValues = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/riskInfo/unique-ue-values`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUnwantedEvents(response.data.events);
            } catch (error) {
                console.error("Error fetching unwanted events:", error);
                toast.error("Failed to load Unwanted Events list.");
            }
        };

        fetchUnwantedValues();
        fetchDropdownData();
    }, []);

    // ... (Keep your existing dropdown close logic useEffects here) ... 
    useEffect(() => {
        const popupSelector = '.floating-dropdown';
        const handleClickOutside = (e) => {
            const outside = !e.target.closest(popupSelector) && !e.target.closest('input');
            if (outside) closeDropdowns();
        };
        const handleScroll = (e) => {
            if (e.target.closest('textarea, input')) return;
            if (e.target.closest(popupSelector)) return;
            closeDropdowns();
        };
        const closeDropdowns = () => {
            setShowHazardDropdown(false);
            setShowUEDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [showHazardDropdown, showUEDropdown]);


    const handleHazardInput = (value) => {
        setHazardInput(value);
        const matches = hazardsOptions.filter(opt =>
            opt.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredHazards(matches);
        setShowHazardDropdown(true);
        updateDropdownPosition();
    };

    const handleUEInput = (value) => {
        setUEInput(value);
        const matches = unwantedEvents.filter(opt =>
            opt.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUEs(matches);
        setShowUEDropdown(true);
        updateUEDropdownPosition();
    };

    const handleHazardFocus = (value) => {
        closeDropdowns();
        const matches = hazardsOptions.filter(opt =>
            opt.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredHazards(matches);
        setShowHazardDropdown(true);
        updateDropdownPosition();
    };

    const handleUEFocus = (value) => {
        closeDropdowns();
        const matches = unwantedEvents.filter(opt =>
            opt.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUEs(matches);
        setShowUEDropdown(true);
        updateUEDropdownPosition();
    };

    const updateUEDropdownPosition = () => {
        const el = ueRef.current;
        if (el) {
            const rect = el.getBoundingClientRect();
            setUEDropdownPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const updateDropdownPosition = () => {
        const el = hazardRef.current;
        if (el) {
            const rect = el.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const selectHazardSuggestion = (suggestion) => {
        setHazardInput(suggestion);
        setShowHazardDropdown(false);
    };

    const selectUESuggestion = (suggestion) => {
        setUEInput(suggestion);
        setShowUEDropdown(false);
    };

    const handleSubmit = async () => {
        if (readOnly) {
            onClose();
            return;
        }

        if (!hazardInput || !ueInput || !controlInput) {
            toast.warn("Please fill in all fields (Hazard, Unwanted Event, and Sub Task Step).");
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_URL}/api/riskInfo/add-jra`, {
                hazard: hazardInput,
                unwantedEvent: ueInput,
                subTaskStep: controlInput
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success("JRA Control added successfully!", { autoClose: 2000, closeButton: false });
            if (onSubmit) onSubmit(); // Trigger refresh in parent
            //onClose();
        } catch (error) {
            console.error("Error adding JRA:", error);
            toast.error(error.response?.data?.error || "Failed to add JRA Control.");
        }
    };

    const closeDropdowns = () => {
        setShowHazardDropdown(false);
        setShowUEDropdown(false);
    }

    return (
        <div className="jra-popup-page-container">
            <div className="jra-popup-page-overlay">
                <div className="jra-control-modifyadd-popup-right">
                    <div className="jra-popup-page-popup-header-right">
                        <h2>Add Control</h2>
                        <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                    </div>

                    <div className="jra-popup-page-form-group-main-container">
                        <div className="jra-popup-page-scroll-box">
                            <div>
                                <div className="jra-popup-page-form-group-main-container-2" style={{ marginBottom: 0 }}>
                                    <div className="jra-popup-page-additional-group" style={{ paddingBottom: "0px" }}>
                                        <div className="jra-popup-page-additional-row">
                                            <div className="jra-popup-page-column-half">
                                                <div className="jra-popup-page-component-wrapper" >
                                                    <div className={`ibra-popup-page-form-group `}>
                                                        <label>Hazard Classification / Energy Release</label>
                                                        <div className={`ibra-popup-page-select-container`}>
                                                            <div className={`ibra-popup-page-select-container`}>
                                                                <textarea
                                                                    ref={hazardRef}
                                                                    value={hazardInput}
                                                                    onChange={e => handleHazardInput(e.target.value)}
                                                                    onFocus={e => handleHazardFocus(e.target.value)}
                                                                    type="text"
                                                                    style={{ color: "black", cursor: "text", resize: "none", fieldsizing: "content" }}
                                                                    className="jra-control-popup-page-input-table ibra-popup-page-row-input"
                                                                    placeholder="Insert or Select Hazard / Energy Release"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="jra-popup-page-column-half">
                                                <div className="jra-popup-page-component-wrapper">
                                                    <div className={`ibra-popup-page-form-group `}>
                                                        <label>Unwanted Event</label>
                                                        <textarea
                                                            ref={ueRef}
                                                            value={ueInput}
                                                            onChange={e => handleUEInput(e.target.value)}
                                                            onFocus={e => handleUEFocus(e.target.value)}
                                                            type="text"
                                                            style={{ color: "black", cursor: "text", resize: "none", fieldsizing: "content" }}
                                                            className="jra-control-popup-page-input-table ibra-popup-page-row-input"
                                                            placeholder="Insert Unwanted Event"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="jra-popup-page-additional-group">
                                        <div className="jra-popup-page-component-wrapper" style={{ marginBottom: "0px" }} >
                                            <div className="ibra-popup-page-form-group">
                                                <div style={{ position: "relative", marginTop: "0px", marginBottom: "5px" }}>
                                                    <div className="jra-popup-page-additional-row">
                                                        <label style={{ marginTop: "0px", marginBottom: "10px", marginLeft: "auto", marginRight: "auto" }}>Control / Sub Task Step</label>
                                                    </div>
                                                </div>
                                                <div style={{ position: "relative" }}>
                                                    <div className="jra-popup-page-additional-row">
                                                        <div className="jra-popup-page-column-half">
                                                            <div className="jra-popup-page-additional-row">
                                                                <div className="jra-popup-page-column-2-1-1">
                                                                    <div className="jra-popup-page-main-container" style={{ width: "100%" }}>
                                                                        <div className={"jra-popup-page-control-container"}>
                                                                            <textarea
                                                                                value={controlInput}
                                                                                onChange={(e) => setControlInput(e.target.value)}
                                                                                type="text"
                                                                                style={{ resize: "none", color: "black", cursor: "text", fieldsizing: "content", minHeight: "19px", width: "100%" }}
                                                                                className={`jra-popup-page-control-table jra-popup-page-row-input`}
                                                                                placeholder="Insert Sub Task Step"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ibra-popup-page-form-footer">
                        <div className="create-user-buttons" style={{ marginTop: 0 }}>
                            <button
                                className="ibra-popup-page-upload-button"
                                onClick={handleSubmit}
                            >
                                {(readOnly ? `Close Popup` : `Submit`)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Logic */}
            {showHazardDropdown && hazardsOptions.length > 0 && (
                <ul
                    className="floating-dropdown"
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 1000
                    }}
                    onMouseDown={e => e.preventDefault()}
                    onTouchStart={e => e.preventDefault()}
                    onScroll={e => e.preventDefault()}
                >
                    {filteredHazards.sort().filter(term => term && term.trim() !== "").map((term, i) => (
                        <li key={i} onMouseDown={() => selectHazardSuggestion(term)}>
                            {term}
                        </li>
                    ))}
                </ul>
            )}

            {/* Dropdown Logic */}
            {showUEDropdown && unwantedEvents.length > 0 && (
                <ul
                    className="floating-dropdown"
                    style={{
                        position: 'fixed',
                        top: UEDropdownPosition.top,
                        left: UEDropdownPosition.left,
                        width: UEDropdownPosition.width,
                        zIndex: 1000
                    }}
                    onMouseDown={e => e.preventDefault()}
                    onTouchStart={e => e.preventDefault()}
                    onScroll={e => e.preventDefault()}
                >
                    {filteredUEs.sort().filter(term => term && term.trim() !== "").map((term, i) => (
                        <li key={i} onMouseDown={() => selectUESuggestion(term)}>
                            {term}
                        </li>
                    ))}
                </ul>
            )}
        </div >
    );
};

export default AddJRAControl;