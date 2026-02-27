import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BurgerMenuFI.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const BurgerMenuHomePage = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/FrontendDMS/");
    };

    return (
        <div className="burger-menu-container-home-page">
            {isOpen && (
                <div className="menu-content-FI" onMouseLeave={() => setIsOpen(false)}>
                    <ul>
                        {(<li onClick={() => navigate("/FrontendDMS/userProfile")}>My Profile</li>)}
                        <li onClick={handleLogout}>Logout</li>

                    </ul>
                </div>
            )}
        </div>
    );
};

export default BurgerMenuHomePage;