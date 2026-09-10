import React from "react";

const InfoHazardsControlsDDS = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Hazards and Controls
                    </h2>

                    <button
                        type="button"
                        className="review-date-close"
                        onClick={setClose}
                        title="Close Popup"
                        aria-label="Close popup"
                    >
                        ×
                    </button>
                </div>

                <div className="dashInfo-body">
                    <p className="dashInfo-text">
                        Hazards and Controls are imported directly from the selected JRA. If no JRA is imported into the Procedure, this section will remain empty.<br /><br />

                        <strong>Note:</strong> Hazards and Controls can only be imported when creating a new Procedure. Once a Procedure is already in development, the import option will no longer be available.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoHazardsControlsDDS;
