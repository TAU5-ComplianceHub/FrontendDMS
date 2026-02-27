import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, can, isAdmin, canIn } from "../../utils/auth";
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPeopleGroup, faX, faSort, faCircleUser, faBell, faArrowLeft, faSearch, faFolderOpen, faFileCirclePlus, faFolder, faCloudUploadAlt, faUsersCog, faSitemap, faCaretLeft, faCaretRight, faPersonChalkboard } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from "file-saver";
import MigrateOwnership from "../FileInfo/MigrateOwnership";
import TopBar from "../Notifications/TopBar";

const MigrationPage = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [count, setCount] = useState([]);
    const access = getCurrentUser();
    const [importSI, setImportSI] = useState(false);
    const [migrate, setMigrate] = useState(false);
    const navigate = useNavigate();

    const openImportSI = () => {
        setImportSI(true);
    };

    const closeImportSI = () => {
        setImportSI(false);
    };

    const openMigrate = () => {
        setMigrate(true);
    };

    const closeMigrate = () => {
        setMigrate(!migrate);
    };

    const TOTAL_SLOTS = 12;

    const paddedDocs = [...count];

    while (paddedDocs.length < TOTAL_SLOTS) {
        paddedDocs.push(null);
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
                        <p className="logo-text-um">Admin Page</p>
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
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>

                    <div className="spacer"></div>

                    <TopBar />
                </div>

                <div className="scrollable-box-fi-home">
                    {canIn(access, "DMS", "systemAdmin") &&
                        <div className={`document-card-fi-home`} onClick={openMigrate} >
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/migrate1.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">DMS Document Migration</h3>
                            </>
                        </div>
                    }
                    {canIn(access, "DDS", "systemAdmin") && (
                        <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/allDDSDrafts")}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/migrate1.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">DDS Draft Migration</h3>
                            </>
                        </div>
                    )}

                    {canIn(access, "RMS", "systemAdmin") && (
                        <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/allRiskDrafts")}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/migrate1.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">RMS Draft Migration</h3>
                            </>
                        </div>
                    )}

                    {canIn(access, "TMS", "systemAdmin") && (
                        <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/allTMSDrafts")}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/migrate1.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">TMS Draft Migration</h3>
                            </>
                        </div>
                    )}
                </div>
            </div>
            {migrate && (<MigrateOwnership onClose={closeMigrate} />)}
            <ToastContainer />
        </div>
    );
};

export default MigrationPage;