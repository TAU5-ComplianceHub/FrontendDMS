import React from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// ---------------------------------------------------------------------------
// TaskInfoPreview
//
// "View Task Information" popup - the task equivalent of WorkOrderInfoPreview
// (see WorkOrderManagementPopups/WorkOrderInfoPreview.jsx), opened from the
// Preview button on the allocator's Task Management table, only once a
// task's status is "Completed". It shows exactly what the responsible person
// submitted - their comments and the supporting files they uploaded - and
// nothing else, so unlike WorkOrderInfoPreview it:
//
//   - Takes the task straight from the row already held in the table's
//     `tasks` state, instead of re-fetching from the server. A task here has
//     no equivalent of a work order's action fields, which can keep changing
//     after submission (e.g. a follow-up task gets scheduled against one) -
//     nothing on a completed task changes while this popup is open, so
//     there's nothing to refresh. This also matches how every other popup on
//     this page already works (ModifyMyTask, ModifyAllocatedTaskPopup, etc.
//     all take their task as a prop rather than fetching by id).
//   - Never shows a "needs scheduling" column - manual tasks don't have
//     action fields/hazard classes, so that concept doesn't apply here.
//
// Closing (the X) just closes this popup. "Close Out Task" also only closes
// this popup; it hands off to onCloseOut, which the caller (ManualTaskingPage)
// uses to open the existing CloseAllocatedTask confirmation popup for this
// task - the very same one already used by the closeStatus checkbox
// elsewhere in the table. This popup never calls the close-out API itself.
// ---------------------------------------------------------------------------

// Same API-base routing every other handler on ManualTaskingPage uses -
// auto-auto tasks are served from a different route than manual/auto-manual
// ones (see taskApiBase in ManualTaskingPage.js).
const taskApiBase = (task) =>
    task?._taskSource === "autoAuto"
        ? `${process.env.REACT_APP_URL}/api/auto-auto-tasks`
        : `${process.env.REACT_APP_URL}/api/complainceTasks`;

// A single supporting-document row: the file name, underlined and
// clickable, which downloads the file via the task's user-attachments
// download endpoint - the same endpoint the table's own "userAttachments"
// column already downloads from (see handleDownloadAttachment in
// ManualTaskingPage.js), so a file that can be downloaded from the table
// can be downloaded here too.
const SupportingFileLink = ({ task, file }) => {
    const fileName = file?.fileName || file?.name || "Attachment";
    const attachmentId = file?._id;
    const downloadUrl = (attachmentId && task?._id)
        ? `${taskApiBase(task)}/${task._id}/user-attachments/${attachmentId}/download`
        : null;

    const handleDownload = async () => {
        if (!downloadUrl) return;
        try {
            const storedToken = localStorage.getItem("token");
            const response = await axios.get(downloadUrl, {
                headers: { Authorization: `Bearer ${storedToken}` },
                responseType: "blob",
            });
            saveAs(response.data, fileName);
        } catch {
            // No toast context here by design, same as ActionFieldFileValue -
            // a failed download simply does nothing; the user can try again.
        }
    };

    return (
        <button
            type="button"
            title="Click to download"
            onClick={handleDownload}
            disabled={!downloadUrl}
            style={{
                padding: 0,
                border: "none",
                background: "transparent",
                color: "#0B5ED7",
                textDecoration: "underline",
                cursor: downloadUrl ? "pointer" : "not-allowed",
                fontSize: "14px",
                textAlign: "left",
            }}
        >
            {fileName}
        </button>
    );
};

// The full list of supporting documents, each on its own line with the same
// light divider the table's own attachment columns already use (see the
// "attachments"/"userAttachments" cases in ManualTaskingPage.js), so this
// list looks identical to the one already shown inline in the table.
const SupportingFilesList = ({ task, files }) => {
    if (!Array.isArray(files) || files.length === 0) {
        return <span style={{ color: "#888" }}>No supporting documents were uploaded.</span>;
    }

    return (
        <>
            {files.map((file, index) => (
                <div key={file?._id || index}>
                    <SupportingFileLink task={task} file={file} />
                    {index < files.length - 1 && (
                        <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />
                    )}
                </div>
            ))}
        </>
    );
};

const TaskInfoPreview = ({ open, task, onClose, onCloseOut }) => {
    if (!open || !task) return null;

    const isClosedOut = Boolean(task.closeStatus);
    const supportingFiles = task._rawUserAttachments || task.userAttachments || [];

    return (
        <div className="template-preview-overlay">
            <div className="template-preview-panel">
                <div className="template-preview-header">
                    <h2 className="font-fam-labels">View Task Information</h2>
                    <FontAwesomeIcon
                        icon={faTimes}
                        className="template-preview-close"
                        onClick={onClose}
                        title="Close"
                    />
                </div>

                <div
                    className="scrollable-box-preview template-preview-body"
                    style={{ overflowY: "auto" }}
                >
                    <div className="input-row">
                        <div className="input-box-ref">
                            <h3 className="font-fam-labels">Task Information</h3>

                            <table className="table-borders-jra-info" style={{ tableLayout: "fixed", width: "100%" }}>
                                <colgroup>
                                    <col style={{ width: "20%" }} />
                                    <col />
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <th scope="row" className="jra-info-table-header">
                                            Responsible Comments
                                        </th>
                                        <td style={{ whiteSpace: "pre-wrap" }}>
                                            {task.userComments || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="jra-info-table-header">
                                            Responsible Supporting Information
                                        </th>
                                        <td>
                                            <SupportingFilesList task={task} files={supportingFiles} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="input-row-buttons" style={{ marginBottom: "15px", marginTop: "5px" }}>
                    {isClosedOut ? (
                        <button
                            type="button"
                            className="generate-button font-fam"
                            disabled
                            style={{ opacity: 0.7, cursor: "not-allowed", backgroundColor: "#7EAC87" }}
                        >
                            Closed Out
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="generate-button font-fam"
                            onClick={onCloseOut}
                        >
                            Close Out Task
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskInfoPreview;
