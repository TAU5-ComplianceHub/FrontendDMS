import React, { useState, useEffect } from "react";
// We can reuse SharePageRisk.css if you want identical styling, 
// or create a copy named RelevantControlsSelectionPopup.css
import "./SharePageRisk.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuggestMultipleControls from "./ControlManagement/SuggestMultipleControls";

const RelevantControlsSelectionPopup = ({
    closePopup,
    onSave,
    globalControls = [],
    currentControls = []
}) => {
    // We track selections by Control Name to identify them
    const [selectedControlNames, setSelectedControlNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestPopup, setShowSuggestPopup] = useState(false);
    const [extraControls, setExtraControls] = useState([]); // pseudo controls created in UI

    const key = (s) => (s ?? "").toString().trim().toLowerCase();

    // Initialize selections based on what is already in the table
    useEffect(() => {
        const currentNames = currentControls.map(c => c.control);
        setSelectedControlNames(currentNames);
    }, [currentControls]);

    const clearSearch = () => {
        setSearchTerm("");
    };

    const handleCheckboxChange = (controlName) => {
        if (selectedControlNames.includes(controlName)) {
            // Uncheck: Remove from selection
            setSelectedControlNames(prev => prev.filter(name => name !== controlName));
        } else {
            // Check: Add to selection
            setSelectedControlNames(prev => [...prev, controlName]);
        }
    };

    const handleSaveSelection = () => {
        const selectedObjects = mergedControls.filter(c =>
            selectedControlNames.includes(c.control)
        );

        onSave(selectedObjects);
        closePopup();
    };

    const mergedControls = (() => {
        const map = new Map();

        // 1) backend controls
        (globalControls || []).forEach(c => {
            if (!c?.control?.trim()) return;
            map.set(key(c.control), c);
        });

        // 2) current selected controls (may include custom)
        (currentControls || []).forEach(c => {
            if (!c?.control?.trim()) return;
            const k = key(c.control);
            if (!map.has(k)) {
                map.set(k, { _id: `pseudo-${k}`, control: c.control, description: c.description || "", __pseudo: true });
            }
        });

        // 3) controls added via SuggestMultipleControls (starred)
        (extraControls || []).forEach(c => {
            if (!c?.control?.trim()) return;
            const k = key(c.control);
            if (!map.has(k)) {
                map.set(k, { _id: `pseudo-${k}`, control: c.control, description: c.description || "", __pseudo: true });
            }
        });

        return Array.from(map.values());
    })();

    const filteredControls = mergedControls
        .filter(c => c.control.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.control.localeCompare(b.control));

    const toPseudoControl = (name) => ({
        _id: `pseudo-${key(name)}`,
        control: name,
        description: "",
        __pseudo: true,
    });

    const mergePseudoControls = (prev, names) => {
        const map = new Map(prev.map(c => [key(c.control), c]));
        names.forEach(n => {
            const k = key(n);
            if (!map.has(k)) map.set(k, toPseudoControl(n));
        });
        return Array.from(map.values());
    };

    const mergeSelectedNames = (prev, names) => {
        const set = new Set(prev);
        names.forEach(n => set.add(n));
        return Array.from(set);
    };

    const handleOpenSuggestPopup = () => setShowSuggestPopup(true);
    const handleCloseSuggestPopup = () => setShowSuggestPopup(false);

    const handleSuggestSuccess = (starredControls) => {
        // 1) make them visible (pseudo items)
        setExtraControls(prev => mergePseudoControls(prev, starredControls));

        // 2) auto-select them
        setSelectedControlNames(prev => mergeSelectedNames(prev, starredControls));

        // 3) close suggest popup
        handleCloseSuggestPopup();
    };

    return (
        <div className="popup-overlay-share">
            <div className="popup-content-share">
                <div className="review-date-header">
                    <h2 className="review-date-title">Select Applicable Controls</h2>
                    <button className="review-date-close" onClick={closePopup} title="Close Popup">×</button>
                </div>

                <div className="review-date-group">
                    <div className="share-input-container">
                        <input
                            className="search-input-share"
                            type="text"
                            placeholder="Search controls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm !== "" ? (
                            <i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i>
                        ) : (
                            <i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>
                        )}
                    </div>
                </div>

                <div className="share-table-group">
                    <div className="popup-table-wrapper-share">
                        <table className="popup-table font-fam">
                            <thead className="share-headers">
                                <tr>
                                    <th className="inp-size-share">Select</th>
                                    <th>Control Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredControls.length > 0 ? (
                                    filteredControls.map((control, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => handleCheckboxChange(control.control)}
                                            style={{ cursor: "pointer" }}
                                            className={selectedControlNames.includes(control.control) ? "selected-row" : ""}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-inp-share"
                                                    checked={selectedControlNames.includes(control.control)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent double trigger
                                                    onChange={() => handleCheckboxChange(control.control)}
                                                />
                                            </td>
                                            <td style={{ fontWeight: "normal" }}>{control.control}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                                            No controls found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="share-buttons">
                    <button onClick={handleSaveSelection} className="share-button" style={{ width: "30%", marginLeft: 0, marginRight: 10 }}>
                        Update Selection
                    </button>

                    <button
                        onClick={handleOpenSuggestPopup}
                        className="share-button"
                        style={{ width: "30%", marginLeft: 10, marginRight: 0 }}
                    >
                        Add New Controls
                    </button>
                </div>
            </div>

            {showSuggestPopup && (
                <SuggestMultipleControls
                    isOpen={showSuggestPopup}
                    onClose={handleCloseSuggestPopup}
                    controlData={{}}
                    readOnly={false}
                    onSuccess={handleSuggestSuccess}
                />
            )}
        </div>
    );
};

export default RelevantControlsSelectionPopup;