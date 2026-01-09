const MoveRepairedComponent = ({ closeModal, newCertificate, moveNormal }) => {
    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">Move Component</h2>
                    <button className="delete-file-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text" style={{ marginBottom: "0px" }}>{"Does this component require a new certificate?"}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-delete" onClick={newCertificate}>
                        {'Yes'}
                    </button>
                    <button className="delete-file-button-cancel" onClick={moveNormal}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveRepairedComponent;