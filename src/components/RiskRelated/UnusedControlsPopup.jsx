const UnusedControlsPopup = ({ closeModal, generate, cancel }) => {
    return (
        <div className="generate-incompletedraft-popup-overlay">
            <div className="generate-incompletedraft-popup-content">
                <div className="generate-incompletedraft-header">
                    <h2 className="generate-incompletedraft-title">Generate Unused Controls</h2>
                    <button className="generate-incompletedraft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="generate-incompletedraft-group">
                    <div className="generate-incompletedraft-text">{`Not all controls selected on the Applicable Controls Table was used. Do you want to generate the draft in its current state?`}</div>
                </div>

                <div className="generate-incompletedraft-buttons">
                    <button className="generate-incompletedraft-button-delete" onClick={generate}>
                        {"Generate"}
                    </button>
                    <button className="generate-incompletedraft-button-cancel" onClick={cancel}>
                        {"Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnusedControlsPopup;