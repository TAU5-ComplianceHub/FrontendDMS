import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import {
    faChevronDown,
    faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Work Order Descriptors - a stripped-down version of PPETable: no N/A
// checkbox, no popup, no "suggest new" flow. Just a plain Nr / Descriptor /
// Action table, capped at MAX_DESCRIPTORS rows, that writes straight into
// formData.workOrderDescriptors. FTSCreatePageTemplate's title-sync effect
// reads that field and appends it to the back of formData.title.
const MAX_DESCRIPTORS = 2;

const WorkOrderDescriptorsTable = ({ collapsible = false, formData, setFormData, readOnly = false }) => {
    const [collapsed, setCollapsed] = useState(true);
    const isCollapsed = collapsible ? collapsed : false;

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
    };

    const descriptors = formData.workOrderDescriptors || [];

    const addRow = () => {
        if (descriptors.length >= MAX_DESCRIPTORS) {
            toast.dismiss();
            toast.clearWaitingQueue();
            toast.warn(`You cannot add more than ${MAX_DESCRIPTORS} descriptors.`, {
                closeButton: true,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            workOrderDescriptors: [...(prev.workOrderDescriptors || []), { descriptor: "" }],
        }));
    };

    const removeRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            workOrderDescriptors: (prev.workOrderDescriptors || []).filter((_, i) => i !== index),
        }));
    };

    const updateRow = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            workOrderDescriptors: (prev.workOrderDescriptors || []).map((row, i) =>
                i === index ? { ...row, descriptor: value } : row
            ),
        }));
    };

    return (
        <div className="input-row" style={{ marginTop: "0px", marginBottom: "10px" }}>
            <div className="ppe-input-box" style={{ marginTop: "0px" }}>
                <div className="ppe-header">
                    <h3 className="font-fam-labels">Work Order Descriptors</h3>
                </div>

                {collapsible && (<button
                    className="top-right-button-ibra"
                    title={collapsed ? "Expand Section" : "Collapse Section"}
                    onClick={toggleCollapse}
                    style={{ color: "gray" }}
                    type="button"
                >
                    <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} />
                </button>)}

                {(!isCollapsed) && (
                    <>
                        {descriptors.length > 0 && (
                            <table className="vcr-table font-fam table-borders">
                                <thead className="cp-table-header">
                                    <tr>
                                        <th style={{ textAlign: "center", width: "95%" }}>Descriptor</th>
                                        {!readOnly && (<th style={{ textAlign: "center", width: "5%" }}>Action</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {descriptors.map((row, index) => (
                                        <tr key={index}>
                                            <td style={{ fontSize: "14px" }}>
                                                <textarea
                                                    className="aim-textarea-risk-create-textarea-nopads font-fam aim-textarea-text"
                                                    value={row.descriptor || ""}
                                                    readOnly={readOnly}
                                                    onChange={(e) => updateRow(index, e.target.value)}
                                                    style={{ minHeight: "0px" }}
                                                />
                                            </td>
                                            {!readOnly && (
                                                <td className="procCent">
                                                    <div className="term-action-buttons">
                                                        <button
                                                            className="remove-row-button"
                                                            style={{ paddingRight: "6px" }}
                                                            onClick={() => removeRow(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} title="Remove Row" />
                                                        </button>
                                                        <button
                                                            className="edit-terms-row-button"
                                                            style={{ paddingLeft: "6px" }}
                                                            onClick={addRow}
                                                        >
                                                            <FontAwesomeIcon icon={faPlusCircle} title="Add Descriptor" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {(descriptors.length === 0 && !readOnly) && (
                            <button className="add-row-button-ppe" onClick={addRow}>
                                Add
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WorkOrderDescriptorsTable;