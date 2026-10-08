import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faSpinner, faTrashAlt, faPen, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import AddControlDetailsPopup from "../AddControlDetailsPopup";

// Code-level flag that swaps between the two flows (no UI toggle):
//  - false -> the original "quick add" behaviour: plain text rows only (unchanged).
//  - true  -> rows still have the plus (insert) and delete buttons, but also get an
//             Edit button that opens an instance of the Add Control form so the user
//             can capture the full control detail (not just a name), which is then
//             carried through to the CEA table.
// Flip this constant in code to switch modes.
const DETAILED_CONTROL_ADD = true;

const SuggestMultipleControls = ({ isOpen, onClose, controlData, onSuccess, readOnly }) => {
    const [approver, setApprover] = useState("");
    const [loading, setLoading] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [systemControlsSet, setSystemControlsSet] = useState(new Set());
    const [duplicateRowIds, setDuplicateRowIds] = useState(new Set());
    const [typedDuplicateRowIds, setTypedDuplicateRowIds] = useState(new Set());

    // `details` holds the full control object (from AddControlDetailsPopup) once the
    // user has filled it in for that row. It stays `null` for rows added/typed the
    // old, quick way.
    const [controlRows, setControlRows] = useState([
        { id: uuidv4(), value: "", details: null }
    ]);

    // Which row's detail popup is currently open (null = closed)
    const [editingRowId, setEditingRowId] = useState(null);

    useEffect(() => {
        const fetchSystemControls = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${process.env.REACT_APP_URL}/api/riskInfo/controls`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (!res.ok) {
                    console.warn("controls fetch failed:", res.status);
                    setSystemControlsSet(new Set());
                    return;
                }

                const data = await res.json();

                // Be defensive: some APIs return {controls:[...]}, others return [...]
                const list = Array.isArray(data) ? data : (data?.controls || []);

                const norm = (s) =>
                    (s ?? "")
                        .toString()
                        .trim()
                        .replace(/\s+/g, " ")       // collapse repeated spaces
                        .toLowerCase();

                const set = new Set(
                    list
                        .map((c) => norm(c?.control))
                        .filter(Boolean)
                );

                setSystemControlsSet(set);

                console.log(set)
            } catch (e) {
                console.error("Failed to load system controls", e);
                setSystemControlsSet(new Set());
            }
        };

        fetchSystemControls();
    }, []);

    const handleControlChange = (id, value) => {
        setControlRows(prev => prev.map(r => (r.id === id ? { ...r, value } : r)));

        // remove "already in system" highlight
        setDuplicateRowIds(prev => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

        // remove "duplicate typed" highlight
        setTypedDuplicateRowIds(prev => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    // insert AFTER the given index
    const insertControlRowAfter = (rowIndex) => {
        setControlRows(prev => {
            const next = [...prev];
            next.splice(rowIndex + 1, 0, { id: uuidv4(), value: "", details: null });
            return next;
        });
    };

    // delete row (keep at least one)
    const removeControlRow = (id) => {
        setControlRows(prev => {
            if (prev.length <= 1) {
                toast.warn("You must have at least one control.", { closeButton: false, autoClose: 1500 });
                return prev;
            }
            return prev.filter(r => r.id !== id);
        });
    };

    // Open the Add/Edit Control Details popup for a given row (instance of the
    // Add Control form - NOT the ControlEAPopup/Control Treatment popup).
    const openDetailsPopup = (id) => {
        if (readOnly) return;
        setEditingRowId(id);
    };

    const closeDetailsPopup = () => {
        setEditingRowId(null);
    };

    // Called when the user submits the Add Control Details popup for a row.
    // This both fills in the row's name (so the plain-text value stays in sync)
    // and stores the full detail object so it can be re-opened for editing later
    // and pulled into the CEA table on save.
    const handleDetailsSubmit = (values) => {
        if (!editingRowId) return;

        setControlRows(prev => prev.map(r =>
            r.id === editingRowId
                ? { ...r, value: values.controlName, details: values }
                : r
        ));

        setEditingRowId(null);
    };

    const norm = (s) =>
        (s ?? "")
            .toString()
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

    const findTypedDuplicateRowIds = () => {
        // highlight only the 2nd+ occurrences of the same typed control
        const seen = new Set();
        const dupRowIds = new Set();

        for (const row of controlRows) {
            const v = norm(row.value);
            if (!v) continue;

            if (seen.has(v)) {
                dupRowIds.add(row.id);   // only mark subsequent duplicates
            } else {
                seen.add(v);
            }
        }

        return dupRowIds;
    };

    const findDuplicateRowIds = () => {
        const dups = new Set();

        for (const row of controlRows) {
            const v = norm(row.value);
            if (v && systemControlsSet.has(v)) {
                dups.add(row.id);
            }
        }

        return dups;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        // Rows left blank are simply skipped on submit rather than blocking it.
        const rowsWithValues = controlRows.filter(r => (r.value ?? "").trim());

        if (rowsWithValues.length === 0) {
            toast.warn("Please add at least one control name.");
            return;
        }

        // 1) Typed duplicates check (different message)
        const typedDups = findTypedDuplicateRowIds();
        setTypedDuplicateRowIds(typedDups);

        if (typedDups.size > 0) {
            toast.warn(
                "You have duplicate controls in your list. Please change the highlighted duplicate entries.",
                { closeButton: false, autoClose: 3000 }
            );
            return;
        }

        // 2) System duplicates check (your existing logic)
        const dups = findDuplicateRowIds();
        setDuplicateRowIds(dups);

        if (dups.size > 0) {
            toast.warn(
                "One or more controls you entered already exist in the system. Please change the highlighted rows.",
                { closeButton: false, autoClose: 3000 }
            );
            return;
        }

        setLoading(true);

        try {
            const typedControls = rowsWithValues.map(r => r.value.trim());
            const payload = { ...(controlData || {}), controls: typedControls };

            // Each entry carries the starred display name plus, when available, the
            // full set of values captured via the Add Control Details popup so the
            // caller can hydrate the Applicable Controls list and the CEA table with
            // real data instead of a blank pseudo control.
            const starredControls = rowsWithValues.map(r => {
                const name = r.value.trim();
                const starredName = name.endsWith(" *") ? name : `${name} *`;
                return {
                    control: starredName,
                    details: r.details ? { ...r.details, controlName: starredName } : null,
                };
            });

            onSuccess?.(starredControls);

            toast.success("Controls Added Successfully.");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const editingRow = controlRows.find(r => r.id === editingRowId) || null;

    return (
        <div className="abbr-popup-overlay">
            <div className="control-suggest-popup-content">
                <div className="abbr-popup-header">
                    <h2 className="abbr-popup-title">Add New Controls</h2>
                    <button className="abbr-popup-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="control-suggestion-popup-group">
                        <div className="control-suggestion-table-scroll">
                            <table className="control-suggestion-popup-page-table">
                                <tbody>
                                    {controlRows.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            style={{
                                                backgroundColor:
                                                    (typedDuplicateRowIds.has(row.id) || duplicateRowIds.has(row.id))
                                                        ? "#ffd6d6"
                                                        : "transparent"
                                            }}
                                        >
                                            <td>
                                                <div className="ibra-popup-page-row-actions">
                                                    <textarea
                                                        value={row.value}
                                                        onChange={(e) => handleControlChange(row.id, e.target.value)}
                                                        className="ibra-popup-page-input-table-controls-text-areas ibra-popup-page-row-input"
                                                        placeholder="Insert Control Title"
                                                        style={{ resize: "none" }}
                                                        readOnly={readOnly}
                                                    />

                                                    {!readOnly && (
                                                        <>
                                                            {false && DETAILED_CONTROL_ADD && (
                                                                <button
                                                                    type="button"
                                                                    className="ibra-popup-page-action-button"
                                                                    onClick={() => openDetailsPopup(row.id)}
                                                                    title={row.details ? "Edit control details" : "Add control details"}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="ibra-popup-page-action-button"
                                                                onClick={() => removeControlRow(row.id)}
                                                                title="Remove control"
                                                            >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="ibra-popup-page-action-button-add-hazard"
                                                                onClick={() => insertControlRowAfter(index)}
                                                                title="Insert control below"
                                                            >
                                                                <FontAwesomeIcon icon={faCirclePlus} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="abbr-popup-buttons">
                        <button
                            type="submit"
                            className="abbr-popup-button"
                            disabled={loading || readOnly}
                            style={{ width: "40%" }}
                        >
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Submit"}
                        </button>
                    </div>
                </form>
            </div>

            {editingRowId && (
                <AddControlDetailsPopup
                    onClose={closeDetailsPopup}
                    onSubmit={handleDetailsSubmit}
                    initialValues={editingRow?.details || (editingRow?.value ? { controlName: editingRow.value } : null)}
                />
            )}
        </div>
    );
};

export default SuggestMultipleControls;