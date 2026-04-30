import React from "react";

const ReopenAllocatedTask = ({ open, taskName, onClose, onConfirm }) => {
    if (!open) return null;

    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">Reopen Task</h2>
                    <button className="delete-file-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text">Are you sure you want to reopen this task?</div>
                    <div>{taskName || ""}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-delete" onClick={onConfirm}>
                        Reopen
                    </button>
                    <button className="delete-file-button-cancel" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReopenAllocatedTask;
