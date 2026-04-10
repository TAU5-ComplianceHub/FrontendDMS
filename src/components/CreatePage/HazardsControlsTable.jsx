import React, { useMemo, useState } from "react";
import "./ReferenceTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faTrash
} from "@fortawesome/free-solid-svg-icons";

const HazardsControlsTable = ({
    collapsible = false,
    defaultCollapsed = true,
    hazardControlRows = [],
    addHazardControlRow,
    removeHazardControlRow,
    updateHazardControlRow,
    updateHazardControlRows,
    readOnly = false,
    required = false
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const isCollapsed = collapsible ? collapsed : false;

    const toggleCollapse = () => {
        setCollapsed((prev) => !prev);
    };

    const normalize = (value) => String(value || "").trim();

    const sortedRows = useMemo(() => {
        return [...hazardControlRows]
            .map((row, index) => ({
                ...row,
                __originalIndex: index,
                hazard: normalize(row.hazard),
                unwantedEvent: normalize(row.unwantedEvent),
                control: normalize(row.control)
            }))
            .sort((a, b) => {
                const hazardCompare = a.hazard.localeCompare(b.hazard, undefined, {
                    sensitivity: "base",
                    numeric: true
                });
                if (hazardCompare !== 0) return hazardCompare;

                const ueCompare = a.unwantedEvent.localeCompare(b.unwantedEvent, undefined, {
                    sensitivity: "base",
                    numeric: true
                });
                if (ueCompare !== 0) return ueCompare;

                return a.control.localeCompare(b.control, undefined, {
                    sensitivity: "base",
                    numeric: true
                });
            });
    }, [hazardControlRows]);

    const groupedRows = useMemo(() => {
        const hazardMap = new Map();

        sortedRows.forEach((row) => {
            const hazardKey = row.hazard || "";
            const ueKey = row.unwantedEvent || "";

            if (!hazardMap.has(hazardKey)) {
                hazardMap.set(hazardKey, {
                    hazard: hazardKey,
                    totalRows: 0,
                    unwantedEvents: new Map()
                });
            }

            const hazardGroup = hazardMap.get(hazardKey);

            if (!hazardGroup.unwantedEvents.has(ueKey)) {
                hazardGroup.unwantedEvents.set(ueKey, {
                    unwantedEvent: ueKey,
                    rows: []
                });
            }

            hazardGroup.unwantedEvents.get(ueKey).rows.push(row);
            hazardGroup.totalRows += 1;
        });

        return Array.from(hazardMap.values()).map((hazardGroup) => ({
            ...hazardGroup,
            unwantedEvents: Array.from(hazardGroup.unwantedEvents.values()).map((ueGroup) => ({
                ...ueGroup,
                rowSpan: ueGroup.rows.length
            }))
        }));
    }, [sortedRows]);

    return (
        <div className="input-row">
            <div className="input-box-ref">
                <h3 className="font-fam-labels">
                    Hazards and Controls <span className="required-field">{required ? "*" : ""}</span>
                </h3>

                {collapsible && (
                    <button
                        className="top-right-button-ibra"
                        title={collapsed ? "Expand Section" : "Collapse Section"}
                        onClick={toggleCollapse}
                        style={{ color: "gray" }}
                        type="button"
                    >
                        <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} />
                    </button>
                )}

                {!isCollapsed && (
                    <table className="vcr-table table-borders">
                        <thead className="cp-table-header">
                            <tr>
                                <th className="refColCen refRef" style={{ width: "15%" }}>Hazard</th>
                                <th className="refColCen refRef" style={{ width: "15%" }}>Unwanted Event</th>
                                <th className="refColCen refRef" style={{ width: "65%" }}>Control</th>
                                <th className="refColCen refBut" style={{ width: "5%" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hazardControlRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            textAlign: "center",
                                            fontSize: "14px",
                                            padding: "12px"
                                        }}
                                    >
                                        No information available
                                    </td>
                                </tr>
                            ) : (
                                groupedRows.map((hazardGroup) =>
                                    hazardGroup.unwantedEvents.map((ueGroup, ueIndex) =>
                                        ueGroup.rows.map((row, rowIndex) => {
                                            const isFirstHazardRow = ueIndex === 0 && rowIndex === 0;
                                            const isFirstUERow = rowIndex === 0;

                                            return (
                                                <tr key={`${row.__originalIndex}-${row.hazard}-${row.unwantedEvent}-${row.control}`}>
                                                    {isFirstHazardRow && (
                                                        <td
                                                            rowSpan={hazardGroup.totalRows}
                                                            style={{ verticalAlign: "middle", fontSize: "14px" }}
                                                        >
                                                            {row.hazard}
                                                        </td>
                                                    )}

                                                    {isFirstUERow && (
                                                        <td
                                                            rowSpan={ueGroup.rowSpan}
                                                            style={{ verticalAlign: "middle", fontSize: "14px" }}
                                                        >
                                                            {row.unwantedEvent}
                                                        </td>
                                                    )}

                                                    <td style={{ fontSize: "14px" }}>
                                                        {row.control}
                                                    </td>

                                                    <td className="procCent action-cell-auth-risk">
                                                        {!readOnly && (
                                                            <button
                                                                className="remove-row-button"
                                                                onClick={() => removeHazardControlRow(row.__originalIndex)}
                                                                title="Remove Control"
                                                                type="button"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default HazardsControlsTable;