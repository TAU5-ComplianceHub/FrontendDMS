import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusCircle, faDownload } from "@fortawesome/free-solid-svg-icons";

const CourseResourceTable = ({ formData, setFormData, readOnly = false }) => {
    const fileInputRef = useRef(null);

    const removeFileExtension = (fileName = "") =>
        fileName.replace(/\.[^/.]+$/, "");

    const normalizeResources = () =>
        Array.isArray(formData.resources) ? formData.resources : [];

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const current = normalizeResources();

        const added = files.map((file, idx) => ({
            nr: current.length + idx + 1,
            name: file.name,
            file
        }));

        setFormData({
            ...formData,
            resources: [...current, ...added]
        });

        event.target.value = null;
    };

    const handleRemoveFile = (index) => {
        const updated = normalizeResources()
            .filter((_, i) => i !== index)
            .map((r, i) => ({ ...r, nr: i + 1 }));

        setFormData({
            ...formData,
            resources: updated
        });
    };

    const triggerBrowserDownload = (url, filename) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownload = async (row) => {
        // 1) local file (unsaved)
        if (row.file instanceof File) {
            const url = URL.createObjectURL(row.file);
            triggerBrowserDownload(url, row.file.name);
            URL.revokeObjectURL(url);
            return;
        }

        // 2) saved file (download via backend route)
        // 2) saved file (download via backend route) - ✅ fetch blob + download
        if (row.media?.fileId) {
            const base = (process.env.REACT_APP_URL || "").replace(/\/+$/, "");
            const url = `${base}/api/onlineTrainingCourses/downloadResource/${row.media.fileId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });

            if (!response.ok) {
                console.error("Failed to download resource");
                return;
            }

            // Prefer filename from Content-Disposition if available
            const disposition = response.headers.get("content-disposition") || "";
            const match = disposition.match(/filename="([^"]+)"/i);
            const filenameFromHeader = match?.[1];

            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            triggerBrowserDownload(objUrl, filenameFromHeader || row.name || "resource");
            URL.revokeObjectURL(objUrl);
            return;
        }

        console.error("No file or media.fileId found for this resource.");
    };

    const resources = normalizeResources();

    return (
        <div className="input-row">
            <div className="input-box-ref">
                <h3 className="font-fam-labels">Course Resources</h3>

                {resources.length > 0 && (
                    <table className="vcr-table table-borders">
                        <thead className="cp-table-header">
                            <tr>
                                <th className="refColCen refNum" style={{ width: "5%" }}>Nr</th>
                                <th className="refColCen refRef" style={{ width: "90%" }}>Name</th>
                                {!readOnly && (
                                    <th className="refColCen refBut" style={{ width: "5%" }}>Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map((row, index) => (
                                <tr key={index}>
                                    <td className="refCent">{row.nr}</td>
                                    <td className="refCent" style={{ textAlign: "left" }}>
                                        {removeFileExtension(row.name)}
                                    </td>

                                    {!readOnly && (
                                        <td className="procCent action-cell-auth-risk">
                                            <button
                                                className="ibra-add-row-button"
                                                onClick={() => handleDownload(row)}
                                                title="Download Resource"
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </button>

                                            <button
                                                className="remove-row-button"
                                                onClick={() => handleRemoveFile(index)}
                                                title="Remove Resource"
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

                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                {/* ✅ Toggle button same way as AbbreviationTable */}
                {!readOnly && resources.length === 0 && (
                    <button
                        className="add-row-button-ref"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Select
                    </button>
                )}

                {!readOnly && resources.length > 0 && (
                    <button
                        className="add-row-button-ref-plus"   // create or reuse your plus-style class
                        onClick={() => fileInputRef.current.click()}
                        title="Add Resource"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseResourceTable;
