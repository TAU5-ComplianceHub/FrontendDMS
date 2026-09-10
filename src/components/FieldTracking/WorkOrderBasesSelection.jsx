import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import InfoPopupWorkOrderBasesSelection from "./InfoPopupWorkOrderBasesSelection";

const WorkOrderBasesSelection = ({
    value,
    onChange,
    onFocus,
    readOnly = false,
    error = false,
    required = true,
}) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <>
            <div className={`input-box-type-risk-create ${error ? "error-create" : ""}`} style={{ position: "relative" }}>
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="top-left-button-refs"
                    style={{ color: "grey", fontSize: "20px", width: "30px", height: "30px", left: "15px", cursor: "pointer" }}
                    title="Information"
                    onClick={() => setIsInfoOpen(true)}
                />

                <h3 className="font-fam-labels">
                    Work Order Basis {required && <span className="required-field">*</span>}
                </h3>

                <div className="jra-info-popup-page-select-container">
                    <select
                        className="table-control font-fam remove-default-styling"
                        type="text"
                        name="workOrderBases"
                        value={value || ""}
                        placeholder="Select Work Order Basis"
                        onChange={onChange}
                        onFocus={onFocus}
                        readOnly={readOnly}
                        disabled={readOnly}
                    >
                        <option value="" >
                            {"Select Work Order Basis"}
                        </option>
                        <option value="siteArea" >
                            {"Area Based"}
                        </option>
                        <option value="assetBased" >
                            {"Asset Based"}
                        </option>
                        <option value="department" >
                            {"Department Based"}
                        </option>
                    </select>
                </div>
            </div>

            {isInfoOpen && (
                <InfoPopupWorkOrderBasesSelection setClose={() => setIsInfoOpen(false)} />
            )}
        </>
    );
};

export default WorkOrderBasesSelection;