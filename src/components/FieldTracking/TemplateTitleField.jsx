import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import InfoPopupTemplateTitleField from "./InfoPopupTemplateTitleField";

// Auto-generates the "templateTitle" value once every field it depends on
// has been filled in: Frequency, the field driven by Work Order Basis
// (Asset Type / Main Area / Department), and Work Order Type. Format:
// "Perform [Frequency] [Asset Type, Area, etc] [Work Order Type] Work Order Template"
//
// "Perform" is a fixed prefix, standard for every WO template (a dropdown
// may replace it here in future). "Work Order Template" is a fixed suffix.
// The middle segment depends on workOrderBasis:
//   - Asset Based WO Basis      -> assetType
//   - Area Based WO Basis       -> mainArea
//   - Department Based WO Basis -> department
//
// Nothing happens (templateTitle is left alone) until Frequency, the
// relevant basis-driven value, and Work Order Type are all present. This
// logic used to live directly in FTSCreatePageTemplate and wrote straight
// into formData.title - it now lives here and writes into
// formData.templateTitle instead. FTSCreatePageTemplate then keeps
// formData.title in sync with formData.templateTitle, so the draft name
// and the template title are always the same value.
//
// When showUI is false (the default usage on the main page), this component
// renders nothing - it only runs the effect that keeps templateTitle in
// sync. Set showUI to true if you ever want to display the computed value.
//
// descriptors is optional and defaults to []: pass an array of strings (or
// { descriptor } rows) to have them inserted right before the "Work Order
// Template" suffix. Callers that don't pass it get the exact same title as
// before.
const PERFORM_PREFIX = "Perform";
const TEMPLATE_SUFFIX = "Work Order Template";

// NOTE: matches on the WO Basis value case-insensitively by substring
// ("asset" / "area" / "department") rather than an exact string, so this
// keeps working regardless of whether WorkOrderBasesSelection's option
// values are e.g. "Asset Based", "Asset", or similar. If those option
// values change to something that no longer contains these words (e.g. a
// short code), update the matching below to match.
const getBasisDrivenValue = (workOrderBasis, assetType, mainArea, department) => {
    const normalizedBasis = (workOrderBasis || "").toLowerCase();

    if (normalizedBasis.includes("asset")) return assetType || "";
    if (normalizedBasis.includes("area")) return mainArea || "";
    if (normalizedBasis.includes("department")) return department || "";

    return "";
};

const TemplateTitleField = ({
    value,
    descriptors = [],
    frequency = "",
    workOrderBasis = "",
    assetType = "",
    mainArea = "",
    department = "",
    workOrderType = "",
    onChange,
    readOnly = false,
    error = false,
    required = true,
    showUI = true,
}) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    useEffect(() => {
        const basisValue = getBasisDrivenValue(workOrderBasis, assetType, mainArea, department);
        const requiredValues = [frequency, basisValue, workOrderType];
        const allFilled = requiredValues.every((val) => (val || "").trim() !== "");

        if (!allFilled) return;

        // Optional Work Order Descriptors (see WorkOrderDescriptorsTable),
        // passed in as an array of either plain strings or { descriptor }
        // rows so callers don't have to normalize their own formData shape
        // first. They go right before the "Work Order Template" suffix.
        const descriptorSegment = (descriptors || [])
            .map((d) => (typeof d === "string" ? d : (d && d.descriptor) || ""))
            .map((d) => d.trim())
            .filter(Boolean)
            .join(" ");

        const generatedTitle = [PERFORM_PREFIX, frequency, basisValue, workOrderType, descriptorSegment, TEMPLATE_SUFFIX]
            .filter(Boolean)
            .join(" ");

        if (generatedTitle !== value) {
            onChange && onChange(generatedTitle);
        }
    }, [frequency, workOrderBasis, assetType, mainArea, department, workOrderType, descriptors]);

    if (!showUI) {
        return null;
    }

    return (
        <div className="input-row">
            <div className={`input-box-title ${error ? "error-create" : ""}`} style={{ position: "relative" }}>
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="top-left-button-refs"
                    style={{ color: "grey", fontSize: "20px", width: "30px", height: "30px", left: "15px", cursor: "pointer" }}
                    title="Information"
                    onClick={() => setIsInfoOpen(true)}
                />

                <h3 className="font-fam-labels">
                    Work Order Title
                </h3>
                <textarea
                    spellCheck="true"
                    type="text"
                    name="templateTitle"
                    className="aim-textarea-risk-create-textarea-nopads font-fam aim-textarea-text"
                    value={value || ""}
                    placeholder="Auto-generated work order title field"
                    readOnly={true}
                    style={{ minHeight: 0, color: "grey" }}
                />
            </div>

            {isInfoOpen && (
                <InfoPopupTemplateTitleField setClose={() => setIsInfoOpen(false)} />
            )}
        </div>
    );
};

export default TemplateTitleField;