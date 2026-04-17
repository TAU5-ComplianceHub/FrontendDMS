import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrashAlt, faPlus, faInfoCircle, faCirclePlus, faCalendarDays, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import DatePicker from 'react-multi-date-picker';
import { toast } from 'react-toastify';

const ModifyMyTask = ({ onClose, data }) => {
    const [completionStatus, setCompletionStatus] = useState("");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [attachements, setAttachements] = useState([]);
    const attachmentInputRef = useRef(null);
    const [pendingInsertAfterId, setPendingInsertAfterId] = useState(null);

    useEffect(() => {
        if (data) {
            setCompletionStatus(data.status || "");
            setComments(data.comments || "");
            setAttachements((data.userAttachments || []));
        }
    }, [data]);

    const generateAttachmentId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    };

    const getDisplayFileName = (fileName = "") => {
        const lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex <= 0) return fileName;
        return fileName.slice(0, lastDotIndex);
    };

    const handleOpenAttachmentPicker = (afterId = null) => {
        setPendingInsertAfterId(afterId);
        attachmentInputRef.current?.click();
    };

    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

    const handleAttachmentChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return;

        setAttachements((prev) => {
            const existingNames = new Set(
                prev.map((item) => String(item.name || "").toLowerCase().trim())
            );

            const validFiles = [];

            selectedFiles.forEach((file) => {
                const normalizedName = String(file.name || "").toLowerCase().trim();

                const alreadyExists =
                    existingNames.has(normalizedName) ||
                    validFiles.some(
                        (item) =>
                            String(item.name || "").toLowerCase().trim() === normalizedName
                    );

                if (alreadyExists) {
                    toast.warn(`"${getDisplayFileName(file.name)}" was not added because a file with the same name already exists.`, {
                        autoClose: 2000,
                        closeButton: false,
                    });
                    return;
                }

                if (file.size > MAX_FILE_SIZE_BYTES) {
                    toast.warn(`"${getDisplayFileName(file.name)}" was not added because it is larger than 5 MB.`, {
                        autoClose: 2000,
                        closeButton: false,
                    });
                    return;
                }

                validFiles.push({
                    id: generateAttachmentId(),
                    file,
                    name: file.name,
                    displayName: getDisplayFileName(file.name),
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                });

                existingNames.add(normalizedName);
            });

            if (!validFiles.length) {
                return prev;
            }

            if (!pendingInsertAfterId || prev.length === 0) {
                return [...prev, ...validFiles];
            }

            const insertIndex = prev.findIndex((item) => item.id === pendingInsertAfterId);

            if (insertIndex === -1) {
                return [...prev, ...validFiles];
            }

            const updated = [...prev];
            updated.splice(insertIndex + 1, 0, ...validFiles);
            return updated;
        });

        setPendingInsertAfterId(null);
        e.target.value = "";
    };

    const handleRemoveAttachment = (attachmentId) => {
        setAttachements((prev) => prev.filter((item) => item.id !== attachmentId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    return (
        <div className="ibra-popup-page-container">
            <div className="ibra-popup-page-overlay">
                <div className="ibra-popup-page-popup-right">
                    <div className="ibra-popup-page-popup-header-right">
                        <h2>Update My Task</h2>
                        <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                    </div>

                    <div className="ibra-popup-page-form-group-main-container">
                        <div className="ibra-popup-page-form-group-main-container-2 scrollable-container-controlea">
                            <div className="cea-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group">
                                    <label>
                                        Completion Status <span className="required-field">*</span>
                                    </label>
                                    <div className="ibra-popup-page-select-container">
                                        <select
                                            className="ibra-popup-page-select"
                                            value={completionStatus}
                                            onChange={(e) => setCompletionStatus(e.target.value)}
                                        >
                                            <option value="">Select Option</option>
                                            <option value="25% Completed">25% Completed</option>
                                            <option value="50% Completed">50% Completed</option>
                                            <option value="75% Completed">75% Completed</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="ibra-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group">
                                    <label style={{ fontSize: "15px" }}>Comments/ Notes</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="cea-popup-page-textarea-full"
                                        placeholder="Additional Comments or Notes"
                                        style={{ resize: "none" }}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="cea-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group">
                                    <label style={{ fontSize: "15px" }}>Attachments</label>

                                    <input
                                        ref={attachmentInputRef}
                                        type="file"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleAttachmentChange}
                                    />

                                    {attachements.length === 0 ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                paddingTop: "8px",
                                                paddingBottom: "4px"
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="ibra-popup-page-action-button-add-hazard"
                                                onClick={() => handleOpenAttachmentPicker(null)}
                                                title="Add Attachment"
                                                style={{ fontSize: "22px" }}
                                            >
                                                <FontAwesomeIcon icon={faCirclePlus} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {attachements.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="cea-popup-page-component-wrapper"
                                                    style={{
                                                        marginBottom: "0px",
                                                        padding: "10px 12px"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            gap: "12px"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                minWidth: 0,
                                                                flex: 1,
                                                                fontSize: "14px",
                                                                color: "#333",
                                                                wordBreak: "break-word"
                                                            }}
                                                        >
                                                            {attachment.displayName}
                                                        </div>

                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "6px"
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="ibra-popup-page-action-button"
                                                                onClick={() => handleRemoveAttachment(attachment.id)}
                                                                title="Remove Attachment"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="ibra-popup-page-action-button-add-hazard"
                                                                onClick={() => handleOpenAttachmentPicker(attachment.id)}
                                                                title="Add Attachment Below"
                                                            >
                                                                <FontAwesomeIcon icon={faCirclePlus} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="ibra-popup-page-form-footer">
                        <div className="create-user-buttons">
                            <button
                                className="ibra-popup-page-upload-button"
                                onClick={handleSubmit}
                            >
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : (`Submit`)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModifyMyTask;