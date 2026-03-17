import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPeopleGroup, faX, faSort, faCircleUser, faBell, faArrowLeft, faSearch, faFolderOpen, faFileCirclePlus, faFolder, faCloudUploadAlt, faUsersCog, faSitemap, faCaretLeft, faCaretRight, faPersonChalkboard, faDownload } from '@fortawesome/free-solid-svg-icons';
import TopBar from "../Notifications/TopBar";
import { saveAs } from "file-saver";
import ImportSiteInfo from "../UploadPage/ImportSiteInfo";
import ExportSIDPopup from "../Popups/ExportSIDPopup";
import { getCurrentUser, can, isAdmin, canIn } from "../../utils/auth";

const SGIAdminPage = () => {
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [token, setToken] = useState('');
    const access = getCurrentUser();
    const [count, setCount] = useState([]);
    const [loggedInUserId, setloggedInUserId] = useState('');
    const [exportLoad, setExportLoad] = useState(false);
    const [importSI, setImportSI] = useState(false);
    const navigate = useNavigate();

    const exportSID = async () => {
        try {
            setExportLoad(true);

            const response = await fetch(
                `${process.env.REACT_APP_URL}/api/siteInfoExport/export-sid`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to generate document");

            let filename = response.headers.get("X-Export-Filename");

            if (!filename) {
                const cd = response.headers.get("Content-Disposition") || "";
                const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
                if (match) filename = decodeURIComponent(match[1] || match[2]);
            }

            const documentName = "SID Document VN/A";

            if (!filename) filename = `${documentName}.xlsx`;

            const blob = await response.blob();
            saveAs(blob, filename);
            setExportLoad(false);

            toast.success("Site General Information successfully exported.", { autoClose: "2000", closeButton: false })
        } catch (error) {
            console.error("Error generating document:", error);
        }
    };

    const openImportSI = () => {
        setImportSI(true);
    };

    const closeImportSI = () => {
        setImportSI(false);
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
                        <p className="logo-text-um">Admin Page</p>
                    </div>


                    <div className="sidebar-logo-dm-fi">
                        <img src={`${process.env.PUBLIC_URL}/ddsAdmin2.svg`} alt="Logo" className="icon-risk-rm" />
                        <p className="logo-text-dm-fi">{"SGI Admin"}</p>
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
                {importSI && (<ImportSiteInfo onClose={closeImportSI} />)}
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>
                    {/* This div creates the space in the middle */}
                    <div className="spacer"></div>

                    {/* Container for right-aligned icons */}
                    <TopBar />
                </div>

                <div className="scrollable-box-fi-home">
                    {(can(access, "RMS", "systemAdmin") || isAdmin(access) || can(access, "DDS", "systemAdmin")) && (
                        <div className={`document-card-fi-home`} onClick={openImportSI}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/importSIDAdmin2.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">Import Site General Information</h3>
                            </>
                        </div>
                    )}

                    {(can(access, "RMS", "systemAdmin") || isAdmin(access) || can(access, "DDS", "systemAdmin")) && (
                        <div className={`document-card-fi-home`} onClick={exportSID}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/exportSIDAdmin2.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">Export Site General Information</h3>
                            </>
                        </div>
                    )}

                    {(can(access, "RMS", "systemAdmin") || isAdmin(access) || can(access, "DDS", "systemAdmin")) && (
                        <div className={`document-card-fi-home`} onClick={() => navigate("/FrontendDMS/sgiBackups")}>
                            <>
                                <div className="icon-dept">
                                    <img src={`${process.env.PUBLIC_URL}/importSIDAdminHome2.svg`} className={"icon-dept"} />
                                </div>
                                <h3 className="document-title-fi-home">View Site General Information Backups</h3>
                            </>
                        </div>
                    )}
                </div>
            </div>
            {exportLoad && (<ExportSIDPopup />)}
            <ToastContainer />
        </div>
    );
};

export default SGIAdminPage;