import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PopupMenuOnlineTrainingGrading = ({ isOpen, setHoveredStudentId, studentId, courseId }) => {
    const navigate = useNavigate();

    return (
        <div className="popup-menu-container-pub-files">
            {isOpen && (
                <div className="popup-content-pub-files" style={{ width: "200px" }}
                    onMouseEnter={() => setHoveredStudentId(studentId)}
                    onMouseLeave={() => setHoveredStudentId(null)}
                >
                    <ul>
                        <li onClick={() => navigate(`/FrontendDMS/gradeSubmission/${studentId}/${courseId}`)}>Grade Assessment</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PopupMenuOnlineTrainingGrading;