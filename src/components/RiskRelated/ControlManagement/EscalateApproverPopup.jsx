import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";

const EscalateApproverPopup = ({ isOpen, onClose, controlId, onSuccess }) => {
    const [approver, setApprover] = useState("");
    const [loading, setLoading] = useState(false);
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetching system admins/DDS as potential approvers
                const response = await fetch(
                    `${process.env.REACT_APP_URL}/api/user/getSystemAdmins/RMS`,
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
            const response = await fetch(`${process.env.REACT_APP_URL}/api/riskInfo/escalate-control/${controlId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ newApprover: approver })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to escalate control");
            }

            toast.success("Control approval escalated successfully.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error escalating control:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="abbr-popup-overlay">
            <div className="abbr-popup-content" style={{ width: "600px", maxWidth: "600px" }}>
                <div className="abbr-popup-header">
                    <h2 className="abbr-popup-title">Escalate to Another Approver</h2>
                    <button className="abbr-popup-close" onClick={onClose} title="Close Popup">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="term-popup-scrollable" style={{ marginBottom: "5px" }}>
                        <div className="abbr-popup-group">
                            <label className="abbr-popup-label">Select New Approver:</label>
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
                    </div>
                    <div className="abbr-popup-buttons">
                        <button type="submit" className="abbr-popup-button" disabled={loading} style={{ width: "40%" }}>
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Escalate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EscalateApproverPopup;
