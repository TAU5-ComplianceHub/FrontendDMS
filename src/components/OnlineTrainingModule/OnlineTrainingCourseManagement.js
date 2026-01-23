import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faCircleUser, faDownload, faChevronLeft, faChevronRight, faCaretLeft, faCaretRight, faCirclePlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from 'jwt-decode';
import TopBarDD from "../Notifications/TopBarDD";
import "./OnlineTrainingCourseManagement.css";
import AddStudentPopupOT from "./AddStudentPopupOT";
import { toast, ToastContainer } from "react-toastify";
import RemoveStudentEnrollment from "./RemoveStudentEnrollment";

const OnlineTrainingCourseManagement = () => {
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [token, setToken] = useState('');
    const { id } = useParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [versions, setVersions] = useState([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [removePopupVisible, setRemovePopupVisible] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            const decodedToken = jwtDecode(storedToken);
        }
    }, [navigate]);

    const loadEnrolledStudents = async () => {
        try {
            setLoading(true);
            setError("");

            // Use whichever token your admin/manager side stores
            const token =
                localStorage.getItem("token");

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingCourses/published/enrollments/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // safer parsing (avoids the "<!DOCTYPE" JSON error)
            const contentType = res.headers.get("content-type") || "";
            const raw = await res.text();
            const data = contentType.includes("application/json") ? JSON.parse(raw) : null;

            if (!res.ok) {
                throw new Error(data?.error || `Failed to load enrollments (HTTP ${res.status})`);
            }
            if (!data) throw new Error("Server did not return JSON");

            console.log("Enrolled students data:", data);

            setCourseTitle(data.course?.courseTitle || "");
            setStudents(Array.isArray(data.students) ? data.students : []);
        } catch (e) {
            console.error("Error loading enrollments:", e);
            setError(e.message || "Failed to load enrollments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadEnrolledStudents();
    }, [id]);

    const rows = students.length
        ? students.map((s) => ({ ...s, isPlaceholder: false }))
        : [{ isPlaceholder: true }];

    const [popupVisible, setPopupVisible] = useState(false);
    const [userIDs, setUserIDs] = useState([]); // this is what popup expects

    // IDs of students already enrolled (from the route)
    const existingUserIDs = (students || [])
        .map((s) => s?._id)
        .filter(Boolean);

    useEffect(() => {
        setUserIDs(existingUserIDs);
    }, [students]);

    const saveData = async (selectedIds) => {
        if (!Array.isArray(selectedIds)) {
            setError("Invalid selection received (expected an array of ids).");
            return;
        }

        const token = localStorage.getItem("token");

        await fetch(
            `${process.env.REACT_APP_URL}/api/onlineTrainingCourses/published/enrollments/${id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIDs: selectedIds }),
            }
        );

        toast.success("Students enrolled successfully.", {
            closeButton: false,
            autoClose: 2000,
            pauseOnHover: false,
            draggable: false,
        });

        await loadEnrolledStudents();
    };

    const formatDate = (dateString) => {
        if (dateString === "" || dateString === null) return "N/A"
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }; const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    const renderProgress = (status) => {
        const isNum = typeof status === "number";
        const text = String(status ?? "").toLowerCase();

        // derive percent
        let percent = 0;
        if (isNum && Number.isFinite(status)) {
            percent = clamp(status, 0, 100);
        } else {
            // prefer an explicit % if present
            let m = text.match(/(\d+(?:\.\d+)?)\s*%/);
            if (m) {
                percent = clamp(parseFloat(m[1]), 0, 100);
            } else {
                // fallback: first 1–3 digit number (to catch "50" or "50 of 100")
                m = text.match(/\b(\d{1,3})\b/);
                if (m) percent = clamp(parseInt(m[1], 10), 0, 100);
            }
        }

        console.log("renderProgress", status, percent);

        // defaults
        let label = `In Progress ${percent}%`;
        let fill = "#FFFF89";  // yellow-ish (progress)
        let cls = "course-home-info-progress-badge";

        if (text.includes("completed") || percent === 100) {
            label = "Completed 100%";
            cls += " is-complete";
            return (
                <div className="course-home-info-progress-wrap">
                    <div className={cls} style={{ "--p": "100%", "--fill": "#7EAC89" }}>
                        <span className="label-course-info">{label}</span>
                    </div>
                </div>
            );
        }

        if (text.includes("overdue")) {
            label = "Overdue";
            cls += " is-overdue";
            return (
                <div className="course-home-info-progress-wrap">
                    <div className={cls} style={{ "--p": "100%", "--fill": "#CB6F6F" }}>
                        <span className="label-course-info">{label}</span>
                    </div>
                </div>
            );
        }

        if (text.includes("not passed")) {
            label = "Not Passed";
            return (
                <div className="course-home-info-progress-wrap">
                    <div className={cls} style={{ "--p": "100%", "--fill": "#FFC000" }}>
                        <span className="label-course-info">{label}</span>
                    </div>
                </div>
            );
        }

        // Treat any numeric percent as in-progress even if "in progress" text is missing
        if (text.includes("in progress") || percent > 0) {
            return (
                <div className="course-home-info-progress-wrap">
                    <div className={cls} style={{ "--p": `${percent}%`, "--fill": fill }}>
                        <span className="label-course-info">{label}</span>
                    </div>
                </div>
            );
        }

        // Fallback: treat as 0% in-progress
        return (
            <div className="course-home-info-progress-wrap">
                <div className={cls} style={{ "--p": "0%", "--fill": fill }}>
                    In Progress 0%
                </div>
            </div>
        );
    };

    const removeStudentEnrollment = async (studentId) => {
        try {
            if (!studentId) {
                console.warn("removeStudentEnrollment called without studentId");
                return;
            }

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingCourses/published/enrollments/${id}/student/${studentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to remove student enrollment");
            }

            toast.success("Student enrollment removed successfully.", {
                closeButton: false,
                autoClose: 2000,
                pauseOnHover: false,
                draggable: false,
            });

            await loadEnrolledStudents();
        } catch (err) {
            console.error("Error removing student enrollment:", err);
            setError(err.message || "Failed to remove student enrollment");
        }
    };

    return (
        <div className="dc-version-history-file-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/home')} title="Home" />
                        <p className="logo-text-um">Training Management</p>
                    </div>
                    <div className="sidebar-logo-dm-fi">
                        <img src={`${process.env.PUBLIC_URL}/tmsCreateCourse2.svg`} alt="Control Attributes" className="icon-risk-rm" />
                        <p className="logo-text-dm-fi">{"Course Management"}</p>
                    </div>
                </div>
            )}

            {!isSidebarVisible && (
                <div className="sidebar-hidden">
                    <div className="sidebar-toggle-icon" title="Show Sidebar" onClick={() => setIsSidebarVisible(true)}>
                        <FontAwesomeIcon icon={faCaretRight} />
                    </div>
                </div>
            )}
            <div className="main-box-dc-version-history-file">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>
                    {/* This div creates the space in the middle */}
                    <div className="spacer"></div>

                    <TopBarDD />
                </div>
                <div className="table-flameproof-card">
                    <div className="flameproof-table-header-label-wrapper">
                        <label className="risk-control-label">{courseTitle}</label>
                    </div>
                    <div className="table-container-file">
                        <table className="dc-version-history-file-info-table" style={{ tableLayout: "fixed", width: "100%" }}>
                            <thead className="dc-version-history-file-info-head">
                                <tr>
                                    <th className="course-manage-nr">Nr</th>
                                    <th className="course-manage-name">Student Name</th>
                                    <th className="course-manage-status">Completion Status</th>
                                    <th className="course-manage-score">Score</th>
                                    <th className="course-manage-start">Enrollment Date</th>
                                    <th className="course-manage-end">Completion Date</th>
                                    <th className="course-manage-act">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((student, index) => {
                                    const isPlaceholder = student.isPlaceholder;
                                    const enrollment = student.enrollment || {};

                                    return (
                                        <tr
                                            key={isPlaceholder ? "placeholder" : student._id || index}
                                            style={{ textAlign: "center" }}
                                        >
                                            <td style={{ textAlign: "center" }}>{index + 1}</td>

                                            <td>
                                                {isPlaceholder ? "" : `${student.name} ${student.surname}`}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                {isPlaceholder ? "" : (renderProgress(enrollment.progress) ?? renderProgress("0%"))}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                {isPlaceholder ? "" : (enrollment.mark ?? "-")}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                {isPlaceholder
                                                    ? ""
                                                    : (enrollment.dateAdded
                                                        ? formatDate(enrollment.dateAdded)
                                                        : "-")}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                {isPlaceholder
                                                    ? ""
                                                    : (enrollment.completionDate
                                                        ? formatDate(enrollment.completionDate)
                                                        : "-")}
                                            </td>

                                            <td style={{ textAlign: "center" }}>
                                                {isPlaceholder ? (
                                                    // Placeholder: only PLUS
                                                    <button
                                                        className="flame-delete-button-fi col-but-res"
                                                        style={{ width: "33%" }}
                                                        onClick={() => setPopupVisible(true)}
                                                        title="Add student"
                                                    >
                                                        <FontAwesomeIcon icon={faCirclePlus} />
                                                    </button>
                                                ) : (
                                                    // Real row: PLUS + TRASH
                                                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                                        <button
                                                            className="flame-delete-button-fi col-but-res"
                                                            style={{ width: "33%" }}
                                                            onClick={() => setPopupVisible(true)}
                                                            title="Add students"
                                                        >
                                                            <FontAwesomeIcon icon={faCirclePlus} />
                                                        </button>

                                                        <button
                                                            className="flame-delete-button-fi col-but"
                                                            style={{ width: "33%" }}
                                                            onClick={() => {
                                                                setStudentToRemove(student);
                                                                setRemovePopupVisible(true);
                                                            }}
                                                            title="Delete student enrollment"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {popupVisible && (
                <AddStudentPopupOT
                    userIDs={userIDs}                 // ✅ already enrolled IDs
                    popupVisible={popupVisible}
                    closePopup={() => setPopupVisible(false)}
                    setUserIDs={setUserIDs}
                    saveData={saveData}               // ✅ receives selected array of ids
                    userID={jwtDecode(token)?.userId} // ✅ exclude logged in user (popup does this) :contentReference[oaicite:4]{index=4}
                />
            )}

            {removePopupVisible && studentToRemove && (
                <RemoveStudentEnrollment
                    studentName={`${studentToRemove.name} ${studentToRemove.surname}`}
                    closeModal={() => {
                        setRemovePopupVisible(false);
                        setStudentToRemove(null);
                    }}
                    removeEnrollement={async () => {
                        await removeStudentEnrollment(studentToRemove._id);
                        setRemovePopupVisible(false);
                        setStudentToRemove(null);
                    }}
                />
            )}

            <ToastContainer />
        </div >
    );
};

export default OnlineTrainingCourseManagement;