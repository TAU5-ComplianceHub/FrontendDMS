import React from "react";

const InfoJRAImportFTS = ({ setClose }) => {
    return (
        <div className="dashInfo-overlay" role="dialog" aria-modal="true">
            <div className="dashInfo-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">
                        JRA Import
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
                        Imports information from JRA documents that were selected in the work order action fields into this Work Order Template. This information includes Hazards, Controls, PPE, Materials, and Hand Tools.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoJRAImportFTS;
