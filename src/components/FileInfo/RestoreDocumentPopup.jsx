import React, { useEffect, useState } from "react";
import "./DeletePopup.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const RestoreDocumentPopup = ({ closeModal, restoreFile, selectedFileName, loading }) => {
    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">Restore File</h2>
                    <button className="delete-file-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text">{"Are you sure you want to restore this file from trash?"}</div>
                    <div>{selectedFileName}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-delete" onClick={restoreFile} disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Restore'}
                    </button>
                    <button className="delete-file-button-cancel" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreDocumentPopup;