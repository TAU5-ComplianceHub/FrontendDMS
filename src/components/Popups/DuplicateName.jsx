import React, { useEffect, useState } from "react";
import "./SaveAsPopup.css"; // Import a separate CSS file for styling
import { toast } from "react-toastify";

const DuplicateName = ({ onClose, saveAs, current }) => {
    const [title, setTitle] = useState(current);

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
    };

    return (
        <div className="saveAs-popup-overlay">
            <div className="saveAs-popup-content">
                <div className="saveAs-date-header">
                    <h2 className="saveAs-date-title">Save Draft</h2>
                </div>

                <div className="saveAs-date-group">
                    <label className="saveAs-date-label" htmlFor="email">Draft Title</label>
                    <span className="saveAs-date-label-tc">
                        A draft with this title already exists in the system. Enter a unique name for the draft:
                    </span>
                    <textarea
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder={`Insert the new title`}
                        className="saveAs-popup-input"
                    />
                </div>

                <div className="saveAs-date-buttons">
                    <button onClick={() => saveAs(title)} className="saveAs-date-button">Save Draft</button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateName;
