import React from "react";

const DeleteAllocatedControlEvaluation = ({
    cancel,
    cancelled,
    open,
    task,
    taskName,
    onClose,
    handleDeleteTask,
}) => {
    // Cancelled evaluations should use the normal delete popup,
    // even when cancel is also true.
    const showCancelMode = cancelled ? false : cancel;

    const title = showCancelMode
        ? "Cancel Allocated Control Evaluation"
        : "Delete Allocated Control Evaluation";

    const bodyText = showCancelMode
        ? "Are you sure you want to cancel this allocated control evaluation?"
        : "Are you sure you want to delete this allocated control evaluation?";

    const confirmLabel = showCancelMode ? "Cancel" : "Delete";

    if (!open) {
        return null;
    }

    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">{title}</h2>

                    <button
                        className="delete-file-close"
                        onClick={onClose}
                        title="Close Popup"
                    >
                        ×
                    </button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text">{bodyText}</div>
                    <div>{taskName || ""}</div>
                </div>

                <div className="delete-file-buttons">
                    <button
                        className="delete-file-button-delete"
                        onClick={handleDeleteTask}
                    >
                        {confirmLabel}
                    </button>

                    <button
                        className="delete-file-button-cancel"
                        onClick={onClose}
                    >
                        Keep
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAllocatedControlEvaluation;
