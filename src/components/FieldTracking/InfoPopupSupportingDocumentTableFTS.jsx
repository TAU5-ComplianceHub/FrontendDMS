import React from "react";

const InfoPopupSupportingDocumentTableFTS = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        Supporting Information
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
                        Supporting Information provides additional context and reference material for this Work Order Template. Users can upload manuals, diagrams, procedures, or other supporting files that field users may view or download while completing the Work Order.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPopupSupportingDocumentTableFTS;
