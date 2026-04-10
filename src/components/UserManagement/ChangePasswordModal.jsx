
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const ChangePasswordModal = ({
    isOpen,
    setIsOpen,
    changePassword,
    user
}) => {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const [confirmPasswordInvalid, setConfirmPasswordInvalid] = useState(false);

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

    if (!isOpen) return null;

    const submit = (e) => {
        e.preventDefault();

        setPasswordInvalid(false);
        setConfirmPasswordInvalid(false);
        setError("");

        if (!password || !confirmPassword) {
            setError("Both fields are required");
            return;
        }

        const passwordErrors = getPasswordErrors(password.trim());

        if (passwordErrors.length > 0) {
            setPasswordInvalid(true);
            setConfirmPasswordInvalid(true);
            showPasswordValidationToast(passwordErrors);
            return;
        }

        if (password !== confirmPassword) {
            setPasswordInvalid(true);
            setConfirmPasswordInvalid(true);
            setError("Passwords do not match");
            toast.dismiss();
            toast.clearWaitingQueue();
            toast.warn("Passwords do not match", {
                closeButton: false,
                autoClose: 1000,
                style: {
                    textAlign: "center"
                }
            });
            return;
        }

        changePassword(password);
    };

    return (
        <div className="create-user-overlay">
            <div className="create-user-modal" style={{ height: "fit-content", minHeight: 0 }}>

                <div className="create-user-header">
                    <h2 className="create-user-title">
                        Change User Password
                    </h2>

                    <button
                        className="create-user-close"
                        onClick={() => setIsOpen(false)}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                <form onSubmit={submit}>

                    <div className="create-user-content">

                        <div className="create-user-group">
                            <label className="create-user-label">
                                New Password
                            </label>

                            <input
                                type="text"
                                className={`create-user-input ${passwordInvalid ? "password-invalid" : ""}`}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordInvalid(false);
                                }}
                            />
                        </div>


                        <div className="create-user-group">
                            <label className="create-user-label">
                                Retype Password
                            </label>

                            <input
                                type="text"
                                className={`create-user-input ${confirmPasswordInvalid ? "password-invalid" : ""}`}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setConfirmPasswordInvalid(false);
                                }}
                            />
                        </div>

                    </div>

                    <div className="create-user-buttons">
                        <button
                            type="submit"
                            className="create-user-button"
                            style={{ width: "50%" }}
                        >
                            Update Password
                        </button>
                    </div>

                </form>

            </div>
            <ToastContainer />
        </div>
    );
};

export default ChangePasswordModal;