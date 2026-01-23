import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

export default function HelpPillButton({ onClick, label = "Help" }) {
    return (
        <button
            type="button"
            className="helpPill__button"
            onClick={onClick}
            aria-label="Open help"
            title="Help"
        >
            <span className="helpPill__icon" aria-hidden="true">
                <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
            <span className="helpPill__text">{label}</span>
        </button>
    );
}
