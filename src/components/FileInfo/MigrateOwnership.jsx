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

    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState('');

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

    const handleClick = async () => {
        if (!selectedOldOwner || !selectedNewOwner) {
            toast.error("Please select both a Current Owner and a New Owner", {
                closeButton: false,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        if (selectedOldOwner === selectedNewOwner) {
            toast.warn("Current Owner and New Owner cannot be the same.", {
                closeButton: false,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        // Find the ID of the new owner based on the selected username
        const newOwnerObj = usersList.find(u => u.username === selectedNewOwner);
        const newOwnerId = newOwnerObj ? newOwnerObj._id : null;

        if (!newOwnerId) {
            toast.error("Could not find ID for the selected new owner.", {
                closeButton: false,
                autoClose: 2000,
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
                    newOwner: selectedNewOwner,
                    newOwnerId: newOwnerId
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const { activeFilesModified, trashFilesModified } = response.data.stats || {};

            toast.success(`Migration Successful! (Active: ${activeFilesModified}, Trash: ${trashFilesModified})`, {
                closeButton: true,
                autoClose: 2000,
                style: { textAlign: 'center' }
            });

            // Refresh the owners list
            const refreshResponse = await axios.get(`${process.env.REACT_APP_URL}/api/file/owners/distinct`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setCurrentOwners(refreshResponse.data.owners || []);

            // Clear values
            setSelectedOldOwner('');
            setSelectedNewOwner('');
            setLoading(false);

            // Close after 1.5 seconds
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
                    <div className="batch-file-text">Existing Document Owner</div>
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

                {/* Dropdown 2: Select New Owner */}
                <div className="migrate-owner-group">
                    <div className="batch-file-text">New Document Owner</div>
                    <div className="migrate-owner-page-select-container">
                        <select
                            value={selectedNewOwner}
                            className="migrate-owner-page-select"
                            onChange={(e) => setSelectedNewOwner(e.target.value)}
                        >
                            <option value="">Select Owner</option>
                            {usersList
                                .filter(user => user.username !== selectedOldOwner) // Filter out the selected old owner
                                .sort((a, b) => (a.username || "").localeCompare(b.username || ""))
                                .map((user, index) => (
                                    <option key={index} value={user.username}>
                                        {user.username}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="migrate-owner-buttons">
                    <button
                        className="migrate-owner-button-sub"
                        onClick={handleClick}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {loading && <FontAwesomeIcon icon={faSpinner} spin />}
                        {loading ? 'Migrating...' : 'Submit'}
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default MigrateOwnership;