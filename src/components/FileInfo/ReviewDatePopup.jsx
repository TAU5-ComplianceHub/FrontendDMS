import React, { useEffect, useState } from "react";
import "./ReviewDatePopup.css";

const ReviewDatePopup = ({ isOpen, onClose, onUpdate, currVal }) => {
    const [reviewDateVal, setReviewDateVal] = useState("30");

    useEffect(() => {
        if (isOpen) {
            const savedValue = localStorage.getItem("highlightReviewDates");
            if (savedValue && !isNaN(savedValue) && Number(savedValue) > 0) {
                setReviewDateVal(savedValue);
            } else if (currVal && !isNaN(currVal) && Number(currVal) > 0) {
                setReviewDateVal(String(currVal));
            } else {
                setReviewDateVal("30");
            }
        }
    }, [isOpen, currVal]);

    const handleReviewDateChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setReviewDateVal(value);
        }
    };

    const submitReviewDate = () => {
        if (!reviewDateVal || isNaN(reviewDateVal) || Number(reviewDateVal) <= 0) {
            alert("Please enter a valid number greater than 0.");
            return;
        }

        const parsedValue = Number(reviewDateVal);

        localStorage.setItem("highlightReviewDates", String(parsedValue));
        onUpdate(parsedValue);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="review-popup-overlay">
            <div className="review-popup-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">Highlight Review Dates</h2>
                    <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <div className="review-date-group">
                    <label className="review-date-label" htmlFor="email">Review Date Alert Threshold (X Days)</label>
                    <span className="review-date-label-tc">
                        Set the number of days (X) before a scheduled review date when highlighting should begin.
                        The review date will be highlighted yellow if it falls within X days from today, and red if it has already passed.
                    </span>
                    <input
                        type="text"
                        value={reviewDateVal}
                        onChange={handleReviewDateChange}
                        placeholder="Insert Number of Days"
                        className="review-popup-input"
                    />
                </div>

                <div className="review-date-buttons">
                    <button onClick={submitReviewDate} className="review-date-button">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDatePopup;