import React from "react";
import "./DeletePopupUM.css";

const DeletePopupUserManagement = ({ form, setIsDeleteModalOpen, deleteUser, userToDelete }) => {
    const isDeletedUser = form === "deleted";

    const title = isDeletedUser ? "Permanently Delete User" : "Delete User";

    const message = isDeletedUser
        ? "Do you want to permanently delete this user?"
        : "Do you want to delete this user?";

    const actionLabel = "Delete";
    const keepLabel = "Keep";

    return (
        <div className="delete-popup-overlay-um">
            <div className="delete-popup-content-um">
                <div className="delete-file-header-um">
                    <h2 className="delete-file-title-um">{title}</h2>
                    <button
                        className="delete-file-close-um"
                        onClick={() => setIsDeleteModalOpen(false)}
                        title="Close Popup"
                    >
                        ×
                    </button>
                </div>

                <div className="delete-file-group-um">
                    <div className="delete-file-text-um">{message}</div>
                    <div>
                        <strong>{userToDelete?.username}</strong>
                    </div>
                </div>

                <div className="delete-file-buttons-um">
                    <button
                        className="delete-file-button-delete-um"
                        onClick={() => deleteUser(userToDelete._id)}
                    >
                        {actionLabel}
                    </button>
                    <button
                        className="delete-file-button-cancel-um"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        {keepLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePopupUserManagement;