import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../RiskAssessmentPages/RiskManagementPage.css";
import {
    faChevronDown,
    faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const OtherTeam = ({ collapsible = false, formData }) => {
    const members = formData.introInfo.members || [];
    const [collapsed, setCollapsed] = useState(true);
    const isCollapsed = collapsible ? collapsed : false;

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
    };

    // strip out empty names
    const validMembers = members
        .map((m) => m.member && m.member.trim())
        .filter((name) => Boolean(name));

    return (
        <div className="input-row-risk-create">
            <div className="input-box-aim-risk-scope">
                <h3 className="font-fam-labels">Other Team Members Involved</h3>
                {collapsible && (<button
                    className="top-right-button-ibra"
                    title={collapsed ? "Expand Section" : "Collapse Section"}
                    onClick={toggleCollapse}
                    style={{ color: "gray" }}
                    type="button"
                >
                    <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} />
                </button>)}

                {(!isCollapsed) && (
                    <div className="risk-members-group">
                        <div className="risk-execSummary-popup-page-additional-row ">
                            <div className="risk-popup-page-column-half-scope">
                                <label className="other-team__ow">
                                    This list is automatically populated based on the
                                    Responsible Person column that is filled in inside the JRA table.<br />
                                </label>

                                <label className="other-team__info">
                                    <strong>
                                        The following team members were involved in this task:
                                    </strong>
                                </label>

                                <ul className="other-team__list">
                                    {validMembers.length > 0 ? (
                                        validMembers.map((name, idx) => (
                                            <li key={idx}>{name}</li>
                                        ))
                                    ) : (
                                        <li>No other team members.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtherTeam;