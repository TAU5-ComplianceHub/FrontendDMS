import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced, faCertificate, faListOl, faChevronLeft, faChevronRight, faArrowLeft, faCaretLeft, faCaretRight, faCamera, faLock } from '@fortawesome/free-solid-svg-icons';
import TopBar from "../../Notifications/TopBar";
import ChangeStudentPassword from "./ChangeStudentPassword";

const StudentProfilePage = () => {
    const navigate = useNavigate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [user, setUser] = useState({});
    const [userID, setUserID] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [dateAdded, setDateAdded] = useState("");
    const [email, setEmail] = useState("");
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [reset, setReset] = useState(false);
    const handleCameraClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileSelected = async (e) => {
        const files = e.target.files;
        if (!files || !files.length) return; // user cancelled

        const file = files[0];

        // Enforce media files (images only)
        if (!/^image\/(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(file.type || "")) {
            toast.error("Please select an image file (PNG, JPG, GIF, WebP, BMP, TIFF).");
            e.target.value = ""; // reset so the same file can be re-chosen later
            return;
        }

        try {
            const token = sessionStorage.getItem("studentToken");
            if (!token || !userID) {
                toast.error("Not authenticated.");
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const resp = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingStudentManagement/${userID}/profile-picture`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`, // DON'T set Content-Type; browser will set multipart boundary
                    },
                    body: formData,
                }
            );

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err?.error || "Upload failed");
            }

            await fetchAndCacheProfilePic(userID, token);

            setProfilePic(sessionStorage.getItem("profilePicStudent") || null);

            toast.success("Profile picture updated.");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error uploading profile picture.");
        } finally {
            e.target.value = "";
        }
    };

    async function fetchAndCacheProfilePic(userId, token) {
        try {
            const resp = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingStudentManagement/${userId}/profile-picture`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (resp.status === 200) {
                const blob = await resp.blob();
                const toDataURL = (blob) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                const dataUrl = await toDataURL(blob);
                sessionStorage.setItem("profilePicStudent", dataUrl);
            } else {
                sessionStorage.removeItem("profilePicStudent");
            }
        } catch (err) {
            sessionStorage.removeItem("profilePicStudent");
        }
    }

    useEffect(() => {
        const cached = sessionStorage.getItem('profilePicStudent');
        setProfilePic(cached || null);
    }, []);

    useEffect(() => {
        const storedToken = sessionStorage.getItem("studentToken");
        if (!storedToken) return;
        try {
            const decoded = jwtDecode(storedToken) || {};
            const id = decoded?.userId || decoded?._id || decoded?.id || decoded?.sub || "";
            setUserID(id || "");
        } catch (e) {
            console.warn("Failed to decode token:", e);
            setUserID("");
        }
    }, []);

    useEffect(() => {
        if (!userID) return; // do nothing until we have an id

        const ac = new AbortController();

        (async () => {
            try {
                const resp = await fetch(
                    `${process.env.REACT_APP_URL}/api/onlineTrainingStudentManagement/studentInfo`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("studentToken")}` },
                        signal: ac.signal,
                    }
                );

                if (!resp.ok) throw new Error(`Failed to fetch values (${resp.status})`);

                const data = await resp.json();
                if (!data || typeof data !== "object") return;

                console.log("Fetched student profile data:", data);
                setUser(data.user);

                setFirstName(data.user.name || "");
                setLastName(data.user.surname || "");
                setEmail(data.user.email || "");
                setContactNumber(data.user.contactNr || "");
                setIdNumber(data.user.idNumber || "");
                setDateAdded(data.user.dateAdded ? data.user.dateAdded : "N/A");
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        })();

        return () => ac.abort(); // cancel in-flight request if userID changes/unmounts
    }, [userID]);

    const formatDate = (dateString) => {
        if (dateString === "" || dateString === null) return "N/A"
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="dc-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/studentHomePage')} title="Home" />
                        <p className="logo-text-um">Student Profile</p>
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
            <div className="main-box-user-profile">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>

                    {/* This div creates the space in the middle */}
                    <div className="spacer"></div>

                    {/* Container for right-aligned icons */}
                    <TopBar student={true} isProfile={true} />
                </div>

                <div className="scrollable-box-user-profile-home">
                    <div className="up-profile-card">
                        {/* Left: avatar + username */}
                        <div className="up-profile-left">
                            <div className="up-avatar-wrap" title="Change profile picture">
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="up-avatar-img"
                                />

                                {/* Camera badge triggers file picker */}
                                <div className="up-camera-badge" onClick={handleCameraClick}>
                                    <FontAwesomeIcon icon={faCamera} />
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleFileSelected}
                                />
                            </div>
                            <div className="up-username">{username}</div>
                        </div>

                        <div className="up-profile-divider" />

                        {/* Right: personal details */}
                        <div className="up-profile-right">
                            <div className="up-section-title">Personal Details</div>
                            <div className="up-section-rule"></div>

                            <div className="up-details-grid">
                                <div className="up-field">
                                    <label>First Name</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="Insert Name (e.g., John)" value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)} />
                                </div>

                                <div className="up-field">
                                    <label>Last Name</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="No Last Name" value={lastName}
                                        onChange={(e) => setLastName(e.target.value)} />
                                </div>

                                <div className="up-field">
                                    <label>Email</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="Insert your email address (e.g., jsmith@tau5.co.za)" value={email}
                                        onChange={(e) => setEmail(e.target.value)} />
                                </div>

                                <div className="up-field">
                                    <label>Contact Number</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="Insert your contact number (e.g., 082 123 4567)" value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)} />
                                </div>

                                <div className="up-field">
                                    <label>ID Number</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="Insert your ID number (e.g., 1234567890123)" value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)} />
                                </div>

                                <div className="up-field">
                                    <label>Date Added</label>
                                    <input readOnly className="up-input" style={{ cursor: "default" }} placeholder="Insert your date added (e.g., 2024-01-01)" value={formatDate(dateAdded)}
                                        onChange={(e) => setDateAdded(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="up-pw-card">
                        <div className="up-pw-title">Password Management</div>

                        <div className="up-pw-icon-wrap">
                            <FontAwesomeIcon icon={faLock} className="up-pw-icon" />
                        </div>

                        <button
                            className="up-change-pw-btn"
                            onClick={() => setReset(true)}  // or open your modal
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
            {reset && <ChangeStudentPassword onClose={() => setReset(false)} />}
        </div>
    );
};

export default StudentProfilePage;