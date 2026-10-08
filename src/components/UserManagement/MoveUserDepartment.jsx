import React from "react";
import "./DeletePopupDM.css";

const MoveUserDepartment = ({
    setIsDeleteModalOpen,
    departmentName,
    handleDelete,
    title = "Delete Department",
    message = "Do you want to delete the following department?",
    confirmText = "Delete",
    cancelText = "Keep"
}) => {
    const closePopup = () => {
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="delete-popup-overlay-dm" style={{ zIndex: "200000" }}>
            <div className="delete-popup-content-dm">
                <div className="delete-file-header-dm">
                    <h2 className="delete-file-title-dm">{title}</h2>
                    <button className="delete-file-close-dm" onClick={closePopup} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group-dm">
                    <div className="delete-file-text-dm" style={{ marginBottom: "0px" }}>{message}</div>
                </div>

                <div className="delete-file-buttons-dm">
                    <button className="delete-file-button-delete-dm" onClick={handleDelete}>
                        {confirmText}
                    </button>
                    <button className="delete-file-button-cancel-dm" onClick={closePopup}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveUserDepartment;
