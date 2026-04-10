const RestoreAsset = ({ closeModal, asset, restoreAsset, permanent = false }) => {
    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-file-header">
                    <h2 className="delete-file-title">Restore Asset</h2>
                    <button className="delete-file-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-file-group">
                    <div className="delete-file-text">{"Are you sure you want to restore this asset?"}</div>
                    <div>{asset.assetNr}</div>
                </div>

                <div className="delete-file-buttons">
                    <button className="delete-file-button-cancel" style={{ marginLeft: "auto", marginRight: "10px" }} onClick={restoreAsset}>
                        {'Restore'}
                    </button>
                    <button className="delete-file-button-delete" style={{ marginLeft: "10px", marginRight: "auto" }} onClick={closeModal}>
                        Keep
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreAsset;