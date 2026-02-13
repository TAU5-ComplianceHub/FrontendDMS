import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";

const FilterRemovePopup = ({ isOpen, anchorRect, onClose, onClear, onMouseEnter, onMouseLeave }) => {
    const [positionStyle, setPositionStyle] = useState({});

    useEffect(() => {
        if (isOpen && anchorRect) {
            const MENU_WIDTH = 160;
            // Center horizontally relative to the button
            const left = anchorRect.left - (MENU_WIDTH / 2) + (anchorRect.width / 2);
            const top = anchorRect.bottom + 5; // 5px gap below button

            setPositionStyle({
                top: top,
                left: left,
                width: MENU_WIDTH,
                position: "fixed",
                zIndex: 9999,
                backgroundColor: "white",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                borderRadius: "8px",
                border: "1px solid #eee",
                padding: "5px 0"
            });
        }
    }, [isOpen, anchorRect]);

    if (!isOpen) return null;

    return (
        <div
            className="popup-menu-container-filters"
            style={positionStyle}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li
                    onClick={() => {
                        onClear();
                        onClose();
                    }}
                    style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "normal",
                        alignItems: "center",
                        gap: "10px",
                        transition: "background-color 0.2s",
                        textAlign: "center"
                    }}
                >
                    Clear All Filters
                </li>
            </ul>
        </div>
    );
};

export default FilterRemovePopup;