import React, { useEffect, useState, useMemo } from "react";
import "./ControlChangesPopup.css";

const ControlChangesPopup = ({ newData, prevData, importNew, onClose }) => {
    const formatFieldName = (key) => {
        const labelMap = {
            control: "Control Name",
            description: "Description",
            critical: "Critical Control",
            act: "Act, Object or System",
            activation: "Control Activation",
            hierarchy: "Hierarchy of Controls",
            cons: "Main Consequence Addressed",
            quality: "Control Quality",
            performance: "Performance Requirement"
        };

        if (labelMap[key]) return labelMap[key];

        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());

    const isAllSelected = useMemo(() => {
        return prevData?.length > 0 && selectedRowIds.size === prevData.length;
    }, [selectedRowIds, prevData]);

    const toggleRow = (ceaRowId) => {
        setSelectedRowIds(prev => {
            const next = new Set(prev);
            if (next.has(ceaRowId)) next.delete(ceaRowId);
            else next.add(ceaRowId);
            return next;
        });
    };

    const handleSelectAllToggle = () => {
        setSelectedRowIds(prev => {
            // If all selected -> clear, else select all
            if (prevData?.length > 0 && prev.size === prevData.length) return new Set();
            return new Set((prevData || []).map(r => r.ceaRowId));
        });
    };

    const handleImportSelected = () => {
        const selectedRows = (prevData || []).filter(r => selectedRowIds.has(r.ceaRowId));
        importNew(selectedRows); // ✅ send only selected controls
    };

    const handleImportAll = () => {
        importNew(prevData || []); // ✅ send everything
    };

    return (
        <div className="controlChanges-popup-overlay" style={{ userSelect: "none" }}>
            <div className="controlChanges-popup-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">Control Importing</h2>
                    <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                </div>
                <div className="controlChanges-table-group">
                    <div className="controlChanges-select-header">
                        <div className="controlChanges-select-text">Select controls to import</div>
                    </div>
                    <div className="popup-table-wrapper-controlChanges">
                        <table className="popup-table font-fam">
                            <thead className="draft-headers" style={{ cursor: "default", userSelect: "none" }}>
                                <tr>
                                    <th style={{ width: "10%", textAlign: "center" }}>Nr</th>
                                    <th style={{ width: "35%", textAlign: "center" }}>Old Control</th>
                                    <th style={{ width: "55%", textAlign: "center" }}>Changes Made</th>
                                    {false && (<th style={{ width: "20%", textAlign: "center" }}>Changed By</th>)}
                                    <th style={{ width: "10%", textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prevData.map((row, index) => {
                                    const changes = Object.entries(row.mismatches || {})
                                        .filter(([key]) => key !== "uniqueId" && key !== "_id")
                                        .map(([key, values]) => {
                                            const oldValue = values?.cea ?? "";
                                            const newValue = values?.system ?? "";

                                            return (
                                                <div key={key} className="change-line">
                                                    <strong>{formatFieldName(key)}</strong>: {oldValue} → {newValue || "No Value"}
                                                </div>
                                            );
                                        });

                                    const checked = selectedRowIds.has(row.ceaRowId);

                                    return (
                                        <tr
                                            key={row.ceaRowId}
                                            onClick={() => toggleRow(row.ceaRowId)}
                                            style={{ cursor: "pointer" }}
                                            className={checked ? "selected-import-row" : ""}
                                        >
                                            <td>{index + 1}</td>

                                            <td>{row.control}</td>

                                            <td>
                                                {changes.length > 0 ? changes : "No changes"}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-inp-abbr"
                                                    checked={checked}
                                                    onChange={() => toggleRow(row.ceaRowId)}
                                                    onClick={(e) => e.stopPropagation()} // ✅ prevents double toggle when clicking checkbox
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="abbr-popup-buttons">
                    <button
                        type="button"
                        className="abbr-popup-button"
                        style={{ width: "30%", marginRight: "10px" }}
                        onClick={handleImportSelected}
                        disabled={selectedRowIds.size === 0}
                        title={selectedRowIds.size === 0 ? "Select at least one control" : "Import selected controls"}
                    >
                        Import
                    </button>

                    <button
                        type="button"
                        className="abbr-popup-button"
                        style={{ width: "30%", marginLeft: "10px" }}
                        onClick={handleImportAll}
                        disabled={!prevData || prevData.length === 0}
                    >
                        Import All
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ControlChangesPopup;
