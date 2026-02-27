

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
                            Use this section to select controls that are applicable to this risk assessment. The goal is to narrow down risk assessment controls to ones that are necessary for the execution of a specific risk assessment. If a control of interest does not appear in the options provided, select Suggest New to add controls that have not been captured in the system.
                            <br /><br />
                            Controls not included in this section will not be available through out the risk assessment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ApplicableControlHelp;