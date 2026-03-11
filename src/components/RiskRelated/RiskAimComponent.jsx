import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInfoCircle,
    faMagicWandSparkles,
    faRotateLeft,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";

const RiskAimComponent = ({
    readOnly,
    error,
    value,
    loading,
    rewriteHistory,
    onChange,
    onFocus,
    onHelp,
    onAiRewrite,
    onUndo
}) => {
    return (
        <div className="input-row-risk-create">
            <div className={`input-box-aim-risk-create ${error ? "error-create" : ""}`}>
                <button
                    className="top-left-button-refs"
                    title="Information"
                    type="button"
                >
                    <FontAwesomeIcon
                        icon={faInfoCircle}
                        onClick={onHelp}
                        style={{ cursor: "pointer" }}
                        className="icon-um-search"
                    />
                </button>

                <h3 className="font-fam-labels">
                    Aim <span className="required-field">*</span>
                </h3>

                <textarea
                    spellCheck="true"
                    name="aim"
                    className="aim-textarea-risk-create-ibra font-fam"
                    onChange={onChange}
                    onFocus={onFocus}
                    value={value}
                    rows="5"
                    placeholder="Clearly state the goal of the risk assessment, focusing on what the assessment intends to achieve or address. Keep it specific, relevant, and outcome-driven."
                    readOnly={readOnly}
                />

                {!readOnly && (
                    <>
                        {loading ? (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="aim-textarea-icon-ibra spin-animation"
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faMagicWandSparkles}
                                className="aim-textarea-icon-ibra"
                                title="AI Rewrite"
                                style={{ fontSize: "15px" }}
                                onClick={onAiRewrite}
                            />
                        )}

                        <FontAwesomeIcon
                            icon={faRotateLeft}
                            className="aim-textarea-icon-ibra-undo"
                            title="Undo AI Rewrite"
                            onClick={onUndo}
                            style={{
                                marginLeft: "8px",
                                opacity: rewriteHistory?.aim?.length ? 1 : 0.3,
                                cursor: rewriteHistory?.aim?.length ? "pointer" : "not-allowed",
                                fontSize: "15px"
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default RiskAimComponent;