import React from "react";

const SaveConfirmationPopup = ({
    setIsSaveModalOpen,
    onConfirmSave,
    onDiscard,
    draftTitle
}) => {
    return (
        <div className="delete-popup-overlay-um">
            <div className="delete-popup-content-um">
                <div className="delete-file-header-um">
                    <h2 className="delete-file-title-um">Save Draft</h2>
                    <button
                        className="delete-file-close-um"
                        onClick={onDiscard}
                        title="Close Popup"
                    >
                        ×
                    </button>
                </div>

                <div className="delete-file-group-um">
                    <div className="delete-file-text-um">
                        Do you want to save this draft before leaving?
                    </div>
                    <div>
                        <strong>{draftTitle || "Untitled Draft"}</strong>
                    </div>
                </div>

                <div className="delete-file-buttons-um">
                    <button
                        style={{ marginRight: "10px", marginLeft: "auto" }}
                        className="delete-file-button-cancel-um"
                        onClick={onConfirmSave}
                    >
                        Save
                    </button>
                    <button
                        style={{ marginLeft: "10px", marginRight: "auto" }}
                        className="delete-file-button-delete-um"
                        onClick={onDiscard}
                    >
                        Don't Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveConfirmationPopup;