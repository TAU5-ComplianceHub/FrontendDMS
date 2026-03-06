import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ApproveApprovalProcessPopup = ({ closeModal, approveDraft, loading }) => {
    return (
        <div className="delete-draft-popup-overlay">
            <div className="delete-draft-popup-content">
                <div className="delete-draft-header">
                    <h2 className="delete-draft-title">Approve Document</h2>
                    <button className="delete-draft-close" onClick={closeModal} title="Close Popup">×</button>
                </div>

                <div className="delete-draft-group">
                    <div className="delete-draft-text" style={{ marginBottom: "0px" }}>{"Are you sure you want to approve this document?"}</div>
                </div>

                <div className="delete-draft-buttons">

                    <button className="approve-popup-approve-button" onClick={approveDraft} disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Approve'}
                    </button>
                    <button className="approve-popup-decline-button" onClick={closeModal} disabled={loading}>
                        {"Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveApprovalProcessPopup;