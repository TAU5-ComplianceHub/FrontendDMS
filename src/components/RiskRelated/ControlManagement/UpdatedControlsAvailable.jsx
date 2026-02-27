import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const UpdatedControlsAvailable = ({ close, importControls, loading }) => {
    return (
        <div className="download-popup-overlay">
            <div className="download-popup-content">
                <div className="download-file-header">
                    <h2 className="download-file-title">Import Changed Controls</h2>
                    <button className="download-file-close" onClick={close} title="Close Popup">×</button>
                </div>

                <div className="download-file-group">
                    <div className="download-file-text">This Risk Assessment contains controls that have been updated in the system, do you want to choose which of these changes to import?</div>
                </div>

                <div className="download-file-buttons">
                    <button className="download-file-button-download" onClick={importControls} disabled={loading}>
                        {'Import'}
                    </button>
                    <button className="download-file-button-cancel" onClick={close}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdatedControlsAvailable;