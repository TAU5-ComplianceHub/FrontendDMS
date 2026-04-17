import React, { useState, useEffect, useMemo } from "react";
import "./SharePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { faX, faSearch } from "@fortawesome/free-solid-svg-icons";
import RemoveShare from "./RemoveShare";

const SHARE_ROLES = ["collaborator", "viewer", "publisher"];
const ALL_ALLOWED_ROLES = ["owner", ...SHARE_ROLES];

const normalizeSharedUsers = (value, ownerId) => {
    const rawItems = Array.isArray(value)
        ? value
        : value == null
            ? []
            : [value];

    const mapped = rawItems
        .map((item) => {
            if (typeof item === "string") {
                return {
                    userId: item,
                    role: item === ownerId ? "owner" : "collaborator"
                };
            }

            if (item && typeof item === "object") {
                const userId =
                    item.userId ||
                    item.userID ||
                    item._id ||
                    item.id ||
                    "";

                if (!userId) return null;

                let role = String(item.role || "").toLowerCase().trim();

                if (!ALL_ALLOWED_ROLES.includes(role)) {
                    role = userId === ownerId ? "owner" : "collaborator";
                }

                if (userId === ownerId) role = "owner";

                return { userId, role };
            }

            return null;
        })
        .filter(Boolean);

    const deduped = [];
    const seen = new Set();

    mapped.forEach((entry) => {
        if (seen.has(entry.userId)) return;
        seen.add(entry.userId);
        deduped.push(entry);
    });

    if (ownerId && !deduped.some((entry) => entry.userId === ownerId)) {
        deduped.unshift({ userId: ownerId, role: "owner" });
    }

    return deduped.map((entry) => ({
        userId: entry.userId,
        role: entry.userId === ownerId ? "owner" : entry.role
    }));
};

const SharePage = ({ userIDs, closePopup, setUserIDs, saveData, userID }) => {
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(
        normalizeSharedUsers(userIDs, userID)
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [userToRemove, setUserToRemove] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        setSelectedUsers(normalizeSharedUsers(userIDs, userID));
    }, [userIDs, userID]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/user/`);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            const sortedUsers = (data.users || []).sort((a, b) =>
                a.username.localeCompare(b.username)
            );

            setUsers(sortedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const clearSearch = () => {
        setSearchTerm("");
    };

    const isSelected = (targetUserId) =>
        selectedUsers.some((entry) => entry.userId === targetUserId);

    const getRole = (targetUserId) =>
        selectedUsers.find((entry) => entry.userId === targetUserId)?.role || "";

    const handleCheckboxChange = (targetUserId, displayName) => {
        if (targetUserId === userID) return;

        if (isSelected(targetUserId)) {
            setUserToRemove(targetUserId);
            setUsername(displayName);
            setShowConfirmation(true);
            return;
        }

        setSelectedUsers((prev) => [
            ...prev,
            { userId: targetUserId, role: "collaborator" }
        ]);
    };

    const handleRoleChange = (targetUserId, role) => {
        setSelectedUsers((prev) =>
            prev.map((entry) =>
                entry.userId === targetUserId ? { ...entry, role } : entry
            )
        );
    };

    const handleConfirmRemoval = () => {
        if (!userToRemove) return;

        const updated = selectedUsers.filter(
            (entry) => entry.userId !== userToRemove
        );

        setSelectedUsers(updated);
        setUserIDs(normalizeSharedUsers(updated, userID));
        setShowConfirmation(false);
        setUserToRemove(null);
    };

    const handleCancelRemoval = () => {
        setShowConfirmation(false);
        setUserToRemove(null);
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter((user) => user._id !== userID)
            .filter((user) =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.username.localeCompare(b.username));
    }, [users, userID, searchTerm]);

    const handleSaveSelection = async () => {
        const normalized = normalizeSharedUsers(selectedUsers, userID);
        const missingRole = normalized.find(
            (entry) => entry.userId !== userID && !SHARE_ROLES.includes(entry.role)
        );

        if (missingRole) {
            toast.dismiss();
            toast.clearWaitingQueue();
            toast.error("Please select a role for every shared user.", {
                closeButton: true,
                autoClose: 1500,
                style: { textAlign: "center" }
            });
            return;
        }

        setUserIDs(normalized);
        await saveData(normalized);

        toast.dismiss();
        toast.clearWaitingQueue();
        toast.success("The draft has been shared successfully.", {
            closeButton: false,
            autoClose: 1500,
            style: { textAlign: "center" }
        });

        closePopup();
    };

    return (
        <div className="popup-overlay-share">
            <div className="popup-content-share">
                <div className="review-date-header">
                    <h2 className="review-date-title">Share Draft</h2>
                    <button className="review-date-close" onClick={closePopup} title="Close Popup">
                        ×
                    </button>
                </div>

                <div className="review-date-group">
                    <div className="share-input-container">
                        <input
                            className="search-input-share"
                            type="text"
                            placeholder="Search member"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm !== "" ? (
                            <i>
                                <FontAwesomeIcon
                                    icon={faX}
                                    onClick={clearSearch}
                                    className="icon-um-search"
                                    title="Clear Search"
                                />
                            </i>
                        ) : (
                            <i>
                                <FontAwesomeIcon icon={faSearch} className="icon-um-search" />
                            </i>
                        )}
                    </div>
                </div>

                <div className="share-table-group">
                    <div className="popup-table-wrapper-share">
                        <table className="popup-table font-fam">
                            <thead className="share-headers">
                                <tr>
                                    <th style={{ width: "10%" }} className="inp-size-share">Select</th>
                                    <th style={{ width: "60%", textAlign: "center" }} >User</th>
                                    <th style={{ width: "30%", textAlign: "center" }} >Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                        const checked = isSelected(user._id);
                                        const role = getRole(user._id);

                                        return (
                                            <tr
                                                key={user._id}
                                                onClick={() => handleCheckboxChange(user._id, user.username)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-inp-share"
                                                        checked={checked}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => handleCheckboxChange(user._id, user.username)}
                                                    />
                                                </td>
                                                <td>{user.username}</td>
                                                <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                                    {checked ? (
                                                        <select
                                                            value={role}
                                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                            className="table-control font-fam remove-default-styling"
                                                            style={{ fontSize: "14px", color: "black" }}
                                                        >
                                                            <option value="">Select role</option>
                                                            <option value="collaborator">Collaborator</option>
                                                            <option value="viewer">Viewer</option>
                                                            <option value="publisher">Publisher</option>
                                                        </select>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3">Loading users...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="share-buttons">
                    <button onClick={handleSaveSelection} className="share-button">
                        Save Selection
                    </button>
                </div>
            </div>

            {showConfirmation && (
                <RemoveShare
                    handleCancelRemoval={handleCancelRemoval}
                    handleConfirmRemoval={handleConfirmRemoval}
                    setRemove={setShowConfirmation}
                    user={username}
                />
            )}
        </div>
    );
};

export default SharePage;