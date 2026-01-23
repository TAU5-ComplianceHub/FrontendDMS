import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const RemoveStudentEnrollment = ({ closeModal, removeEnrollement, studentName }) => {
    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">Remove Enrollment</h2>
                    <button className="delete-file-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group-startAssessment">
                    <div className="delete-file-text-startAssessment">{`This will remove the student ${studentName} from the course. Would you like to proceed?`}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-delete-startAssessment" onClick={removeEnrollement}>
                        {'Remove Enrollment'}
                    </button>
                    <button className="delete-file-button-cancel-startAssessment" onClick={closeModal}>
                        Keep Enrollment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveStudentEnrollment