import React from "react";

const InfoPopupWorkOrderBasesSelection = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Work Order Basis
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
                        Work Order Basis defines the primary context that a Work Order Template applies to. It identifies whether work created from this template is associated with an Asset, Area, or Department.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPopupWorkOrderBasesSelection;
