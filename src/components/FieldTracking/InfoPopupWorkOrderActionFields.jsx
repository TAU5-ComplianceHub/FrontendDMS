import React from "react";

const InfoPopupWorkOrderActionFields = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Work Order Action Fields
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
                        Work Order Action Fields define the information a field user will complete while carrying out the Work Order. Fields can include items such as Pass/Fail checks, Photo Capture, measurements, or other required inputs, and are presented to the field user in the order shown.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPopupWorkOrderActionFields;
