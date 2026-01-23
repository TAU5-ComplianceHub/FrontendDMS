import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, ToastContainer } from 'react-toastify';
import { faSpinner, faTrash, faTrashCan, faX, faSearch } from '@fortawesome/free-solid-svg-icons';

const AddStudentPopupOT = ({ userIDs = [], popupVisible, closePopup, setUserIDs, saveData, userID }) => {
    const [usersData, setUsersData] = useState([]);
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(userIDs);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToRemove, setUserToRemove] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/onlineTrainingStudentManagement/getStudents`, {
                headers: {
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();

            const sortedUsers = data.students.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            setUsers(sortedUsers);
        } catch (error) {
            console.error("Error fetching depteviations:", error)
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    useEffect(() => {
        fetchUsers();
        console.log("Users:", userIDs);
        console.log("Users:", selectedUsers);
    }, []);

    const handleCheckboxChange = (userId, username) => {
        if (selectedUsers.includes(userId)) {
            if (userIDs.includes(userId)) {
                setUserToRemove(userId);
                setUsername(username);
            } else {
                setSelectedUsers(prev => prev.filter(id => id !== userId));
            }
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleSaveSelection = async () => {
        setUserIDs(selectedUsers);
        saveData(selectedUsers);

        closePopup();
    };

    return (
        <div className="popup-overlay-share">
            <div className="popup-content-share">
                <div className="review-date-header">
                    <h2 className="review-date-title">Add Students</h2>
                    <button className="review-date-close" onClick={closePopup} title="Close Popup">×</button>
                </div>

                <div className="review-date-group">
                    <div className="share-input-container">
                        <input
                            className="search-input-share"
                            type="text"
                            placeholder="Search student"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm !== "" && (<i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i>)}
                        {searchTerm === "" && (<i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>)}
                    </div>
                </div>

                <div className="share-table-group">
                    <div className="popup-table-wrapper-share">
                        <table className="popup-table font-fam">
                            <thead className="share-headers">
                                <tr>
                                    <th className="inp-size-share">Select</th>
                                    <th>Student</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users
                                        // ❌ hide already-enrolled students
                                        .filter(user => !userIDs.includes(user._id))

                                        // ❌ hide logged-in user
                                        .filter(user => user._id !== userID)

                                        // 🔍 search
                                        .filter(user =>
                                            `${user.name} ${user.surname}`
                                                .toLowerCase()
                                                .includes(searchTerm.toLowerCase())
                                        )

                                        // 🔠 alphabetical order
                                        .sort((a, b) => a.name.localeCompare(b.name))

                                        .map(user => (
                                            <tr
                                                key={user._id}
                                                onClick={() => handleCheckboxChange(user._id, user.name)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-inp-share"
                                                        checked={selectedUsers.includes(user._id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => handleCheckboxChange(user._id)}
                                                    />
                                                </td>
                                                <td>{user.name} {user.surname}</td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Loading students...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="share-buttons">
                    <button onClick={handleSaveSelection} className="share-button">Add Students</button>
                </div>
            </div>
        </div>
    );
};

export default AddStudentPopupOT;
