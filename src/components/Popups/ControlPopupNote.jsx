import "./DraftPopup.css";

const ControlPopupNote = ({ closeModal }) => {
    return (
        <div className="warn-draft-draft-popup-overlay">
            <div className="warn-draft-draft-popup-content">
                <button className="warn-draft-draft-close" onClick={closeModal} title="Close Popup">×</button>
                <div className="warn-draft-warning-container">
                    <div className="warn-draft-warning-icon">!</div>
                    <div className="warn-draft-warning-text">
                        <strong>Warning!</strong><br />
                        The generated risk assessment document does not include all selected controls. Please ensure that all relevant controls are incorporated into the risk treatment plans within the document to maintain compliance and effectiveness.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPopupNote;
