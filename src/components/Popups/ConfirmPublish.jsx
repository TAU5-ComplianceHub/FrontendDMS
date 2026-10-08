import "./DeleteDraftPopup.css";

const ConfirmPublish = ({ closeModal, confirmPublish, draftName }) => {
    return (
        <div className="delete-draft-popup-overlay">
            <div className="delete-draft-popup-content">
                <div className="delete-draft-header">
                    <h2 className="delete-draft-title">Publish Draft</h2>
                    <button className="delete-draft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-draft-group">
                    <div className="delete-draft-text">Are you sure you want to publish the following document?</div>
                    <div>{draftName}</div>
                </div>

                <div className="delete-draft-buttons" style={{ marginTop: "10px" }}>
                    <button className="delete-draft-button-cancel" onClick={confirmPublish} style={{ marginRight: "10px", marginLeft: "auto" }}>
                        Publish
                    </button>
                    <button className="delete-draft-button-delete" onClick={closeModal} style={{ marginRight: "auto", marginLeft: "10px" }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPublish;
