

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
                            Choose the controls that apply to this Risk Assessment in the applicable controls table. Only the controls you choose in this table will be visible in the risk assessment table when performing the risk assessment, this is remove controls that are in the system that are not applicable.
                            If additional controls are required, you can add them to this table at any time, and they will then appear in the risk assessment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ApplicableControlHelp;