import React from "react";

const InfoPopupTemplateTitleField = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Work Order Title
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
                        The work order title is generated automatically once the Frequency, Work Order Basis, and Work Order Type have all been selected.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPopupTemplateTitleField;
