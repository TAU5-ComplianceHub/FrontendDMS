import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPeopleGroup, faX, faSort, faCircleUser, faBell, faArrowLeft, faSearch, faFolderOpen, faFileCirclePlus, faFolder, faCloudUploadAlt, faUsersCog, faSitemap, faCaretLeft, faCaretRight, faPersonChalkboard, faBookOpen, faBullhorn, faChalkboardTeacher, faDownload, faLaptop, faCircle } from '@fortawesome/free-solid-svg-icons';
import TopBar from "../Notifications/TopBar";
import CreateProfilePopup from "../VisitorsInduction/Popups/CreateProfilePopup";

const TMSHomePage = () => {
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [token, setToken] = useState('');
    const [count, setCount] = useState([]);
    const [loggedInUserId, setloggedInUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const clearSearch = () => {
        setSearchQuery("");
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            console.log(decodedToken);
            setloggedInUserId(decodedToken.userId);
        }
    }, [navigate]);

    const TOTAL_SLOTS = 12;

    const paddedDocs = [...count];

    // Add placeholders if fewer than 12
    while (paddedDocs.length < TOTAL_SLOTS) {
        paddedDocs.push(null);
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="user-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/home')} title="Home" />
                        <p className="logo-text-um">Training Management</p>
                    </div>
                    <div className="button-container-rm-home">
                        <button className="but-rm-home" onClick={() => navigate("/FrontendDMS/futureEnhancementTMS")}>
                            <div className="button-content">
                                <span className="button-text">Coming Soon</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {!isSidebarVisible && (
                <div className="sidebar-hidden">
                    <div className="sidebar-toggle-icon" title="Show Sidebar" onClick={() => setIsSidebarVisible(true)}>
                        <FontAwesomeIcon icon={faCaretRight} />
                    </div>
                </div>
            )}

            <div className="main-box-user">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate("/FrontendDMS/home")} icon={faArrowLeft} title="Back" />
                    </div>
                    {/* This div creates the space in the middle */}
                    <div className="spacer"></div>

                    {/* Container for right-aligned icons */}
                    <TopBar />
                </div>

                <div className="scrollable-box-fi-home">
                    <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/visitorInductionHome")}>
                        <>
                            <div className="icon-dept">
                                <img src={`${process.env.PUBLIC_URL}/visitorInductionMainIcon.svg`} className={"icon-dept"} />
                            </div>
                            <h3 className="document-title-fi-home">Visitor Induction</h3>
                        </>
                    </div>
                    <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/visitorManagementPage")}>
                        <>
                            <div className="icon-dept">
                                <img src={`${process.env.PUBLIC_URL}/visitorManagement.svg`} className={"icon-dept"} />
                            </div>
                            <h3 className="document-title-fi-home">Visitor Management</h3>
                        </>
                    </div>
                    {true && (<div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/onlineTrainingHome")}>
                        <>
                            <div className="icon-dept">
                                <FontAwesomeIcon icon={faCircle} style={{ color: "#002060" }} className={"icon-dept"} />
                            </div>
                            <h3 className="document-title-fi-home">Online Training</h3>
                        </>
                    </div>)}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default TMSHomePage;