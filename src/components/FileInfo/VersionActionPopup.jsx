import React from "react";
import "./DownloadPopup.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const VersionActionPopup = ({
    closeModal,
    confirmAction,
    fileName,
    loading,
    actionType = "rollback",
    versionLabel
}) => {
    const isRollback = actionType === "rollback";

    return (
        <div className="download-popup-overlay">
            <div className="download-popup-content">
                <div className="download-file-header">
                    <h2 className="download-file-title">
                        {isRollback ? "Roll Back Document" : "Roll Forward Document"}
                    </h2>
                    <button
                        className="download-file-close"
                        onClick={closeModal}
                        title="Close Popup"
                    >
                        ×
                    </button>
                </div>

                <div className="download-file-group">
                    <div className="download-file-text">
                        {isRollback
                            ? "Do you want to roll back to this version?"
                            : "Do you want to roll forward to this version?"}
                    </div>
                    <div>{fileName}</div>
                </div>

                <div className="download-file-buttons">
                    <button
                        className="download-file-button-download"
                        onClick={confirmAction}
                        disabled={loading}
                    >
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : isRollback ? (
                            "Roll Back"
                        ) : (
                            "Roll Forward"
                        )}
                    </button>
                    <button
                        className="download-file-button-cancel"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VersionActionPopup;