import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const AdminApprovalHeader = ({ filters, sortConfig, openExcelFilterPopup }) => {

    // Map of columns with your exact original classes and alignments
    const columns = [
        { id: "type", title: "Type", align: "left", className: "risk-admin-approve-th-type col-name-filter col" },
        { id: "item", title: "Item", align: "left", className: "risk-admin-approve-th-item col-stat-filter col" },
        { id: "description", title: "Description", align: "left", className: "col risk-admin-approve-th-desc col-stat-filter col" },
        { id: "suggestedBy", title: "Suggested By", align: "left", className: "risk-admin-approve-th-user col-own-filter col" },
        { id: "suggestedDate", title: "Suggested Date", align: "center", className: "risk-admin-approve-th-date col-date-filter col" },
        { id: "status", title: "Status", align: "center", className: "risk-admin-approve-th-status col-stat-filter col" },
        { id: "reviewDate", title: "Review Date", align: "center", className: "risk-admin-approve-th-date col-date-filter col" }
    ];

    return (
        <tr>
            {/* Nr — no filter */}
            <th style={{ textAlign: "left", cursor: "default" }} className="risk-admin-approve-th-index doc-num-filter col">Nr</th>

            {columns.map((col) => {
                // Check if this column is currently being filtered or sorted
                const isActive = filters[col.id] || (sortConfig && sortConfig.colId === col.id);

                return (
                    <th
                        key={col.id}
                        style={{ textAlign: col.align, cursor: "pointer", position: "relative" }}
                        className={`${col.className}`}
                        onClick={(e) => openExcelFilterPopup(col.id, e)}
                    >
                        {col.title}
                        {isActive && (
                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "5px" }} />
                        )}
                    </th>
                );
            })}
        </tr>
    );
};

export default AdminApprovalHeader;