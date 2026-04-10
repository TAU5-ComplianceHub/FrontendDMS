const RestoreDraftPopup = ({ closeModal, restoreDraft, draftName }) => {
    return (
        <div className="delete-draft-popup-overlay">
            <div className="delete-draft-popup-content">
                <div className="delete-draft-header">
                    <h2 className="delete-draft-title">Restore Draft</h2>
                    <button className="delete-draft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-draft-group">
                    <div className="delete-draft-text">{`Are you sure you want to restore this draft?`}</div>
                    <div>{draftName}</div>
                </div>

                <div className="delete-draft-buttons">
                    <button className="delete-draft-button-cancel" onClick={restoreDraft} style={{ marginLeft: "auto", marginRight: "10px" }}>
                        {`Restore`}
                    </button>
                    <button className="delete-draft-button-delete" onClick={closeModal} style={{ marginLeft: "10px", marginRight: "auto" }}>
                        {"Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreDraftPopup;