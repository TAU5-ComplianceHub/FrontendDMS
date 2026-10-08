import React from "react";
import { useNavigate } from "react-router-dom";

const PopupMenuUsers = ({ isOpen, user, isAdmin, openAssignRolesModal, closeMenu }) => {
    const navigate = useNavigate();

    return (
        <div className="popup-menu-container-pub-files" style={{ top: "35px", right: "30px" }}>
            {isOpen && (
                <div className="popup-content-pub-files">
                    {!isAdmin && (
                        <ul>
                            <li onClick={() => { closeMenu(); openAssignRolesModal(user); }}>Assign Roles</li>
                        </ul>
                    )}
                    <ul>
                        <li onClick={() => { closeMenu(); navigate(`/FrontendDMS/userActivity/${user._id}`); }}>Activity Log</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PopupMenuUsers;