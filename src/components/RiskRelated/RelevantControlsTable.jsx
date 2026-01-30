import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from "uuid";
import RelevantControlsSelectionPopup from "./RelevantControlsSelectionPopup";

const RelevantControlsTable = ({ relevantControls, setFormData, readOnly, globalControls = [] }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // Toggle the popup visibility
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleSaveControls = (selectedControlObjects) => {
        setFormData(prev => {
            const selectedNames = new Set(
                (selectedControlObjects || [])
                    .map(o => (o?.control || "").trim())
                    .filter(Boolean)
            );

            // existing controls map (preserve ids/descriptions where possible)
            const byName = new Map((prev.relevantControls || []).map(rc => [rc.control, rc]));

            const updatedList = Array.from(selectedNames).map(name => {
                const existing = byName.get(name);
                if (existing) return existing;

                const fromPopup = (selectedControlObjects || []).find(o => o.control === name);
                return {
                    id: uuidv4(),
                    control: name,
                    description: fromPopup?.description || "",
                };
            });

            // ✅ find what was removed (compare previous relevant controls vs new)
            const prevNamesNorm = new Set((prev.relevantControls || []).map(rc => norm(rc.control)));
            const nextNamesNorm = new Set(updatedList.map(rc => norm(rc.control)));
            const removedNamesNorm = Array.from(prevNamesNorm).filter(n => !nextNamesNorm.has(n));

            // ✅ purge removed controls from IBRA + CEA
            const withPurges = purgeControlNamesFromIBRAAndCEA(prev, removedNamesNorm);

            return {
                ...withPurges,
                relevantControls: updatedList,
            };
        });
    };

    const removeControl = (id) => {
        setFormData(prev => {
            const removed = (prev.relevantControls || []).find(c => c.id === id);
            const removedNameNorm = norm(removed?.control);

            const nextRelevant = (prev.relevantControls || []).filter(c => c.id !== id);

            // purge from IBRA + CEA
            const withPurges = purgeControlNamesFromIBRAAndCEA(
                prev,
                removedNameNorm ? [removedNameNorm] : []
            );

            return {
                ...withPurges,
                relevantControls: nextRelevant,
            };
        });
    };

    const sortedRelevantControls = [...(relevantControls || [])].sort((a, b) =>
        (a.control || "").localeCompare((b.control || ""), undefined, { sensitivity: "base" })
    );

    const norm = (s) => (s ?? "").toString().trim().toLowerCase();

    const purgeControlNamesFromIBRAAndCEA = (prev, removedNamesNorm) => {
        if (!removedNamesNorm || removedNamesNorm.length === 0) return prev;

        const removedSet = new Set(removedNamesNorm);

        const nextIBRA = (prev.ibra || []).map(r => ({
            ...r,
            controls: (r.controls || []).filter(c => {
                const name = typeof c === "string" ? c : c?.control;
                return !removedSet.has(norm(name));
            })
        }));

        const nextCEA = (prev.cea || [])
            .filter(r => !removedSet.has(norm(r.control)))
            .map((r, i) => ({ ...r, nr: i + 1 })); // keep numbering clean

        return { ...prev, ibra: nextIBRA, cea: nextCEA };
    };

    return (
        <div className="input-row">
            <div className="input-box-ref">
                <h3 className="font-fam-labels">
                    Applicable Controls <span className="required-field">*</span>
                </h3>

                {/* TABLE SECTION */}
                {relevantControls && relevantControls.length > 0 && (
                    <table className="vcr-table table-borders">
                        <thead className="cp-table-header" style={{ backgroundColor: "#002060", color: "white" }}>
                            <tr>
                                <th className="refColCen refNum" style={{ width: "5%" }}>Nr</th>
                                <th className="refColCen refRef" style={{ width: "90%" }}>Control Name</th>
                                {!readOnly && <th className="refColCen refBut" style={{ width: "5%" }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRelevantControls.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="refCent" style={{ fontSize: "14px" }}>{index + 1}</td>
                                    <td className="refCent" style={{ fontSize: "14px", textAlign: "left", fontWeight: "normal" }}>
                                        {row.control}
                                    </td>
                                    {!readOnly && (
                                        <td className="ref-but-row procCent">
                                            <button
                                                className="remove-row-button"
                                                onClick={() => removeControl(row.id)}
                                                title="Remove Control"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* BUTTON LOGIC */}
                {!readOnly && (
                    <>
                        {relevantControls.length === 0 ? (
                            <button
                                className="add-row-button-ref"
                                onClick={togglePopup}
                            >
                                Select
                            </button>
                        ) : (
                            <button
                                className="add-row-button-pic-plus"
                                onClick={togglePopup}
                            >
                                <FontAwesomeIcon icon={faPlusCircle} title="Select More Controls" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* POPUP COMPONENT */}
            {isPopupOpen && (
                <RelevantControlsSelectionPopup
                    closePopup={togglePopup}
                    onSave={handleSaveControls}
                    globalControls={globalControls}
                    currentControls={relevantControls}
                />
            )}
        </div>
    );
};

export default RelevantControlsTable;