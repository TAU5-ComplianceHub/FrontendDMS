import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faCircleUser, faHome } from "@fortawesome/free-solid-svg-icons";
import BurgerMenuFI from "../FileInfo/BurgerMenuFI";
import Notifications from "./Notifications";
import BurgerMenuVisitorQR from "./BurgerMenuVisitorQR";

const TopBarVisitorQR = ({ visitor = false, viewQRCode }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [count, setCount] = useState("");
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        // Load from sessionStorage on mount
        const cached = sessionStorage.getItem('profilePic');
        setProfilePic(cached || null);
    }, []);

    const fetchNotificationCount = async () => {
        const route = `/api/notifications/count`;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}${route}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notification count');
            }
            const data = await response.json();
            setCount(data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    return (
        <div className="icons-container">
            <div className="burger-menu-icon-um-home">
                <FontAwesomeIcon onClick={() => navigate("/FrontendDMS/visitorHomePage")} icon={faHome} title="Home" />
            </div>
            <div className="burger-menu-icon-um" onClick={() => setIsMenuOpen(!isMenuOpen)} title="Menu" style={{ cursor: "pointer" }}>
                {profilePic && !visitor ? (
                    <img
                        src={profilePic}
                        alt="Profile"
                        style={{
                            width: "28px",          // match icon size
                            height: "28px",
                            borderRadius: "50%",    // circle
                            objectFit: "cover",
                            display: "block"
                        }}
                    />
                ) : (
                    <FontAwesomeIcon icon={faCircleUser} />
                )}
            </div>
            {isMenuOpen && (<BurgerMenuVisitorQR isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} viewQR={viewQRCode} />)}
        </div>
    );
};

export default TopBarVisitorQR;