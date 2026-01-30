
import React, { useState, useEffect } from "react";

const AssessmentNote = ({ setClose, text }) => {
    return (
        <div className="popup-overlay-haz">
            <div className="popup-content-haz" style={{ width: "35%", minHeight: "100px" }}>
                <div className="review-date-header">
                    <h2 className="review-date-title">Assessment Info</h2>
                    <button className="review-date-close" onClick={setClose} title="Close Popup">×</button>
                </div>

                <div className="note-table-group" style={{ height: "70px", alignContent: "center" }}>
                    <span className="note-text" style={{ marginTop: "auto", marginBottom: "auto", marginRight: "15px" }}>
                        {"Enter the question that students must answer, along with the multiple-choice options. Select the correct answer. Students who choose this option will be marked as having answered the question correctly."}
                    </span>
                </div>
            </div>
        </div>
    )
};

export default AssessmentNote;