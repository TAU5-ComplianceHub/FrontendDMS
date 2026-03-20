import React, { useRef, useState } from "react";
import "./SupportingDocumentTable.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import {
    faChevronDown,
    faChevronUp
} from "@fortawesome/free-solid-svg-icons";

const SupportingDocumentTable = ({ collapsible = false, formData, setFormData, readOnly = false }) => {
    const [collapsed, setCollapsed] = useState(false);
    const isCollapsed = collapsible ? collapsed : false;
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
    };

    const removeFileExtension = (fileName) => {
        return fileName.replace(/\.[^/.]+$/, "");
    };

    const handleFileChange = (event) => {
        const selected = Array.from(event.target.files);
        const existingFiles = formData.supportingDocuments || [];

        const exactDuplicates = [];
        const sameNameDifferentExtension = [];
        const acceptedFiles = [];

        const existingBaseNames = new Set(
            existingFiles.map((doc) => removeFileExtension(doc.name).trim().toLowerCase())
        );

        const existingExactKeys = new Set(
            existingFiles.map((doc) => `${doc.name}__${doc.file?.size ?? 0}`)
        );

        const newBaseNames = new Set();
        const newExactKeys = new Set();

        selected.forEach((file) => {
            const baseName = removeFileExtension(file.name).trim().toLowerCase();
            const exactKey = `${file.name}__${file.size}`;

            const isExactDuplicate =
                existingExactKeys.has(exactKey) || newExactKeys.has(exactKey);

            const hasSameBaseName =
                existingBaseNames.has(baseName) || newBaseNames.has(baseName);

            if (isExactDuplicate) {
                exactDuplicates.push(file);
                return;
            }

            if (hasSameBaseName) {
                sameNameDifferentExtension.push(file);
                return;
            }

            acceptedFiles.push(file);
            newBaseNames.add(baseName);
            newExactKeys.add(exactKey);
        });

        const updatedFiles = [
            ...existingFiles,
            ...acceptedFiles.map((file, index) => ({
                nr: existingFiles.length + index + 1,
                name: file.name,
                file,
                note: ""
            }))
        ];

        if (exactDuplicates.length > 0) {
            toast.error("Some files were already added and were skipped.");
        }

        if (sameNameDifferentExtension.length > 0) {
            toast.error("A file with the same name already exists. Please rename the file or remove the existing one before uploading a different extension.");
        }

        setFormData({
            ...formData,
            supportingDocuments: updatedFiles
        });

        setSelectedFiles(updatedFiles);

        event.target.value = null;
    };

    const handleRemoveFile = (indexToRemove) => {
        const updatedDocuments = formData.supportingDocuments
            .filter((_, i) => i !== indexToRemove)
            .map((doc, i) => ({ ...doc, nr: i + 1 }));

        setFormData({
            ...formData,
            supportingDocuments: updatedDocuments,
        });

        setSelectedFiles(updatedDocuments);
    };

    return (
        <div className="input-row">
            <div className="input-box-ref">

                <h3 className="font-fam-labels">External Support Documents</h3>

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
                        {formData.supportingDocuments.length > 0 && (
                            <table className="vcr-table table-borders">
                                <thead className="cp-table-header">
                                    <tr>
                                        <th className="refColCen refNum" style={{ width: "5%" }}>Nr</th>
                                        <th className="refColCen refRef" style={{ width: "90%" }}>Name</th>
                                        {!readOnly && (<th className="refColCen refBut" style={{ width: "5%" }}>Action</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.supportingDocuments.map((row, index) => (
                                        <tr key={index}>
                                            <td className="refCent" style={{ fontSize: "14px" }}>{row.nr}</td>
                                            <td className="refCent" style={{ fontSize: "14px", textAlign: "left" }}>{removeFileExtension(row.name)}</td>
                                            {!readOnly && (<td className="ref-but-row procCent">
                                                <button className="remove-row-button" onClick={() => handleRemoveFile(index)}>
                                                    <FontAwesomeIcon icon={faTrash} title="Remove File" />
                                                </button>
                                            </td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <input
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {!readOnly && (<button className="add-row-button-ref" onClick={() => fileInputRef.current.click()}>
                            Select
                        </button>)}
                    </>
                )}
            </div>
        </div>
    );
};

export default SupportingDocumentTable;
