import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const DeleteAllocatedTask = ({ cancel, open, task, taskName, onClose, handleDeleteTask }) => {
    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">{cancel ? "Cancel Allocated Task" : "Delete Allocated Task"}</h2>
                    <button className="delete-file-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text">{cancel ? "Are you sure you want to cancel this allocated task?" : "Are you sure you want to delete this allocated task?"}</div>
                    <div>{taskName || ""}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-delete" onClick={handleDeleteTask}>
                        {cancel ? "Cancel" : "Delete"}
                    </button>
                    <button className="delete-file-button-cancel" onClick={onClose}>
                        Keep
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAllocatedTask;