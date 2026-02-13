import React, { useEffect, useRef, useState } from "react";
import "./AddMenuPopup.css";

const AddMenuPopup = ({ isOpen, anchorRect, onClose, onSelect, onMouseEnter, onMouseLeave }) => {
    const menuRef = useRef(null);
    const [positionStyle, setPositionStyle] = useState({});

    // Handle closing on scroll or click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose(); // Close on scroll as requested
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("scroll", handleScroll, { capture: true }); // Capture needed for scrolling within divs

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, [isOpen, onClose]);

    // Calculate position
    useEffect(() => {
        if (isOpen && anchorRect) {
            const MENU_HEIGHT = 85; // Approx height of 2 items
            const spaceBelow = window.innerHeight - anchorRect.bottom;

            // Inside AddMenuPopup.jsx useEffect
            let top;
            // If flipping up, add a tiny offset so it overlaps the button slightly
            if (spaceBelow < MENU_HEIGHT) {
                top = anchorRect.top - MENU_HEIGHT + 5;
            } else {
                top = anchorRect.bottom - 5;
            }

            setPositionStyle({
                top: top,
                left: anchorRect.left - (190 + anchorRect.width) / 2, // Center horizontally relative to button
            });
        }
    }, [isOpen, anchorRect]);

    if (!isOpen) return null;

    return (
        <div
            className="popup-menu-container-add-options"
            style={positionStyle}
            ref={menuRef}
            onMouseEnter={onMouseEnter} // Added this
            onMouseLeave={onMouseLeave} // Added this
        >
            <div className="popup-content-add-options">
                <ul>
                    <li onClick={() => onSelect("BEFORE")}>Add Before</li>
                    <li onClick={() => onSelect("AFTER")}>Add After</li>
                </ul>
            </div>
        </div>
    );
};

export default AddMenuPopup;