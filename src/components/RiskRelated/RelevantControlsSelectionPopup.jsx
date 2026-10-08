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
    const [categoryTab, setCategoryTab] = useState("All");

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

    // Builds the full merged control list (backend + current + extra/pseudo) given
    // an explicit `extra` list. Pulled out into a function (rather than an inline
    // IIFE tied to the `extraControls` state) so it can also be used to commit a
    // selection immediately after adding new controls, without waiting on a
    // re-render.
    const buildMergedControls = (extra) => {
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
                map.set(k, {
                    _id: `pseudo-${k}`,
                    control: c.control,
                    description: c.description || "",
                    category: (c.category ?? "").toString().trim(),
                    performance: c.performance || "",
                    __pseudo: true,
                    ...(c.details ? { details: c.details } : {}),
                });
            }
        });

        // 3) controls added via SuggestMultipleControls (starred / detailed)
        (extra || []).forEach(c => {
            if (!c?.control?.trim()) return;
            const k = key(c.control);
            if (!map.has(k)) {
                map.set(k, c);
            }
        });

        return Array.from(map.values());
    };

    const mergedControls = buildMergedControls(extraControls);

    const filteredControls = mergedControls
        .filter(c => (c.control || "").toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(c => {
            const category = String(c.category || "").trim().toLowerCase();

            if (categoryTab === "General") {
                return category === "general";
            }

            if (categoryTab === "Specialised") {
                return category !== "general";
            }

            return true; // All
        })
        .sort((a, b) =>
            (a.control || "").localeCompare(b.control || "", undefined, { sensitivity: "base" })
        );

    // `details` (when present) comes from the Add Control Details popup inside
    // SuggestMultipleControls and carries the full set of control values, not just
    // the name - these get pulled through so the CEA table is pre-populated.
    const toPseudoControl = (name, details = null) => ({
        _id: `pseudo-${key(name)}`,
        control: name,
        description: details?.description || "",
        category: (details?.category ?? "").toString().trim(),
        performance: details?.performance || "",
        __pseudo: true,
        ...(details ? { details } : {}),
    });

    // `entries` is an array of either plain strings (legacy/quick-add) or
    // { control, details } objects (from the Detailed Add flow).
    const mergePseudoControls = (prev, entries) => {
        const map = new Map(prev.map(c => [key(c.control), c]));
        entries.forEach(entry => {
            const name = typeof entry === "string" ? entry : entry?.control;
            const details = typeof entry === "string" ? null : (entry?.details || null);
            if (!name) return;

            const k = key(name);
            if (!map.has(k)) {
                map.set(k, toPseudoControl(name, details));
            } else if (details) {
                // Row already existed as a bare pseudo control - enrich it now that
                // details are available.
                map.set(k, toPseudoControl(name, details));
            }
        });
        return Array.from(map.values());
    };

    const mergeSelectedNames = (prev, entries) => {
        const set = new Set(prev);
        entries.forEach(entry => {
            const name = typeof entry === "string" ? entry : entry?.control;
            if (name) set.add(name);
        });
        return Array.from(set);
    };

    const handleOpenSuggestPopup = () => setShowSuggestPopup(true);
    const handleCloseSuggestPopup = () => setShowSuggestPopup(false);

    const handleSuggestSuccess = (newControls) => {
        // `newControls` is an array of { control, details } objects (details may be
        // null for controls added via the original quick-add flow).

        // 1) make them visible (pseudo items)
        const updatedExtra = mergePseudoControls(extraControls, newControls);
        setExtraControls(updatedExtra);

        // 2) auto-select them
        const updatedSelectedNames = mergeSelectedNames(selectedControlNames, newControls);
        setSelectedControlNames(updatedSelectedNames);

        // 3) Commit straight away, so the newly added controls land on the
        // Applicable Controls table without the user having to separately press
        // "Update Selection" again. We deliberately do NOT close this popup here -
        // the user may still be browsing/selecting other controls.
        const updatedMerged = buildMergedControls(updatedExtra);
        const selectedObjects = updatedMerged.filter(c => updatedSelectedNames.includes(c.control));
        onSave(selectedObjects);

        // 4) close the "add new controls" sub-popup
        handleCloseSuggestPopup();
    };

    return (
        <div className="popup-overlay-share">
            <div className="popup-content-share">
                <div className="review-date-header">
                    <h2 className="review-date-title" onClick={() => console.log(mergedControls)}>Select Applicable Controls</h2>
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
                    <div className="popup-table-wrapper-share-rel">
                        <div className="control-attributes-pill-bar-new">
                            {["All", "General", "Specialised"].map((pill) => (
                                <div
                                    key={pill}
                                    className={`control-attributes-pill ${categoryTab === pill ? "active" : ""}`}
                                    onClick={() => setCategoryTab(pill)}
                                >
                                    {pill}
                                </div>
                            ))}
                        </div>

                        <div className="popup-table-scroll">
                            <table className="popup-table font-fam">
                                <thead className="share-headers">
                                    <tr>
                                        <th className="inp-size-share" style={{ width: "5%" }}>Select</th>
                                        <th style={{ width: "15%", textAlign: "center" }}>Category</th>
                                        <th style={{ width: "80%" }}>Control Name</th>
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
                                                <td style={{ fontWeight: "normal", textAlign: "center" }}>{control.category}</td>
                                                <td style={{ fontWeight: "normal" }}>{control.control}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: "center", padding: "20px", fontFamily: "Arial" }}>
                                                No controls found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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