import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInfoCircle,
    faMagicWandSparkles,
    faRotateLeft,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";

const RiskScopeIE = ({
    readOnly,
    error,
    formData,
    setErrors,
    onChange,
    onHelp,
    loadingScope,
    loadingScopeI,
    loadingScopeE,
    rewriteHistory,
    onAiRewriteScope,
    onAiRewriteScopeInclusions,
    onAiRewriteScopeExclusions,
    onUndoScope,
    onUndoScopeInclusions,
    onUndoScopeExclusions
}) => {
    const clearScopeError = () => {
        setErrors(prev => ({
            ...prev,
            scope: false
        }));
    };

    return (
        <div className="input-row-risk-create">
            <div className={`input-box-aim-risk-scope ${error ? "error-create" : ""}`}>
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
                    Scope <span className="required-field">*</span>
                </h3>

                <div className="risk-scope-group" style={{ marginBottom: "-10px" }}>
                    <div className="risk-execSummary-popup-page-additional-row">
                        <div className="risk-popup-page-column-half-scope">
                            <label className="scope-risk-label">Introduction</label>
                            <textarea
                                lang="en-ZA"
                                spellCheck="true"
                                name="scope"
                                className="aim-textarea-risk-scope-2 font-fam"
                                onChange={onChange}
                                value={formData.scope}
                                rows="5"
                                placeholder="Insert a brief scope introduction (General scope notes and comments)."
                                onFocus={clearScopeError}
                                readOnly={readOnly}
                            />

                            {!readOnly && (
                                <>
                                    {loadingScope ? (
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="scope-textarea-icon spin-animation"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faMagicWandSparkles}
                                            className="scope-textarea-icon"
                                            title="AI Rewrite"
                                            style={{ fontSize: "15px" }}
                                            onClick={onAiRewriteScope}
                                        />
                                    )}

                                    <FontAwesomeIcon
                                        icon={faRotateLeft}
                                        className="scope-textarea-icon-undo"
                                        title="Undo AI Rewrite"
                                        onClick={onUndoScope}
                                        style={{
                                            marginLeft: "8px",
                                            opacity: rewriteHistory?.scope?.length ? 1 : 0.3,
                                            cursor: rewriteHistory?.scope?.length ? "pointer" : "not-allowed",
                                            fontSize: "15px"
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="risk-scope-group">
                    <div className="risk-scope-popup-page-additional-row">
                        <div className="risk-popup-page-column-half-scope">
                            <label className="scope-risk-label">Scope Inclusions</label>
                            <textarea
                                spellCheck="true"
                                name="scopeInclusions"
                                className="aim-textarea-risk-scope font-fam"
                                value={formData.scopeInclusions}
                                onChange={onChange}
                                rows="5"
                                placeholder="Insert scope inclusions (List the specific items, activities, or areas covered in this risk assessment)."
                                onFocus={clearScopeError}
                                readOnly={readOnly}
                            />

                            {!readOnly && (
                                <>
                                    {loadingScopeI ? (
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="scope-textarea-icon spin-animation"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faMagicWandSparkles}
                                            className="scope-textarea-icon"
                                            title="AI Rewrite"
                                            style={{ fontSize: "15px" }}
                                            onClick={onAiRewriteScopeInclusions}
                                        />
                                    )}

                                    <FontAwesomeIcon
                                        icon={faRotateLeft}
                                        className="scope-textarea-icon-undo"
                                        title="Undo AI Rewrite"
                                        onClick={onUndoScopeInclusions}
                                        style={{
                                            marginLeft: "8px",
                                            opacity: rewriteHistory?.scopeInclusions?.length ? 1 : 0.3,
                                            cursor: rewriteHistory?.scopeInclusions?.length ? "pointer" : "not-allowed",
                                            fontSize: "15px"
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div className="risk-popup-page-column-half-scope">
                            <label className="scope-risk-label">Scope Exclusions</label>
                            <textarea
                                spellCheck="true"
                                name="scopeExclusions"
                                className="aim-textarea-risk-scope font-fam"
                                value={formData.scopeExclusions}
                                onChange={onChange}
                                rows="5"
                                placeholder="Insert scope exclusions (List the specific items, activities, or areas not covered in this risk assessment)."
                                onFocus={clearScopeError}
                                readOnly={readOnly}
                            />

                            {!readOnly && (
                                <>
                                    {loadingScopeE ? (
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="scope-textarea-icon spin-animation"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faMagicWandSparkles}
                                            className="scope-textarea-icon"
                                            title="AI Rewrite"
                                            style={{ fontSize: "15px" }}
                                            onClick={onAiRewriteScopeExclusions}
                                        />
                                    )}

                                    <FontAwesomeIcon
                                        icon={faRotateLeft}
                                        className="scope-textarea-icon-undo"
                                        title="Undo AI Rewrite"
                                        onClick={onUndoScopeExclusions}
                                        style={{
                                            marginLeft: "8px",
                                            opacity: rewriteHistory?.scopeExclusions?.length ? 1 : 0.3,
                                            cursor: rewriteHistory?.scopeExclusions?.length ? "pointer" : "not-allowed",
                                            fontSize: "15px"
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskScopeIE;