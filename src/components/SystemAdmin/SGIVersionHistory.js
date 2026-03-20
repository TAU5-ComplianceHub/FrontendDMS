import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCircleUser,
    faDownload,
    faCaretLeft,
    faCaretRight,
    faFilter
} from "@fortawesome/free-solid-svg-icons";
import BurgerMenuFI from "../FileInfo/BurgerMenuFI";
import DownloadPopup from "../FileInfo/DownloadPopup";
import TopBar from "../Notifications/TopBar";

const SGIVersionHistory = () => {
    const [activity, setActivity] = useState([]);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [downloadFileId, setDownloadFileId] = useState(null);
    const [downloadFileName, setDownloadFileName] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const excelPopupRef = useRef(null);

    const removeFileExtension = (fileName) => fileName.replace(/\.[^/.]+$/, "");

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [filters, setFilters] = useState({});
    const [excelFilter, setExcelFilter] = useState({
        open: false,
        colId: null,
        anchorRect: null,
        pos: { top: 0, left: 0, width: 0 }
    });
    const [excelSearch, setExcelSearch] = useState("");
    const [excelSelected, setExcelSelected] = useState(new Set());

    const DEFAULT_SORT = { colId: null, direction: "asc" };
    const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);

    const BLANK = "(Blanks)";

    const getFilterValuesForCell = (row, colId) => {
        if (colId === "nr") return [String((activity.findIndex(a => a._id === row._id) || 0) + 1)];
        if (colId === "fileName") {
            const value = removeFileExtension(row.fileName || "").trim();
            return value ? [value] : [BLANK];
        }
        if (colId === "version") {
            const value = `V ${row.version || "N/A"}`.trim();
            return value ? [value] : [BLANK];
        }
        if (colId === "uploadDate") {
            const value = formatDate(row.uploadDate).trim();
            return value ? [value] : [BLANK];
        }
        if (colId === "reason") {
            const value = (row.reason || "Not Provided").trim();
            return value ? [value] : [BLANK];
        }

        const value = row?.[colId] == null ? "" : String(row[colId]).trim();
        return value === "" ? [BLANK] : [value];
    };

    const getAvailableOptions = (colId) => {
        let filtered = activity;

        for (const [filterColId, selectedValues] of Object.entries(filters)) {
            if (filterColId === colId) continue;

            const selected = Array.isArray(selectedValues) ? selectedValues : selectedValues?.selected;
            if (!Array.isArray(selected)) continue;

            filtered = filtered.filter(row => {
                const cellValues = getFilterValuesForCell(row, filterColId);
                return cellValues.some(v => selected.includes(v));
            });
        }

        return Array.from(
            new Set(filtered.flatMap(r => getFilterValuesForCell(r, colId)))
        ).sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));
    };

    const toggleSort = (colId, direction) => {
        setSortConfig(prev => {
            if (prev?.colId === colId && prev?.direction === direction) {
                return DEFAULT_SORT;
            }
            return { colId, direction };
        });
    };

    function openExcelFilterPopup(colId, e) {
        if (colId === "action") return;

        const th = e.target.closest("th");
        const rect = th.getBoundingClientRect();

        const values = getAvailableOptions(colId);
        const existing = filters[colId];
        const initialSelected = new Set(existing && Array.isArray(existing) ? existing : (existing?.selected || values));

        setExcelSelected(initialSelected);
        setExcelSearch("");

        setExcelFilter({
            open: true,
            colId,
            anchorRect: rect,
            pos: {
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(220, rect.width),
            },
        });
    }

    const filteredActivity = useMemo(() => {
        let current = [...activity];

        current = current.filter(row => {
            for (const [colId, filterObj] of Object.entries(filters)) {
                const selected = Array.isArray(filterObj)
                    ? filterObj
                    : filterObj?.selected;

                if (!Array.isArray(selected) || selected.length === 0) continue;

                const cellValues = getFilterValuesForCell(row, colId);
                const match = cellValues.some(v => selected.includes(v));
                if (!match) return false;
            }

            return true;
        });

        if (!sortConfig) {
            // default sort = newest uploadDate first
            return current.sort((a, b) => {
                const ad = new Date(a.uploadDate || 0);
                const bd = new Date(b.uploadDate || 0);
                return bd - ad;
            });
        }

        const colId = sortConfig.colId;
        const dir = sortConfig.direction === "desc" ? -1 : 1;

        const getSortValue = (row) => {
            if (colId === "fileName") return removeFileExtension(row.fileName || "");
            if (colId === "version") return row.version || "N/A";
            if (colId === "uploadDate") return formatDate(row.uploadDate);
            if (colId === "reason") return row.reason || "Not Provided";
            return row?.[colId] || "";
        };

        current.sort((a, b) => {
            const av = getSortValue(a);
            const bv = getSortValue(b);
            return String(av).localeCompare(String(bv), undefined, {
                sensitivity: "base",
                numeric: true,
            }) * dir;
        });

        return current;
    }, [activity, filters, sortConfig]);

    useEffect(() => {
        const excelSelector = '.excel-filter-popup';

        const handleClickOutside = (e) => {
            const outside =
                !e.target.closest(excelSelector) &&
                !e.target.closest('input');

            if (outside) {
                setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
            }
        };

        const handleScroll = (e) => {
            const isInsidePopup = e.target.closest(excelSelector);
            if (!isInsidePopup) {
                setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
            }

            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [excelFilter]);

    useEffect(() => {
        if (!excelFilter.open) return;
        const el = excelPopupRef.current;
        if (!el) return;

        const popupRect = el.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const margin = 8;

        let newTop = excelFilter.pos.top;
        let newLeft = excelFilter.pos.left;

        if (popupRect.bottom > viewportH - margin) {
            const anchor = excelFilter.anchorRect;
            if (anchor) {
                const desiredTop = anchor.top - popupRect.height - 4;
                newTop = Math.max(margin, desiredTop);
            }
        }

        if (popupRect.right > viewportW - margin) {
            const overflow = popupRect.right - (viewportW - margin);
            newLeft = Math.max(margin, newLeft - overflow);
        }
        if (popupRect.left < margin) newLeft = margin;

        if (newTop !== excelFilter.pos.top || newLeft !== excelFilter.pos.left) {
            setExcelFilter(prev => ({
                ...prev,
                pos: { ...prev.pos, top: newTop, left: newLeft }
            }));
        }
    }, [excelFilter.open, excelFilter.pos.top, excelFilter.pos.left, excelFilter.anchorRect, excelSearch]);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchActivity();
        }
    }, [token]);

    const openDownloadModal = (fileId, fileName) => {
        setDownloadFileId(fileId);
        setDownloadFileName(fileName);
        setIsDownloadModalOpen(true);
    };

    const closeDownloadModal = () => {
        setDownloadFileId(null);
        setDownloadFileName(null);
        setIsDownloadModalOpen(false);
    };

    const confirmDownload = () => {
        if (downloadFileId && downloadFileName) {
            downloadFile(downloadFileId, downloadFileName);
        }
        closeDownloadModal();
    };

    const downloadFile = async (fileId, fileName) => {
        try {
            setLoading(true);
            setLoadingId(fileId);

            const response = await fetch(
                `${process.env.REACT_APP_URL}/api/file/site-information-versions/download/${fileId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download the file");
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName || "Site Information Version N/A.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Error downloading the file. Please try again.");
        } finally {
            setLoading(false);
            setLoadingId(null);
        }
    };

    const fetchActivity = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${process.env.REACT_APP_URL}/api/file/site-information-versions`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch site information backups");
            }

            const data = await response.json();
            setActivity(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters = useMemo(() => {
        const hasColumnFilters = Object.keys(filters).length > 0;
        const hasSort = sortConfig?.colId !== null;
        return hasColumnFilters || hasSort;
    }, [filters, sortConfig]);

    const handleClearFilters = () => {
        setFilters({});
        setSortConfig({ colId: null, direction: "asc" });
        setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
        setExcelSearch("");
        setExcelSelected(new Set());
    };

    return (
        <div className="version-history-file-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img
                            src={`${process.env.PUBLIC_URL}/CH_Logo.svg`}
                            alt="Logo"
                            className="logo-img-um"
                            onClick={() => navigate("/FrontendDMS/home")}
                            title="Home"
                        />
                        <p className="logo-text-um">Site Information Backups</p>
                    </div>
                </div>
            )}

            {!isSidebarVisible && (
                <div className="sidebar-hidden">
                    <div className="sidebar-toggle-icon" title="Show Sidebar" onClick={() => setIsSidebarVisible(true)}>
                        <FontAwesomeIcon icon={faCaretRight} />
                    </div>
                </div>
            )}

            <div className="main-box-version-history-file">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>

                    <div className="spacer"></div>

                    {/* Container for right-aligned icons */}
                    <TopBar />
                </div>

                <div className="table-flameproof-card">
                    <div className="flameproof-table-header-label-wrapper">
                        <label className="risk-control-label">{"SGI Version History"}</label>
                        <FontAwesomeIcon
                            icon={faFilter}
                            title={hasActiveFilters ? "Filters Active (Double Click to Clear)" : "Table is filter enabled."}
                            style={{
                                cursor: hasActiveFilters ? "pointer" : "default",
                                color: hasActiveFilters ? "#002060" : "gray",
                                userSelect: "none"
                            }}
                            className="top-right-button-control-att"
                            onDoubleClick={handleClearFilters}
                        />
                    </div>
                    <div className="table-container-file-flameproof-all-assets">
                        <table className="version-history-file-info-table">
                            <thead className="version-history-file-info-head" style={{ cursor: "pointer" }} >
                                <tr>
                                    <th className="version-history-file-th" style={{ width: "5%" }} onClick={(e) => openExcelFilterPopup("nr", e)}>
                                        Nr
                                        {(filters["nr"] || sortConfig.colId === "nr") && (
                                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "10px" }} />
                                        )}
                                    </th>
                                    <th className="version-history-file-th" style={{ width: "35%" }} onClick={(e) => openExcelFilterPopup("fileName", e)}>
                                        File Name
                                        {(filters["fileName"] || sortConfig.colId === "fileName") && (
                                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "10px" }} />
                                        )}
                                    </th>
                                    <th className="version-history-file-th" style={{ width: "15%" }} onClick={(e) => openExcelFilterPopup("version", e)}>
                                        Version
                                        {(filters["version"] || sortConfig.colId === "version") && (
                                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "10px" }} />
                                        )}
                                    </th>
                                    <th className="version-history-file-th" style={{ width: "15%" }} onClick={(e) => openExcelFilterPopup("uploadDate", e)}>
                                        Date Uploaded
                                        {(filters["uploadDate"] || sortConfig.colId === "uploadDate") && (
                                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "10px" }} />
                                        )}
                                    </th>
                                    <th className="version-history-file-th" style={{ width: "25%" }} onClick={(e) => openExcelFilterPopup("reason", e)}>
                                        Reason For Change
                                        {(filters["reason"] || sortConfig.colId === "reason") && (
                                            <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "10px" }} />
                                        )}
                                    </th>
                                    <th className="version-history-file-th" style={{ width: "5%" }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActivity.length > 0 ? (
                                    filteredActivity.map((act, index) => (
                                        <tr key={act._id} className="file-info-row-height version-history-file-info-tr">
                                            <td style={{ textAlign: "center" }}>{index + 1}</td>
                                            <td style={{ textAlign: "center" }}>{removeFileExtension(act.fileName)}</td>
                                            <td style={{ textAlign: "center" }}>V {act.version || "N/A"}</td>
                                            <td style={{ textAlign: "center" }}>{formatDate(act.uploadDate)}</td>
                                            <td style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>{act.reason || "Not Provided"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    className="verion-download-button"
                                                    onClick={() => openDownloadModal(act._id, (act.fileName))}
                                                    disabled={loading && loadingId === act._id}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} title="Download" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            {loading ? "Loading version history..." : error ? error : "No Site Information Version History"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {excelFilter.open && (
                    <div
                        className="excel-filter-popup"
                        ref={excelPopupRef}
                        style={{
                            position: "fixed",
                            top: excelFilter.pos.top,
                            left: excelFilter.pos.left,
                            width: excelFilter.pos.width,
                            zIndex: 9999,
                        }}
                        onWheel={(e) => e.stopPropagation()}
                    >
                        <div className="excel-filter-sortbar">
                            <button
                                type="button"
                                className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId &&
                                    sortConfig.direction === "asc" ? "active" : ""
                                    }`}
                                onClick={() => toggleSort(excelFilter.colId, "asc")}
                            >
                                Sort A to Z
                            </button>

                            <button
                                type="button"
                                className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId &&
                                    sortConfig.direction === "desc" ? "active" : ""
                                    }`}
                                onClick={() => toggleSort(excelFilter.colId, "desc")}
                            >
                                Sort Z to A
                            </button>
                        </div>

                        <input
                            type="text"
                            className="excel-filter-search"
                            placeholder="Search"
                            value={excelSearch}
                            onChange={(e) => setExcelSearch(e.target.value)}
                        />

                        {(() => {
                            const colId = excelFilter.colId;
                            const allValues = getAvailableOptions(colId);

                            const visibleValues = allValues.filter(v =>
                                String(v).toLowerCase().includes(excelSearch.toLowerCase())
                            );

                            const isAllVisibleSelected =
                                visibleValues.length > 0 && visibleValues.every(v => excelSelected.has(v));

                            const toggleAll = (checked) => {
                                setExcelSelected(prev => {
                                    const next = new Set(prev);
                                    if (checked) {
                                        visibleValues.forEach(v => next.add(v));
                                    } else {
                                        visibleValues.forEach(v => next.delete(v));
                                    }
                                    return next;
                                });
                            };

                            const toggleValue = (v) => {
                                setExcelSelected(prev => {
                                    const next = new Set(prev);
                                    if (next.has(v)) next.delete(v);
                                    else next.add(v);
                                    return next;
                                });
                            };

                            const onOk = () => {
                                let finalSelection = new Set(excelSelected);

                                if (excelSearch.trim() !== "") {
                                    const visibleSet = new Set(visibleValues);
                                    finalSelection = new Set(
                                        Array.from(excelSelected).filter(v => visibleSet.has(v))
                                    );
                                }

                                const selectedArr = Array.from(finalSelection);

                                const isTotalReset = allValues.length > 0 &&
                                    allValues.length === selectedArr.length &&
                                    selectedArr.every(v => finalSelection.has(v));

                                setFilters(prev => {
                                    const next = { ...prev };
                                    if (isTotalReset) {
                                        delete next[colId];
                                    } else {
                                        next[colId] = selectedArr;
                                    }
                                    return next;
                                });

                                setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
                            };

                            const onCancel = () => {
                                setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
                            };

                            return (
                                <>
                                    <div className="excel-filter-list">
                                        <label className="excel-filter-item">
                                            <span className="excel-filter-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-excel-attend"
                                                    checked={isAllVisibleSelected}
                                                    onChange={(e) => toggleAll(e.target.checked)}
                                                />
                                            </span>
                                            <span className="excel-filter-text">
                                                {excelSearch === "" ? "(Select All)" : "(Select All Search Results)"}
                                            </span>
                                        </label>

                                        {visibleValues.map(v => (
                                            <label className="excel-filter-item" key={String(v)}>
                                                <span className="excel-filter-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-excel-attend"
                                                        checked={excelSelected.has(v)}
                                                        onChange={() => toggleValue(v)}
                                                    />
                                                </span>
                                                <span className="excel-filter-text">{v}</span>
                                            </label>
                                        ))}

                                        {visibleValues.length === 0 && (
                                            <div style={{ padding: "8px", color: "#888", fontStyle: "italic", fontSize: "12px" }}>
                                                No matches found
                                            </div>
                                        )}
                                    </div>

                                    <div className="excel-filter-actions">
                                        <button type="button" className="excel-filter-btn" onClick={onOk}>Apply</button>
                                        <button type="button" className="excel-filter-btn-cnc" onClick={onCancel}>Cancel</button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {isDownloadModalOpen && (
                <DownloadPopup
                    closeDownloadModal={closeDownloadModal}
                    confirmDownload={confirmDownload}
                    downloadFileName={downloadFileName}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default SGIVersionHistory;