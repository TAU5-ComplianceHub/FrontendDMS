// Add these imports near the top (FontAwesome already used in your file)
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

// Put this component in the same file (or in its own file)
const FloatingHelp = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    return (
        <>
            {/* Floating Button */}
            <button
                type="button"
                className="help-fab"
                onClick={() => setOpen(true)}
                aria-label="Open help"
                title="Help"
            >
                <FontAwesomeIcon icon={faQuestionCircle} />
            </button>

            {/* Panel */}
            <div className={`help-panel ${open ? "is-open" : ""}`} role="dialog" aria-label="Help">
                <div className="help-header">
                    <div className="help-title">Help</div>
                    <button
                        type="button"
                        className="help-close"
                        onClick={() => setOpen(false)}
                        aria-label="Close help"
                        title="Close"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="help-body">
                    {/* Empty for now */}
                </div>

                <div className="help-inputbar">
                    <input
                        className="help-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your question…"
                        aria-label="Help message"
                    />
                    <button
                        type="button"
                        className="help-send"
                        aria-label="Send"
                        title="Send"
                        onClick={() => {
                            // design only for now
                            setMessage("");
                        }}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>

            {/* Optional: click outside to close */}
            {open && <div className="help-backdrop" onClick={() => setOpen(false)} />}
        </>
    );
};

export default FloatingHelp;
