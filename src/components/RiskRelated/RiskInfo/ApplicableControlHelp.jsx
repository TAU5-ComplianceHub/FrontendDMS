

import React, { useState, useEffect } from "react";

const ApplicableControlHelp = ({ setClose }) => {
    return (
        <div className="popup-overlay-exec">
            <div className="popup-content-app-controls">
                <div className="review-date-header">
                    <h2 className="review-date-title">Applicable Controls</h2>
                    <button className="review-date-close" onClick={setClose} title="Close Popup">×</button>
                </div>

                <div className="exec-table-group-2">
                    <div className="popup-table-wrapper-app-controls">
                        <p>
                            This section serves as a preparatory workspace for the facilitator to capture potential controls before completing the risk assessment table. Its purpose is to stimulate structured thinking and assist in identifying all relevant controls that may be required during the session. Controls recorded here will be available for selection in the risk assessment dropdown lists, making the assessment process more efficient and consistent.
                            <br /><br />
                            Controls added in this section that are not applied in the risk assessment will be flagged when generating the final output document, serving as a reminder to review their relevance. Facilitators may still add controls directly within the risk assessment table by typing them manually; however, such controls will not appear in the dropdown list unless captured in this preparatory section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ApplicableControlHelp;