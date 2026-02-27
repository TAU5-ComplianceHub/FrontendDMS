const ImportControlChanges = ({ closeModal, generate, cancel }) => {
    return (
        <div className="generate-incompletedraft-popup-overlay">
            <div className="generate-incompletedraft-popup-content">
                <div className="generate-incompletedraft-header">
                    <h2 className="generate-incompletedraft-title">Control Import</h2>
                    <button className="generate-incompletedraft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="generate-incompletedraft-group">
                    <div className="generate-incompletedraft-text">{`Do you want to import the updated controls into this Risk Assessment?`}</div>
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