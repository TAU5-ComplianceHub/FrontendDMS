import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";

const ControlSuggestionPopup = ({ isOpen, onClose, controlData, onSuccess }) => {
    const [approver, setApprover] = useState("");
    const [loading, setLoading] = useState(false);
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetching system admins/DDS as potential approvers
                const response = await fetch(
                    `${process.env.REACT_APP_URL}/api/user/getSystemAdmins/DDS`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsersList(data.users);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load approvers list.");
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!approver) {
            toast.warn("Please select an approver.");
            return;
        }

        setLoading(true);

        try {
            // Combine selected approver with the control data passed from parent
            const payload = {
                ...controlData,
                approver: approver
            };

            const response = await fetch(`${process.env.REACT_APP_URL}/api/riskInfo/suggest-control`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit suggestion");
            }

            toast.success("Control suggestion submitted successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error submitting control suggestion:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="abbr-popup-overlay">
            <div className="abbr-popup-content">
                <div className="abbr-popup-header">
                    <h2 className="abbr-popup-title">Suggest New Control</h2>
                    <button className="abbr-popup-close" onClick={onClose} title="Close Popup">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="abbr-popup-group">
                        <label className="abbr-popup-label">Select Approver:</label>
                        <div className="abbr-popup-page-select-container">
                            <select
                                value={approver}
                                onChange={(e) => setApprover(e.target.value)}
                                className="abbr-popup-select"
                                required
                            >
                                <option value="">Select Approver</option>
                                {usersList.map((user, index) => (
                                    <option key={index} value={user.id || user._id}>
                                        {user.username || user.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="abbr-popup-buttons">
                        <button type="submit" className="abbr-popup-button" disabled={loading} style={{ width: "40%" }}>
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Submit Suggestion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ControlSuggestionPopup;