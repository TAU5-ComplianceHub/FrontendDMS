import React from "react";

const InfoSubStepsDDS = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Procedure Sub Steps
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
                        Bullet points are automatically applied to Procedure Sub-Steps when Enter is pressed. Do not manually add bullet points, as this will result in duplicate bullets in the final output.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoSubStepsDDS;
