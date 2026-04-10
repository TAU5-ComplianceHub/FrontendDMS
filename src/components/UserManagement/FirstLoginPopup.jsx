import React, { useState } from "react";
import "./FirstLoginPopup.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';

const FirstLoginPopup = ({ onClose }) => {
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [newPass2, setNewPass2] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [showPasswordCurr, setShowPasswordCurr] = useState(false);
    const [showPasswordNew, setShowPasswordNew] = useState(false);
    const [showPasswordNew2, setShowPasswordNew2] = useState(false);
    const [newPassInvalid, setNewPassInvalid] = useState(false);
    const [newPass2Invalid, setNewPass2Invalid] = useState(false);

    const getPasswordErrors = (password) => {
        const errors = [];

        if (password.length < 8) {
            errors.push("Less than 8 characters");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("No capital letters");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("No number");
        }

        if (!/[!?@]/.test(password)) {
            errors.push("No special characters (! ? @)");
        }

        return errors;
    };

    const showPasswordValidationToast = (errors) => {
        toast.dismiss();
        toast.clearWaitingQueue();
        toast.error(
            `Password is invalid:\n${errors.join("\n")}`,
            {
                closeButton: false,
                autoClose: 2500,
                style: { textAlign: "left", whiteSpace: "pre-line" }
            }
        );
    };

    const togglePasswordVisibilityNew = () => {
        setShowPasswordNew((prev) => !prev);
    };

    const togglePasswordVisibilityCurr = () => {
        setShowPasswordCurr((prev) => !prev);
    };

    const togglePasswordVisibilityNew2 = () => {
        setShowPasswordNew2((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        localStorage.setItem('firstLogin', 'false');
        setLoading(true);
        e.preventDefault();

        if (!currentPass.trim() || !newPass.trim() || !newPass2.trim()) {
            setLoading(false);
            toast.dismiss();
            toast.clearWaitingQueue();
            toast.warn("Please enter all values.", {
                closeButton: false,
                autoClose: 1000, // 1.5 seconds
                style: {
                    textAlign: 'center'
                }
            });
            return;
        }

        setNewPassInvalid(false);
        setNewPass2Invalid(false);

        const passwordErrors = getPasswordErrors(newPass.trim());

        if (passwordErrors.length > 0) {
            setLoading(false);
            setNewPassInvalid(true);
            setNewPass2Invalid(true);
            showPasswordValidationToast(passwordErrors);
            return;
        }

        if (newPass.trim() != newPass2.trim()) {
            setLoading(false);
            setNewPassInvalid(true);
            setNewPass2Invalid(true);
            toast.dismiss();
            toast.clearWaitingQueue();
            toast.warn("Ensure that the new passwords match.", {
                closeButton: false,
                autoClose: 1000, // 1.5 seconds
                style: {
                    textAlign: 'center'
                }
            });
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/user/firstLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    currentPass: currentPass.trim(),
                    newPass: newPass.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false);
                setMessage({ text: data.message, type: "error" });
                return;
            }

            setLoading(false);
            setMessage({ text: "Password changed successfully!", type: "success" });

            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (error) {
            setLoading(false);
            setMessage({ text: "Failed to change password.", type: "error" });
        }
    };

    const handleClose = () => {
        setCurrentPass("");
        setNewPass("");
        setNewPass2("");
        setLoading(false);
        setMessage({ text: "", type: "" });
        localStorage.setItem('firstLogin', 'false');
        onClose();
    };

    return (
        <div className="first-login-popup-overlay">
            <div className="first-login-popup-content">
                <div className="first-login-popup-header">
                    <h2 className="first-login-popup-title">Change Password</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="first-login-popup-group">
                        <label className="first-login-popup-label">Insert Current Password:</label>
                        <div className="first-login-input-container">
                            <input
                                spellcheck="true"
                                type={showPasswordCurr ? 'text' : 'password'}
                                value={currentPass}
                                onChange={(e) => setCurrentPass(e.target.value)}
                                className="first-login-popup-input"
                                required
                                placeholder="Current Password"
                            />
                            <button
                                type="button"
                                className="first-login-password-toggle"
                                onClick={togglePasswordVisibilityCurr}
                            >
                                <FontAwesomeIcon icon={showPasswordCurr ? faEyeSlash : faEye} title="Show/Hide Password" />
                            </button>
                        </div>
                    </div>

                    <div className="first-login-popup-group">
                        <label className="first-login-popup-label">Insert New Password:</label>
                        <div className="first-login-input-container">
                            <input
                                spellcheck="true"
                                type={showPasswordNew ? 'text' : 'password'}
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                className={`first-login-popup-input ${newPassInvalid ? "password-invalid" : ""}`}
                                required
                                placeholder="New Password"
                            />
                            <button
                                type="button"
                                className="first-login-password-toggle"
                                onClick={togglePasswordVisibilityNew}
                            >
                                <FontAwesomeIcon icon={showPasswordNew ? faEyeSlash : faEye} title="Show/Hide Password" />
                            </button>
                        </div>
                    </div>

                    <div className="first-login-popup-group">
                        <label className="first-login-popup-label">Retype New Password:</label>
                        <div className="first-login-input-container">
                            <input
                                spellcheck="true"
                                type={showPasswordNew2 ? 'text' : 'password'}
                                value={newPass2}
                                onChange={(e) => setNewPass2(e.target.value)}
                                className={`first-login-popup-input ${newPass2Invalid ? "password-invalid" : ""}`}
                                required
                                placeholder="Retype New Password"
                            />
                            <button
                                type="button"
                                className="first-login-password-toggle"
                                onClick={togglePasswordVisibilityNew2}
                            >
                                <FontAwesomeIcon icon={showPasswordNew2 ? faEyeSlash : faEye} title="Show/Hide Password" />
                            </button>
                        </div>
                    </div>

                    {/* Success/Error Message Box */}
                    {message.text && (
                        <div className={`first-login-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="first-login-popup-buttons">
                        <button type="submit" className="first-login-popup-button">
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Change'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FirstLoginPopup;