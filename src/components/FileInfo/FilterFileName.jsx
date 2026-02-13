import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import './FilterName.css';

const FilterFileName = ({ access, canIn, onHeaderClick, sortConfig, excelFilters, trashed, all = false }) => {

    // Helper to determine if we should show an icon
    const getIcon = (colId) => {
        // 1. Is there an active filter?
        const isFiltered = excelFilters[colId]?.selected?.length > 0;

        // 2. Is this column currently sorted?
        const isSorted = sortConfig.colId === colId;
        const direction = sortConfig.direction;

        // If neither, return null (No icon shown "already")
        if (!isFiltered && !isSorted) return null;

        return (
            <span style={{ marginLeft: "10px" }} className="active-filter-icon">
                {/* Show filter icon if filtered */}
                {(isFiltered || isSorted) && <FontAwesomeIcon icon={faFilter} style={{ marginRight: isSorted ? "4px" : "0" }} />}
            </span>
        );
    };

    return (
        <tr className={trashed ? 'trashed' : ""}>
            {/* Nr - No Filter/Sort */}
            <th className="doc-num-filter col">Nr</th>

            {/* Discipline */}
            <th
                className="col-dis-filter col cursor-pointer"
                onClick={(e) => onHeaderClick("discipline", e)}
            >
                <div className="fileinfo-container-filter-1">
                    <span className="fileinfo-title-filter-1 cursor-pointer">Discipline {getIcon("discipline")}</span>
                </div>
            </th>

            {/* Document Name */}
            <th
                className="col-name-filter col cursor-pointer"
                onClick={(e) => onHeaderClick("fileName", e)}
            >
                <div className="fileinfo-container-filter-1">
                    <span className="fileinfo-title-filter-1 cursor-pointer">Document Name {getIcon("fileName")}</span>
                </div>
            </th>

            {/* Document Type */}
            {all && (<th
                className="col-type-filter col cursor-pointer"
                onClick={(e) => onHeaderClick("documentType", e)}
            >
                <div className="fileinfo-container-filter-1">
                    <span className="fileinfo-title-filter-1 cursor-pointer">Document Type {getIcon("documentType")}</span>
                </div>
            </th>)}

            {/* Status */}
            {canIn(access, "DMS", ["systemAdmin", "contributor"]) && (
                <th
                    className="col-stat-filter col cursor-pointer"
                    onClick={(e) => onHeaderClick("status", e)}
                >
                    <div className="fileinfo-container-filter-1">
                        <span className="fileinfo-title-filter-1 cursor-pointer">Status {getIcon("status")}</span>
                    </div>
                </th>
            )}

            {/* Owner */}
            <th
                className={`col-own-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("owner", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter-1">
                        Owner {getIcon("owner")}
                    </span>
                </div>
            </th>

            {/* Department Head */}
            <th
                className={`col-dept-head-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("departmentHead", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter-1">
                        Department Head {getIcon("departmentHead")}
                    </span>
                </div>
            </th>

            {/* Document ID */}
            <th
                className={`col-docID-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("docID", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter">
                        Document ID {getIcon("docID")}
                    </span>
                </div>
            </th>

            {/* Review Date */}
            <th className={`col-date-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("reviewDate", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter">
                        Review Date {getIcon("reviewDate")}
                    </span>
                </div>
            </th>

            {/* Uploaded By */}
            <th
                className={`col-own-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("uploader", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter-1">
                        Uploaded By {getIcon("uploader")}
                    </span>
                </div>
            </th>

            {/* Upload Date */}
            <th className={`col-date-filter col cursor-pointer`}
                onClick={(e) => onHeaderClick("uploadDate", e)}
            >
                <div className="fileinfo-container-filter">
                    <span className="fileinfo-title-filter">
                        Upload Date {getIcon("uploadDate")}
                    </span>
                </div>
            </th>

            {canIn(access, "DMS", ["systemAdmin", "contributor"]) && (
                <th className="col-act-filter col">Action</th>
            )}
        </tr>
    );
};

export default FilterFileName;