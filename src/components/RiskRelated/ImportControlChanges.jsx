const ImportControlChanges = ({ closeModal, generate, cancel }) => {
    return (
        <div className="generate-incompletedraft-popup-overlay">
            <div className="generate-incompletedraft-popup-content">
                <div className="generate-incompletedraft-header">
                    <h2 className="generate-incompletedraft-title">Control Import</h2>
                    <button className="generate-incompletedraft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="generate-incompletedraft-group">
                    <div className="generate-incompletedraft-text">{`Some of the controls used in the Risk Assessment have been updated in the system, do you want to import the changes to this Risk Assessment?`}</div>
                </div>

                <div className="generate-incompletedraft-buttons">
                    <button className="generate-incompletedraft-button-delete" onClick={generate}>
                        {"Import"}
                    </button>
                    <button className="generate-incompletedraft-button-cancel" onClick={cancel}>
                        {"Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportControlChanges;