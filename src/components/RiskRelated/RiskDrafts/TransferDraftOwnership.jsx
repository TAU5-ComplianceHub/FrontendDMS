import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";

const TransferDraftOwnership = ({ onClose, creatorName, creatorID, draftType, draftTitle, draftID, refresh }) => {
    const [usersList, setUsersList] = useState([]);

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
        if (!selectedNewOwner) {
            toast.error("Please select a New Owner", {
                closeButton: false,
                autoClose: 1500,
                style: { textAlign: 'center' }
            });
            return;
        }

        setLoading(true);

        const selectedUserObj = usersList.find(user => user._id === selectedNewOwner);
        const newOwnerName = selectedUserObj ? selectedUserObj.username : selectedNewOwner;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_URL}/api/riskDraft/transferDraft`,
                {
                    newOwnerId: selectedNewOwner,
                    draftId: draftID,
                    draftType: draftType
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            toast.success(`Migration Successful! Draft moved to new owner: ${newOwnerName}`, {
                closeButton: true,
                autoClose: 2000,
                style: { textAlign: 'center' }
            });

            setSelectedNewOwner('');
            setLoading(false);

            // Close after 1.5 seconds
            setTimeout(() => {
                onClose();
                refresh(); // Refresh the drafts list after transfer
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
                    <h2 className="batch-file-title">Transfer Draft Ownership</h2>
                    <button className="batch-file-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                {/* Dropdown 1: Select Current Owner */}
                <div className="migrate-owner-group">
                    <div className="batch-file-text">Draft Information</div>
                    <div className="batch-file-text-xlsx">Creator: {creatorName || "N/A"}</div>
                    <div className="batch-file-text-xlsx">Draft Title: {draftTitle || "N/A"}</div>
                </div>

                {/* Dropdown 2: Select New Owner */}
                <div className="migrate-owner-group">
                    <div className="batch-file-text">Choose New Owner</div>
                    <div className="migrate-owner-page-select-container">
                        <select
                            value={selectedNewOwner}
                            className="migrate-owner-page-select"
                            onChange={(e) => setSelectedNewOwner(e.target.value)}
                        >
                            <option value="">Select New Owner</option>
                            {usersList
                                .filter(user => user._id !== creatorID) // Filter out the selected old owner
                                .sort((a, b) => (a.username || "").localeCompare(b.username || ""))
                                .map((user, index) => (
                                    <option key={index} value={user._id}>
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

export default TransferDraftOwnership;