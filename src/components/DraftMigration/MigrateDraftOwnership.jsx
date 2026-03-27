import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";

const MigrateDraftOwnership = ({ onClose, draftType = "TMS" }) => {
    const [currentOwners, setCurrentOwners] = useState([]);
    const [usersList, setUsersList] = useState([]);

    const [selectedOldOwner, setSelectedOldOwner] = useState('');
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

    const routes = useMemo(() => {
        switch (draftType) {
            case "TMS":
                return {
                    owners: "onlineTrainingCourses/draft-owners",
                    ownerItems: "onlineTrainingCourses/owners/drafts",
                    replaceOwners: "onlineTrainingCourses/owners/replace",
                    refreshOwners: "onlineTrainingCourses/draft-owners"
                };
            case "RMS":
                return {
                    owners: "riskDraft/draft-owners",
                    ownerItems: "riskDraft/owners/drafts",
                    replaceOwners: "riskDraft/owners/replace",
                    refreshOwners: "riskDraft/draft-owners"
                };
            case "DDS":
                return {
                    owners: "draft/draft-owners",
                    ownerItems: "draft/owners/drafts",
                    replaceOwners: "draft/owners/replace",
                    refreshOwners: "draft/draft-owners"
                };
            default:
                return {
                    owners: "",
                    ownerItems: "",
                    replaceOwners: "",
                    refreshOwners: ""
                };
        }
    }, [draftType]);

    const normalizeOwners = (owners) => {
        if (!Array.isArray(owners)) return [];

        return owners
            .map((owner) => {
                if (typeof owner === "string") {
                    return {
                        _id: owner,
                        username: owner,
                        email: ""
                    };
                }

                return {
                    _id: owner?._id || owner?.userID || owner?.id || owner?.username || "",
                    username: owner?.username || owner?.name || owner?.email || "",
                    email: owner?.email || ""
                };
            })
            .filter((owner) => owner._id && owner.username)
            .sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    };

    useEffect(() => {
        const fetchCurrentOwners = async () => {
            if (!routes.owners) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_URL}/api/${routes.owners}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const normalizedOwners = normalizeOwners(response.data.owners || []);
                setCurrentOwners(normalizedOwners);
            } catch (error) {
                console.error("Failed to fetch distinct owners:", error);
                toast.error("Failed to load current file owners");
            }
        };

        fetchCurrentOwners();
    }, [routes]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_URL}/api/user/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsersList(data.users || []);
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

            if (!routes.ownerItems) return;

            setFilesLoading(true);

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_URL}/api/${routes.ownerItems}`,
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
                (response.data.files || []).forEach((file) => {
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
    }, [selectedOldOwner, routes]);

    const removeFileExtension = (fileName = "") => {
        if (!fileName) return "";
        return fileName.replace(/\.[^/.]+$/, "");
    };

    const handleOwnershipChange = (fileId, value) => {
        setOwnershipChanges((prev) => ({
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

            if (!newOwner || String(newOwner).trim() === "") {
                return acc;
            }

            const newOwnerObj = usersList.find((u) => u.username === newOwner);

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

        if (!routes.replaceOwners) return;

        setLoading(true);

        try {
            await axios.post(
                `${process.env.REACT_APP_URL}/api/${routes.replaceOwners}`,
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

            toast.success("Migration Successful.", {
                closeButton: true,
                autoClose: 2000,
                style: { textAlign: 'center' }
            });

            const refreshResponse = await axios.get(
                `${process.env.REACT_APP_URL}/api/${routes.refreshOwners}`,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const normalizedOwners = normalizeOwners(refreshResponse.data.owners || []);
            setCurrentOwners(normalizedOwners);
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
                    <h2 className="batch-file-title">Migrate Drafts</h2>
                    <button className="batch-file-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <div className="migrate-owner-group">
                    <div className="batch-file-text">Current Draft Owner</div>
                    <div className="migrate-owner-page-select-container">
                        <select
                            value={selectedOldOwner}
                            className="migrate-owner-page-select"
                            onChange={(e) => setSelectedOldOwner(e.target.value)}
                        >
                            <option value="">Select Owner</option>
                            {currentOwners.map((owner) => (
                                <option key={owner._id} value={owner.username}>
                                    {owner.username}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="migrate-owner-group" style={{ fontFamily: "Arial" }}>
                    <div className="batch-file-text">Available Drafts</div>

                    <div className="migrate-owner-files-box">
                        {!selectedOldOwner ? (
                            <div className="migrate-owner-empty-state">
                                Select an existing owner to load their drafts.
                            </div>
                        ) : filesLoading ? (
                            <div className="migrate-owner-empty-state">
                                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "8px" }} />
                                Loading drafts...
                            </div>
                        ) : ownerFiles.length === 0 ? (
                            <div className="migrate-owner-empty-state">
                                No drafts found for this user.
                            </div>
                        ) : (
                            <table className="migrate-owner-files-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60%", textAlign: "center", fontSize: "16px" }}>Draft Title</th>
                                        <th style={{ width: "20%", textAlign: "center", fontSize: "16px" }}>Draft Type</th>
                                        <th style={{ width: "20%", textAlign: "center", fontSize: "16px" }}>New Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownerFiles.map((file, index) => (
                                        <tr key={file._id || index}>
                                            <td className="migrate-owner-file-name-cell">
                                                {(file.fileName || file.fileNumber || file.title || "")}
                                            </td>
                                            <td className="migrate-owner-file-name-cell" style={{ textAlign: "center" }}>
                                                {(file.documentType || "")}
                                            </td>
                                            <td>
                                                <select
                                                    className="migrate-owner-row-select"
                                                    value={ownershipChanges[file._id] || ""}
                                                    onChange={(e) => handleOwnershipChange(file._id, e.target.value)}
                                                >
                                                    <option value="">Choose New Owner</option>
                                                    {usersList
                                                        .filter((user) => user.username !== selectedOldOwner)
                                                        .sort((a, b) => (a.username || "").localeCompare(b.username || ""))
                                                        .map((user) => (
                                                            <option key={user._id} value={user.username}>
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

export default MigrateDraftOwnership;