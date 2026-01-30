import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faCircleUser, faDownload, faChevronLeft, faChevronRight, faCaretLeft, faCaretRight, faCirclePlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from 'jwt-decode';
import TopBarDD from "../Notifications/TopBarDD";
import { toast, ToastContainer } from "react-toastify";
import "./OnlineTrainingCourseGrading.css";

const OnlineTrainingCourseGrading = () => {
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const [studentName, setStudentName] = useState("");
    const [loading, setLoading] = useState(false);
    const [courseId, setCourseId] = useState(""); // if your route param "id" is courseId you can just use id
    const [targetStudentId, setTargetStudentId] = useState(""); // set from UI or route
    const [textItems, setTextItems] = useState([]); // [{questionId, question, answerText}]
    const [assessmentStatus, setAssessmentStatus] = useState("");
    const [gradingMap, setGradingMap] = useState({}); // { [questionId]: true/false }

    const { courseID: cId, studentID: sId } = useParams();

    const getToken = () => localStorage.getItem("token");

    const loadStudentSubmission = async (studentId, courseId) => {
        const t = getToken();
        if (!t) {
            toast.error("You are not logged in.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingCourses/marking/pending/${courseId}/${studentId}`,
                {
                    headers: { Authorization: `Bearer ${t}` }
                }
            );

            const raw = await res.text();
            const json = (() => { try { return JSON.parse(raw); } catch { return null; } })();

            if (!res.ok) throw new Error(json?.error || json?.message || raw || `Load failed (HTTP ${res.status})`);

            setStudentName(`${json?.student?.name || ""} ${json?.student?.surname || ""}`.trim());
            setAssessmentStatus(json?.assessmentStatus || "");
            setTextItems(Array.isArray(json?.textAnswers) ? json.textAnswers : []);
            console.log("Loaded submission:", json);

            // Initialize grading map: default undefined (not marked yet)
            const init = {};
            (json?.textAnswers || []).forEach(x => { init[x.questionId] = undefined; });
            setGradingMap(init);

        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to load submission");
            toast.error(e.message || "Failed to load submission");
        } finally {
            setLoading(false);
        }
    };

    const submitGrading = async () => {
        const t = getToken();
        if (!t) {
            toast.error("You are not logged in.");
            return;
        }
        if (!courseId || !targetStudentId) {
            toast.error("Missing course or student.");
            return;
        }

        // Ensure everything has been marked
        const missing = textItems.filter(x => {
            const v = gradingMap[x.questionId];
            return typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100;
        });
        if (missing.length > 0) {
            toast.warn("Please enter a percentage (0-100) for all questions before submitting", { autoClose: 2000, closeButton: false });
            return;
        }

        const results = textItems.map(x => ({
            questionId: x.questionId,
            percent: Number(gradingMap[x.questionId])
        }));

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/onlineTrainingCourses/grade/${courseId}/${targetStudentId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    body: JSON.stringify({ results })
                }
            );

            const raw = await res.text();
            const json = (() => { try { return JSON.parse(raw); } catch { return null; } })();

            if (!res.ok) throw new Error(json?.error || json?.message || raw || `Submit grading failed (HTTP ${res.status})`);

            toast.success(`Graded. Score: ${json?.scorePercent ?? "-"}% (${json?.passed ? "Passed" : "Failed"})`, { autoClose: 1500, closeButton: false });

            // Refresh view (will now no longer be pending)
            setAssessmentStatus(json?.assessmentStatus || "GRADED");

            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to submit grading");
            toast.error(e.message || "Failed to submit grading");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cId && sId) {
            setCourseId(cId);
            setTargetStudentId(sId);
            loadStudentSubmission(sId, cId);
            console.log("Loading submission for course:", cId, "student:", sId);
        }
    }, [cId, sId]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            const decodedToken = jwtDecode(storedToken);
        }
    }, [navigate]);

    const allGraded =
        textItems.length > 0 &&
        textItems.every(x => {
            const v = gradingMap[x.questionId];
            return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
        });

    const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

    const onPercentChange = (questionId, raw) => {
        // allow empty
        if (raw === "") {
            setGradingMap(prev => ({ ...prev, [questionId]: "" }));
            return;
        }

        // strip non-digits (so only numbers)
        const cleaned = String(raw).replace(/[^\d]/g, "");

        if (cleaned === "") {
            setGradingMap(prev => ({ ...prev, [questionId]: "" }));
            return;
        }

        const n = clamp(parseInt(cleaned, 10));
        setGradingMap(prev => ({ ...prev, [questionId]: n }));
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
                        <p className="logo-text-dm-fi">{"Assessment Grading"}</p>
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
                    <div className="spacer"></div>

                    <TopBarDD />
                </div>
                <div className="table-flameproof-card grading-card">
                    <div className="flameproof-table-header-label-wrapper">
                        <label className="risk-control-label">Assessment Submission of {studentName}</label>
                    </div>

                    {/* Scroll area */}
                    <div className="grading-scroll">
                        {loading && <div style={{ padding: 10 }}>Loading…</div>}

                        {!loading && assessmentStatus !== "PENDING_REVIEW" && (
                            <div style={{ padding: 10 }}>
                                This assessment is not pending review.
                            </div>
                        )}

                        {!loading && assessmentStatus === "PENDING_REVIEW" && textItems.map((item) => (
                            <div className="grading-qcard" key={item.questionId}>
                                <div className="grading-qtitle">{item.question}</div>

                                <textarea
                                    className="grading-answer"
                                    value={item.answerText || ""}
                                    readOnly
                                />

                                <div className="grading-percent-row">
                                    <label className="grading-percent-label" htmlFor={`pct-${item.questionId}`}>
                                        Enter Percentage
                                    </label>

                                    <input
                                        id={`pct-${item.questionId}`}
                                        className="grading-percent-input"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        value={gradingMap[item.questionId] ?? ""}
                                        onChange={(e) => onPercentChange(item.questionId, e.target.value)}
                                        onBlur={(e) => {
                                            // on blur, clamp if value exists
                                            const v = e.target.value;
                                            if (v === "") return;
                                            const n = clamp(parseInt(String(v).replace(/[^\d]/g, "") || "0", 10));
                                            setGradingMap(prev => ({ ...prev, [item.questionId]: n }));
                                        }}
                                        placeholder="0 - 100"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Fixed footer button (not scrolled) */}
                    <div className="grading-footer">
                        <button
                            type="button"
                            className="generate-button"
                            style={{ width: "20%" }}
                            disabled={loading || assessmentStatus !== "PENDING_REVIEW"}
                            onClick={submitGrading}
                            title={!allGraded ? "Grade all questions before submitting" : "Submit grading"}
                        >
                            Submit Grading
                        </button>

                    </div>
                </div>
            </div>

            <ToastContainer />
        </div >
    );
};

export default OnlineTrainingCourseGrading;