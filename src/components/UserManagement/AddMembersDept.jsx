import React, { useState, useEffect, useMemo } from "react";
import "./AddMembersDept.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { faX, faSearch } from '@fortawesome/free-solid-svg-icons';
import MoveUserDepartment from "./MoveUserDepartment";

const getDepartmentLabel = (user) => {
    return String(user?.department || "").trim() || "-";
};

const AddMembersDept = ({ deptID, popupVisible, closePopup }) => {
    const [usersData, setUsersData] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [saving, setSaving] = useState(false);
    const [departmentName, setDepartmentName] = useState("");
    const [pendingMoveUser, setPendingMoveUser] = useState(null);

    const currentMemberIds = useMemo(
        () => new Set(usersData.map((user) => user._id)),
        [usersData]
    );

    const clearSearch = () => {
        setSearchTerm("");
    };

    useEffect(() => {
        if (!popupVisible) return;

        let isActive = true;

        const loadPopupData = async () => {
            setLoadingUsers(true);

            try {
                const [membersResponse, usersResponse, departmentResponse] = await Promise.all([
                    fetch(`${process.env.REACT_APP_URL}/api/department/members/${deptID}`),
                    fetch(`${process.env.REACT_APP_URL}/api/user/`),
                    fetch(`${process.env.REACT_APP_URL}/api/department/details/${deptID}`)
                ]);

                if (!membersResponse.ok || !usersResponse.ok || !departmentResponse.ok) {
                    throw new Error("Failed to load department members");
                }

                const [membersData, usersResponseData, departmentData] = await Promise.all([
                    membersResponse.json(),
                    usersResponse.json(),
                    departmentResponse.json()
                ]);

                if (!isActive) return;

                const allUsers = Array.isArray(usersResponseData.users)
                    ? usersResponseData.users
                    : [];

                const loadedDepartmentMembers = Array.isArray(membersData.members)
                    ? membersData.members
                    : [];

                const populatedDepartmentHead = loadedDepartmentMembers.find(
                    (user) => user?.isDepartmentHead
                );

                const departmentHeadValue = departmentData?.department?.departmentHead;
                const departmentHeadId = String(
                    populatedDepartmentHead?._id ||
                    departmentHeadValue?._id ||
                    departmentHeadValue ||
                    ""
                );

                const regularDepartmentMembers = loadedDepartmentMembers.filter(
                    (user) =>
                        !user?.isDepartmentHead &&
                        String(user?._id || "") !== departmentHeadId
                );

                setUsersData(regularDepartmentMembers);
                setUsers(
                    allUsers
                        .filter((user) => String(user?._id || "") !== departmentHeadId)
                        .sort((a, b) =>
                            String(a.username || "").localeCompare(String(b.username || ""))
                        )
                );
                setDepartmentName(
                    String(departmentData?.department?.department || "").trim()
                );
                setSelectedUsers([]);
                setPendingMoveUser(null);
            } catch (error) {
                console.error("Error loading department members:", error);
                toast.error("Users could not be loaded.", {
                    closeButton: false,
                    autoClose: 800,
                    style: { textAlign: "center" }
                });
            } finally {
                if (isActive) {
                    setLoadingUsers(false);
                }
            }
        };

        loadPopupData();

        return () => {
            isActive = false;
        };
    }, [popupVisible, deptID]);

    const handleCheckboxChange = (user) => {
        if (selectedUsers.includes(user._id)) {
            setSelectedUsers((previous) =>
                previous.filter((userId) => userId !== user._id)
            );
            return;
        }

        const currentDepartment = String(user.department || "").trim();

        if (
            currentDepartment &&
            departmentName &&
            currentDepartment !== departmentName
        ) {
            setPendingMoveUser(user);
            return;
        }

        setSelectedUsers((previous) => [...previous, user._id]);
    };

    const confirmMoveUser = () => {
        if (!pendingMoveUser) return;

        setSelectedUsers((previous) => (
            previous.includes(pendingMoveUser._id)
                ? previous
                : [...previous, pendingMoveUser._id]
        ));
        setPendingMoveUser(null);
    };

    const handleSaveSelection = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Select at least one user.", {
                closeButton: false,
                autoClose: 800,
                style: { textAlign: "center" }
            });
            return;
        }

        const dataToSend = {
            departmentId: deptID,
            users: selectedUsers
        };

        setSaving(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/department/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "Members could not be added");
            }

            toast.success("Members added or moved successfully.", {
                closeButton: false,
                autoClose: 800,
                style: {
                    textAlign: 'center'
                }
            })

            closePopup();
        } catch (error) {
            toast.error(error.message || "Members could not be added.", {
                closeButton: false,
                autoClose: 800,
                style: {
                    textAlign: 'center'
                }
            })
        } finally {
            setSaving(false);
        }
    };

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const getDisplayedDepartment = (user) => {
        const currentDepartment = getDepartmentLabel(user);

        if (
            currentMemberIds.has(user._id) &&
            currentDepartment === "-"
        ) {
            return departmentName || currentDepartment;
        }

        return currentDepartment;
    };

    const displayedUsers = users
        .filter((user) => {
            const username = String(user.username || "").toLowerCase();
            const currentDepartment = getDisplayedDepartment(user).toLowerCase();

            return (
                username.includes(normalizedSearchTerm) ||
                currentDepartment.includes(normalizedSearchTerm)
            );
        });

    return (
        <>
            <div className="popup-overlay-dept">
                <div className="popup-content-dept">
                    <div className="review-date-header">
                        <h2 className="review-date-title">Add Members</h2>
                        <button className="review-date-close" onClick={closePopup} title="Close Popup">×</button>
                    </div>

                    <div className="review-date-group">
                        <div className="dept-input-container">
                            <input
                                className="search-input-dept"
                                type="text"
                                placeholder="Search member or department"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm !== "" && (<i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i>)}
                            {searchTerm === "" && (<i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>)}
                        </div>
                    </div>

                    <div className="dept-table-group">
                        <div className="popup-table-wrapper-dept">
                            <table className="popup-table font-fam">
                                <thead className="dept-headers">
                                    <tr>
                                        <th className="inp-size-dept">Select</th>
                                        <th>User</th>
                                        <th style={{ textAlign: "center" }}>Current Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUsers ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: "center" }}>Loading users...</td>
                                        </tr>
                                    ) : displayedUsers.length > 0 ? (
                                        displayedUsers.map((user) => {
                                            const isCurrentMember = currentMemberIds.has(user._id);

                                            return (
                                                <tr
                                                    key={user._id}
                                                    onClick={() => {
                                                        if (!isCurrentMember) handleCheckboxChange(user);
                                                    }}
                                                    style={{ cursor: isCurrentMember ? "default" : "pointer" }}
                                                >
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox-inp-dept"
                                                            checked={isCurrentMember || selectedUsers.includes(user._id)}
                                                            disabled={isCurrentMember}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={() => handleCheckboxChange(user)}
                                                            title={isCurrentMember ? "Already in this department" : "Select user"}
                                                        />
                                                    </td>
                                                    <td>{user.username}</td>
                                                    <td style={{ textAlign: "center" }}>{getDisplayedDepartment(user)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: "center" }}>No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="dept-buttons">
                        <button
                            onClick={handleSaveSelection}
                            className="dept-button"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Selection"}
                        </button>
                    </div>
                </div>
            </div>

            {pendingMoveUser && (
                <MoveUserDepartment
                    setIsDeleteModalOpen={(isOpen) => {
                        if (!isOpen) setPendingMoveUser(null);
                    }}
                    departmentName={"Yes"}
                    handleDelete={confirmMoveUser}
                    title="Change User Department"
                    message={`Are you sure you want to move this user from ${getDepartmentLabel(pendingMoveUser)} to ${departmentName}?`}
                    confirmText="Change"
                    cancelText="Cancel"
                />
            )}
        </>
    );
};

export default AddMembersDept;