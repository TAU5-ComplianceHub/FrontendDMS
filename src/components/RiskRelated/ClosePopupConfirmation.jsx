const ClosePopupConfirmation = ({ onClose, onSubmit, closePopup }) => {
    return (
        <div className="generate-incompletedraft-popup-overlay">
            <div className="generate-incompletedraft-popup-content">
                <div className="generate-incompletedraft-header">
                    <h2 className="generate-incompletedraft-title">Unsubmitted Changes</h2>
                    <button className="generate-incompletedraft-close" onClick={closePopup} title="Close Popup">×</button>
                </div>

                <div className="generate-incompletedraft-group">
                    <div className="generate-incompletedraft-text">{`Changes have been made that have not been submitted. Would you like to submit them now, or close the popup?`}</div>
                </div>

                <div className="generate-incompletedraft-buttons">
                    <button className="generate-incompletedraft-button-cancel" style={{ marginLeft: "auto", marginRight: "10px" }} onClick={onSubmit}>
                        {"Submit"}
                    </button>
                    <button className="generate-incompletedraft-button-delete" style={{ marginLeft: "10px", marginRight: "auto" }} onClick={onClose}>
                        {"Close"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClosePopupConfirmation;