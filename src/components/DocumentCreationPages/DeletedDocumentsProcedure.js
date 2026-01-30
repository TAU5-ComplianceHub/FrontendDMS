import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight, faTrash, faRotate, faX, faSearch, faArrowLeft, faFilter } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import "./VersionHistoryDC.css";
import TopBar from "../Notifications/TopBar";
import DeletePopup from "../FileInfo/DeletePopup";

const DeletedDocumentsProcedure = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [fileToDelete, setFileToDelete] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState();

    // --- Excel Filter State ---
    const excelPopupRef = useRef(null);
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ colId: null, direction: null });
    const [excelFilter, setExcelFilter] = useState({
        open: false,
        colId: null,
        anchorRect: null,
        pos: { top: 0, left: 0, width: 0 }
    });
    const [excelSearch, setExcelSearch] = useState("");
    const [excelSelected, setExcelSelected] = useState(new Set());
    // ---------------------------

    const navigate = useNavigate();

    const fileDelete = (id, fileName) => {
        setFileToDelete(id);
        setIsModalOpen(true);
        setSelectedFileName(fileName);
    }

    const closeModal = () => {
        setIsModalOpen(null);
    }

    const deleteFile = async () => {
        if (!fileToDelete) return;
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_URL}/api/fileGenDocs/procedure/deleteFile/${fileToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete the file');

            setFileToDelete("");
            setSelectedFileName("");
            setIsModalOpen(false);
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
        } finally {
            setLoading(false);
        }
    };

    const restoreFile = async (fileId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/fileGenDocs/procedure/restoreFile/${fileId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch files');
            fetchFiles();
        } catch (error) {
            alert('Error restoring the file. Please try again.');
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            jwtDecode(storedToken);
        }
    }, [navigate]);

    useEffect(() => {
        if (token) fetchFiles();
    }, [token]);

    const fetchFiles = async () => {
        const route = `/api/fileGenDocs/procedure/trash/getFiles`;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}${route}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            setFiles(data.files);
        } catch (error) {
            setError(error.message);
        }
    };

    const removeFileExtension = (fileName) => {
        return fileName.replace(/\.[^/.]+$/, "");
    };

    // --- Excel Logic ---

    const getFilterValuesForCell = (file, colId) => {
        let val = "";
        switch (colId) {
            case "fileName":
                val = removeFileExtension(file.formData.title);
                break;
            case "version":
                val = file.formData.version;
                break;
            case "deletedBy":
                val = file.deleter.username;
                break;
            case "dateDeleted":
                val = formatDate(file.dateDeleted);
                break;
            case "expiryDate":
                val = formatDate(file.expiryDate);
                break;
            default:
                return [];
        }
        return [String(val).trim()];
    };

    const toggleSort = (colId, direction) => {
        setSortConfig(prev => {
            if (prev?.colId === colId && prev?.direction === direction) {
                return { colId: null, direction: null };
            }
            return { colId, direction };
        });
    };

    function openExcelFilterPopup(colId, e) {
        if (colId === "nr" || colId === "action") return;

        const th = e.target.closest("th");
        const rect = th.getBoundingClientRect();

        const values = Array.from(
            new Set((files || []).flatMap(r => getFilterValuesForCell(r, colId)))
        ).sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));

        const existing = filters?.[colId]?.selected;
        const initialSelected = new Set(existing && Array.isArray(existing) ? existing : values);

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.excel-filter-popup') && !e.target.closest('th')) {
                setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
            }
        };
        if (excelFilter.open) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setExcelFilter({ open: false, colId: null, anchorRect: null, pos: {} }), true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [excelFilter.open]);

    useEffect(() => {
        if (!excelFilter.open || !excelPopupRef.current) return;
        const el = excelPopupRef.current;
        const popupRect = el.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const margin = 8;

        let newTop = excelFilter.pos.top;
        let newLeft = excelFilter.pos.left;

        if (popupRect.bottom > viewportH - margin && excelFilter.anchorRect) {
            newTop = Math.max(margin, excelFilter.anchorRect.top - popupRect.height - 4);
        }
        if (popupRect.right > viewportW - margin) {
            newLeft = Math.max(margin, newLeft - (popupRect.right - (viewportW - margin)));
        }

        if (newTop !== excelFilter.pos.top || newLeft !== excelFilter.pos.left) {
            el.style.top = `${newTop}px`;
            el.style.left = `${newLeft}px`;
        }
    }, [excelFilter.open, excelSearch, excelSelected]);

    const filteredFiles = useMemo(() => {
        let current = [...files];
        if (searchQuery) {
            current = current.filter(file => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        current = current.filter(row => {
            for (const [colId, filterObj] of Object.entries(filters)) {
                const selected = filterObj?.selected;
                if (!selected || !Array.isArray(selected)) continue;
                const cellValues = getFilterValuesForCell(row, colId);
                const match = cellValues.some(v => selected.includes(v));
                if (!match) return false;
            }
            return true;
        });

        const { colId, direction } = sortConfig;
        if (colId) {
            const dir = direction === 'desc' ? -1 : 1;
            current.sort((a, b) => {
                const valA = getFilterValuesForCell(a, colId)[0];
                const valB = getFilterValuesForCell(b, colId)[0];
                return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
            });
        } else {
            // Default Sort: Date Deleted Descending
            current.sort((a, b) => new Date(b.dateDeleted) - new Date(a.dateDeleted));
        }
        return current;
    }, [files, searchQuery, filters, sortConfig]);

    if (error) return <div>Error: {error}</div>;

    const renderTh = (colId, label, className) => (
        <th
            className={`${className} ${filters[colId] || sortConfig.colId === colId ? 'active-filter-header' : ''}`}
            onClick={(e) => openExcelFilterPopup(colId, e)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {label}
            {(filters[colId] || sortConfig.colId === colId) && (
                <FontAwesomeIcon icon={faFilter} className="active-filter-icon" style={{ marginLeft: "8px" }} />
            )}
        </th>
    );

    return (
        <div className="gen-file-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/home')} title="Home" />
                        <p className="logo-text-um">Document Development</p>
                    </div>

                    <div className="sidebar-logo-dm-fi">
                        <img src={`${process.env.PUBLIC_URL}/proceduresDMSInverted.svg`} alt="Control Attributes" className="icon-risk-rm" />
                        <p className="logo-text-dm-fi">{"Deleted Procedure Documents"}</p>
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

            <div className="main-box-gen-info">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>
                    <div className="um-input-container">
                        <input
                            className="search-input-um"
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            autoComplete="off"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery !== "" ? (<i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i>)
                            : (<i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>)}
                    </div>
                    <div className={`info-box-fih`}>Number of Documents: {filteredFiles.length}</div>
                    <div className="spacer"></div>
                    <TopBar />
                </div>
                <div className="table-flameproof-card">
                    <div className="flameproof-table-header-label-wrapper">
                        <label className="risk-control-label">{"Deleted Procedure Documents"}</label>
                    </div>
                    <div className="table-container-file-flameproof-all-assets">
                        <table className="gen-table">
                            <thead className="gen-head-del">
                                <tr>
                                    <th className="gen-th ibraGenDelNr">Nr</th>
                                    {renderTh("fileName", "Document Name", "gen-th ibraGenDelFN")}
                                    {renderTh("version", "Version", "gen-th ibraGenDelVer")}
                                    {renderTh("deletedBy", "Deleted By", "gen-th ibraGenDelDB")}
                                    {renderTh("dateDeleted", "Date Deleted", "gen-th ibraGenDelDD")}
                                    {renderTh("expiryDate", "Expiry Date", "gen-th ibraGenDelED")}
                                    <th className="gen-th ibraGenDelAct">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((file, index) => (
                                    <tr key={file._id} className={`file-info-row-height gen-tr`}>
                                        <td className="cent-values-gen gen-point">{index + 1}</td>
                                        <td className=" gen-point">
                                            <div className="popup-anchor">
                                                <span>{removeFileExtension(file.formData.title)}</span>
                                            </div>
                                        </td>
                                        <td className="cent-values-gen gen-point">{file.formData.version}</td>
                                        <td className="cent-values-gen gen-point">{file.deleter.username}</td>
                                        <td className="cent-values-gen gen-point">{formatDate(file.dateDeleted)}</td>
                                        <td className="cent-values-gen gen-point">{formatDate(file.expiryDate)}</td>
                                        <td className={"cent-values-gen trashed"}>
                                            <button
                                                className={"delete-button-fi col-but trashed-color"}
                                                onClick={() => fileDelete(file._id, file.formData.title)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} title="Delete Document" />
                                            </button>
                                            <button
                                                className={"delete-button-fi col-but-res trashed-color"}
                                                onClick={() => restoreFile(file._id)}
                                            >
                                                <FontAwesomeIcon icon={faRotate} title="Restore Document" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (<DeletePopup closeModal={closeModal} deleteFileFromTrash={deleteFile} isTrashView={true} loading={loading} selectedFileName={selectedFileName} />)}

            {/* Excel Filter Popup */}
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
                >
                    <div className="excel-filter-sortbar">
                        <button
                            type="button"
                            className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId && sortConfig.direction === "asc" ? "active" : ""}`}
                            onClick={() => toggleSort(excelFilter.colId, "asc")}
                        >
                            Sort A to Z
                        </button>
                        <button
                            type="button"
                            className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId && sortConfig.direction === "desc" ? "active" : ""}`}
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
                        const allValues = Array.from(new Set((files || []).flatMap(r => getFilterValuesForCell(r, colId))))
                            .sort((a, b) => String(a).localeCompare(String(b)));
                        const visibleValues = allValues.filter(v => String(v).toLowerCase().includes(excelSearch.toLowerCase()));
                        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every(v => excelSelected.has(v));

                        const toggleValue = (v) => {
                            setExcelSelected(prev => {
                                const next = new Set(prev);
                                if (next.has(v)) next.delete(v); else next.add(v);
                                return next;
                            });
                        };
                        const toggleAllVisible = (checked) => {
                            setExcelSelected(prev => {
                                const next = new Set(prev);
                                visibleValues.forEach(v => { if (checked) next.add(v); else next.delete(v); });
                                return next;
                            });
                        };
                        const onOk = () => {
                            const selectedArr = Array.from(excelSelected);
                            const isAllSelected = allValues.length > 0 && allValues.every(v => excelSelected.has(v));
                            setFilters(prev => {
                                const next = { ...prev };
                                if (isAllSelected) delete next[colId]; else next[colId] = { selected: selectedArr };
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
                                                checked={allVisibleSelected}
                                                onChange={(e) => toggleAllVisible(e.target.checked)}
                                            />
                                        </span>
                                        <span className="excel-filter-text">(Select All)</span>
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
        </div >
    );
};

export default DeletedDocumentsProcedure;