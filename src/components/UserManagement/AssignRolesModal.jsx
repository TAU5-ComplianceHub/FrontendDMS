import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import "./CreateUserModal.css";

// ---------------------------------------------------------------------------
// Config: everything about the popup's groups lives here. To add, remove, or
// reorder a system, edit ROLE_GROUPS_CONFIG below — nothing else needs to change.
// ---------------------------------------------------------------------------

// Every role level that exists in the system, in order.
const ROLE_LEVELS = ["none", "viewer", "systemAdmin", "contributor", "visitor", "guest", "profileManager"];

// Human-readable labels for each role value.
const ROLE_LABELS = {
    none: "None",
    viewer: "Viewer",
    systemAdmin: "System Admin",
    contributor: "Contributor",
    visitor: "Visitor",
    guest: "Guest",
    profileManager: "Profile Manager",
};

// Most systems only offer roles up to "contributor".
const STANDARD_ROLES = ROLE_LEVELS.slice(0, ROLE_LEVELS.indexOf("contributor") + 1);

// TMS additionally offers "visitor" and "profileManager" (but not "guest").
const TMS_ROLES = [...STANDARD_ROLES, "visitor", "profileManager"];

const toOptions = (values) => values.map((value) => ({ value, label: ROLE_LABELS[value] }));

// key         -> the permission category / field name saved on the user
// title       -> label shown above the select
// defaultValue-> value the select falls back to when nothing is loaded yet
// options     -> [{ value, label }] available in the select
const ROLE_GROUPS_CONFIG = [
    { key: "DMS", title: "DMS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
    { key: "DDS", title: "DDS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
    { key: "RMS", title: "RMS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
    { key: "TMS", title: "TMS Role", defaultValue: "none", options: toOptions(TMS_ROLES) },
    { key: "EPACS", title: "EPAMS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
    { key: "CTS", title: "CTS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
    { key: "FTS", title: "FTS Role", defaultValue: "none", options: toOptions(STANDARD_ROLES) },
];

const buildDefaultRoles = () =>
    Object.fromEntries(ROLE_GROUPS_CONFIG.map((group) => [group.key, group.defaultValue]));

// ---------------------------------------------------------------------------

const AssignRolesModal = ({ isModalOpen, closeModal, userId, username }) => {
    const [roles, setRoles] = useState(buildDefaultRoles);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const closeModalAssign = () => {
        setFormError("");
        closeModal();
    };

    // Load the user's current roles whenever the popup is opened for a user
    useEffect(() => {
        if (!isModalOpen || !userId) return;

        let cancelled = false;

        const loadRoles = async () => {
            setIsLoading(true);
            setFormError("");
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_URL}/api/user/${userId}/roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch roles");
                }

                const data = await response.json();

                if (!cancelled) {
                    setRoles({
                        ...buildDefaultRoles(),
                        ...(data.permissions || {}),
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setFormError("Unable to load current roles. Please try again.");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadRoles();

        return () => {
            cancelled = true;
        };
    }, [isModalOpen, userId]);

    const handleRoleChange = (key, value) => {
        setRoles((prev) => ({ ...prev, [key]: value }));
    };

    const assignRoles = async () => {
        setFormError("");
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_URL}/api/user/${userId}/assign-roles`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ permissions: roles }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || "Failed to assign roles");
            }

            closeModalAssign();
        } catch (error) {
            setFormError(error.message || "Error assigning roles");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="create-user-overlay">
            <div className="create-user-modal">
                <div className="create-user-header">
                    <h2 className="create-user-title">Assign Roles</h2>
                    <button className="create-user-close" onClick={closeModalAssign} title="Close Popup">×</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); assignRoles(); }}>
                    <div className="create-user-content">
                        {formError && <p className="required-field">{formError}</p>}

                        {ROLE_GROUPS_CONFIG.map((group) => (
                            <div className="create-user-group" key={group.key}>
                                <label className="create-user-label" htmlFor={`role-${group.key}`}>
                                    {group.title}
                                </label>

                                <div className="uc-info-popup-page-select-container">
                                    <select
                                        id={`role-${group.key}`}
                                        className={
                                            roles[group.key] === group.defaultValue
                                                ? "create-user-select def-colour"
                                                : "create-user-select"
                                        }
                                        value={roles[group.key] ?? group.defaultValue}
                                        onChange={(e) => handleRoleChange(group.key, e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {group.options.map((option) => (
                                            <option key={option.value} value={option.value} className="norm-colour">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="create-user-buttons">
                        <button type="submit" className="create-user-button" disabled={isSaving || isLoading}>
                            {isSaving ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="um-spinner-icon" />
                                    <span style={{ marginLeft: 8 }}></span>
                                </>
                            ) : (
                                "Save Roles"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignRolesModal;
