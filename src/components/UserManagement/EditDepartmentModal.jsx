import React, { useEffect, useMemo, useState } from "react";
import "./AddDepartmentModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
    faSearch,
    faBuilding,
    faBriefcase,
    faUserMd,
    faGraduationCap,
    faGavel,
    faMicrochip,
    faChartLine,
    faFlask,
    faCog,
    faPencilRuler,
    faUsers,
    faBalanceScale,
    faPalette,
    faGlobe,
    faBook,
    faHeadset,
    faHandsHelping,
    faDollarSign,
    faServer,
    faUniversity
} from "@fortawesome/free-solid-svg-icons";

const UpdateDepartmentModal = ({
    show,
    onClose,
    departmentData,
    onSubmit
}) => {
    const [departmentName, setDepartmentName] = useState("");
    const [icon, setIcon] = useState("");

    const iconMap = useMemo(
        () => ({
            faSearch: faSearch,
            faBriefcase: faBriefcase,
            faUserMd: faUserMd,
            faGraduationCap: faGraduationCap,
            faGavel: faGavel,
            faMicrochip: faMicrochip,
            faChartLine: faChartLine,
            faFlask: faFlask,
            faCog: faCog,
            faPencilRuler: faPencilRuler,
            faUsers: faUsers,
            faBalanceScale: faBalanceScale,
            faPalette: faPalette,
            faGlobe: faGlobe,
            faBook: faBook,
            faHeadset: faHeadset,
            faHandsHelping: faHandsHelping,
            faDollarSign: faDollarSign,
            faServer: faServer,
            faUniversity: faUniversity
        }),
        []
    );

    useEffect(() => {
        if (show && departmentData) {
            setDepartmentName(departmentData.department || "");
            setIcon(departmentData.icon || "");
        }
    }, [show, departmentData]);

    if (!show) return null;

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();

        if (!departmentName.trim() || !icon) {
            toast.error("Ensure all fields are entered.", {
                closeButton: false,
                autoClose: 800,
                style: {
                    textAlign: "center"
                }
            });
            return;
        }

        const payload = {
            department: departmentName.trim(),
            icon: icon
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="create-dept-overlay">
            <div className="create-dept-modal">
                <div className="create-dept-header">
                    <h2 className="create-dept-title">Update Department</h2>
                    <button
                        className="create-dept-close"
                        onClick={onClose}
                        title="Close Popup"
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleUpdateDepartment}>
                    <div className="create-dept-group">
                        <label className="create-dept-label" htmlFor="department-name">
                            Department Name
                        </label>
                        <input
                            type="text"
                            id="department-name"
                            className="create-dept-input"
                            placeholder="Insert Department Name (e.g., Marketing)"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                        />
                    </div>

                    <div className="create-dept-group">
                        <label className="create-dept-label" htmlFor="department-icon">
                            Department Icon
                        </label>

                        <div className="uc-info-popup-page-select-container">
                            <select
                                className={icon === "" ? "create-dept-select def-colour" : "create-dept-select"}
                                id="department-icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                            >
                                <option value="" className="def-colour">Select Icon</option>
                                {Object.keys(iconMap).map((key) => (
                                    <option key={key} value={key}>
                                        {key.replace("fa", "").replace(/([A-Z])/g, " $1").trim()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="dept-icon">
                            <div className="dept-icon-style">
                                <FontAwesomeIcon
                                    icon={iconMap[icon] || faBuilding}
                                    className="fa-icon"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="create-dept-buttons">
                        <button type="submit" className="create-dept-button">
                            Update Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateDepartmentModal;