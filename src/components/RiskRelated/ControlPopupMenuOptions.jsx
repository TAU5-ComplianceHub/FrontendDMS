import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ControlPopupMenuOptions = ({ isOpen = true, id }) => {
    const navigate = useNavigate();

    return (
        <div className="popup-menu-container-certificate-files">
            {isOpen && (
                <div className="popup-content-certificate-files"
                >
                    <>
                        <ul>
                            <li
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/FrontendDMS/controlsHistory/${id}`);
                                }}
                            >
                                Version History
                            </li>
                        </ul>
                    </>
                </div>
            )}
        </div>
    );
};

export default ControlPopupMenuOptions;