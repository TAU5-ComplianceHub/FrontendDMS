import React, { useEffect, useState } from "react";
import "./MigrateOwnership.css";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";

const MigrateOwnership = ({ onClose }) => {
    const [currentOwners, setCurrentOwners] = useState([]); // List of people who currently own files
    const [usersList, setUsersList] = useState([]);         // List of all potential new owners (system users)

    const [selectedOldOwner, setSelectedOldOwner] = useState('');
    const [selectedNewOwner, setSelectedNewOwner] = useState('');
    const [ownerFiles, setOwnerFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState('');
    const [ownershipChanges, setOwnershipChanges] = useState({});

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUserID(decodedToken.userId);
        }
    }, []);

    // 1. Fetch Distinct Owners (People who actually own  now)
    useEffect(() => {
        const fetchCurrentOwners = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/file/owners/distinct`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setCurrentOwners(response.data.owners || []);
            } catch (error) {
                console.error("Failed to fetch distinct owners:", error);
                toast.error("Failed to load current file owners");
            }
        };
        fetchCurrentOwners();
    }, []);

    // 2. Fetch All Users (Potential new owners)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_URL}/api/user/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsersList(data.users);
            } catch (error) {
                console.error(error.message);
                toast.error("Failed to load user list");
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchOwnerFiles = async () => {
            if (!selectedOldOwner) {
                setOwnerFiles([]);
                setOwnershipChanges({});
                return;
            }

            setFilesLoading(true);

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_URL}/api/file/owners/files`,
                    { owner: selectedOldOwner },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                setOwnerFiles(response.data.files || []);
                const initialChanges = {};
                (response.data.files || []).forEach(file => {
                    initialChanges[file._id] = null;
                });
                setOwnershipChanges(initialChanges);
            } catch (error) {
                console.error("Failed to fetch owner files:", error);
                toast.error("Failed to load files for selected owner");
                setOwnerFiles([]);
            } finally {
                setFilesLoading(false);
            }
        };

        fetchOwnerFiles();
    }, [selectedOldOwner]);

    const removeFileExtension = (fileName = "") => {
        if (!fileName) return "";
        return fileName.replace(/\.[^/.]+$/, "");
    };

    const handleOwnershipChange = (fileId, value) => {
        setOwnershipChanges(prev => ({
            ...prev,
            [fileId]: value || null
        }));
    };

    const handleClick = async () => {
        if (!selectedOldOwner) {
            toast.error("Please select the current owner.", {
                closeButton: false,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        const selectedFilesToChange = ownerFiles.reduce((acc, file) => {
            const newOwner = ownershipChanges[file._id];

            // Ignore rows with no selected value
            if (!newOwner || String(newOwner).trim() === "") {
                return acc;
            }

            const newOwnerObj = usersList.find(u => u.username === newOwner);

            // Ignore rows where the selected username cannot be matched
            if (!newOwnerObj?._id) {
                return acc;
            }

            acc.push({
                fileId: file._id,
                oldOwner: selectedOldOwner,
                newOwner,
                newOwnerId: newOwnerObj._id
            });

            return acc;
        }, []);

        if (selectedFilesToChange.length === 0) {
            toast.error("Please select a new owner for at least one file", {
                closeButton: false,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_URL}/api/file/owners/replace`,
                {
                    oldOwner: selectedOldOwner,
                    selectedFiles: selectedFilesToChange
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const { activeFilesModified, trashFilesModified } = response.data.stats || {};

            toast.success(
                `Migration Successful.`,
                {
                    closeButton: true,
                    autoClose: 2000,
                    style: { textAlign: 'center' }
                }
            );

            const refreshResponse = await axios.get(
                `${process.env.REACT_APP_URL}/api/file/owners/distinct`,
                {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }
            );

            setCurrentOwners(refreshResponse.data.owners || []);
            setSelectedOldOwner('');
            setOwnerFiles([]);
            setOwnershipChanges({});
            setLoading(false);

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            setLoading(false);
            console.error("Migration failed:", error);
            const errMsg = error.response?.data?.error || "Migration failed. Please try again.";
            toast.error(errMsg, {
                closeButton: true,
                autoClose: 2000,
                style: { textAlign: 'center' }
            });
        }
    };

    return (
        <div className="batch-popup-overlay">
            <div className="migrate-owner-content">
                <div className="batch-file-header">
                    <h2 className="batch-file-title">Migrate Documents</h2>
                    <button className="batch-file-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                {/* Dropdown 1: Select Current Owner */}
                <div className="migrate-owner-group">
                    <div className="batch-file-text">Current Document Owner</div>
                    <div className="migrate-owner-page-select-container">
                        <select
                            value={selectedOldOwner}
                            className="migrate-owner-page-select"
                            onChange={(e) => setSelectedOldOwner(e.target.value)}
                        >
                            <option value="">Select Owner</option>
                            {currentOwners.map((ownerName, index) => (
                                <option key={index} value={ownerName}>
                                    {ownerName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="migrate-owner-group" style={{ fontFamily: "Arial" }}>
                    <div className="batch-file-text">Available Documents</div>

                    <div className="migrate-owner-files-box">
                        {!selectedOldOwner ? (
                            <div className="migrate-owner-empty-state">
                                Select an existing owner to load their files.
                            </div>
                        ) : filesLoading ? (
                            <div className="migrate-owner-empty-state">
                                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "8px" }} />
                                Loading files...
                            </div>
                        ) : ownerFiles.length === 0 ? (
                            <div className="migrate-owner-empty-state">
                                No files found for this user.
                            </div>
                        ) : (
                            <table className="migrate-owner-files-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "75%", textAlign: "center", fontSize: "16px" }}>Document Title</th>
                                        <th style={{ width: "25%", textAlign: "center", fontSize: "16px" }}>New Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownerFiles.map((file, index) => (
                                        <tr key={file._id || index}>
                                            <td className="migrate-owner-file-name-cell">
                                                {removeFileExtension(file.fileName || file.fileNumber || "")}
                                            </td>
                                            <td>
                                                <select
                                                    className="migrate-owner-row-select"
                                                    value={ownershipChanges[file._id] || ""}
                                                    onChange={(e) => handleOwnershipChange(file._id, e.target.value)}
                                                >
                                                    <option value="" style={{ color: "ccc" }}>Choose New Owner</option>
                                                    {usersList
                                                        .filter(user => user.username !== selectedOldOwner)
                                                        .sort((a, b) => (a.username || "").localeCompare(b.username || ""))
                                                        .map((user, idx) => (
                                                            <option key={idx} value={user.username}>
                                                                {user.username}
                                                            </option>
                                                        ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="migrate-owner-buttons">
                    <button
                        className="migrate-owner-button-sub"
                        onClick={handleClick}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Submit'}
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default MigrateOwnership;