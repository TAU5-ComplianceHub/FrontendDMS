import React from "react";

const InfoPopupFrequencyTemplateCreation = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Work Order Frequency
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
                        Work Order Frequency defines how often this Work Order should be performed (e.g. Daily, Weekly, or Monthly).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPopupFrequencyTemplateCreation;
