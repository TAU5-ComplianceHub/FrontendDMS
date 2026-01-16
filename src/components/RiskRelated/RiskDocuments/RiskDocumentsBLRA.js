import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight, faDownload, faFolderOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { faSort, faSpinner, faX, faSearch, faArrowLeft, faBell, faCircleUser, faChevronLeft, faChevronRight, faColumns, faFilter } from "@fortawesome/free-solid-svg-icons";
import BurgerMenuFI from "../../FileInfo/BurgerMenuFI";
import { jwtDecode } from 'jwt-decode';
import "./RiskDocumentsIBRA.css";
import PopupMenuPubFiles from "../../PublishedDocuments/PopupMenuPubFiles"
import TopBar from "../../Notifications/TopBar";
import DeletePopup from "../../FileInfo/DeletePopup";

const RiskDocumentsBLRA = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [hoveredFileId, setHoveredFileId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [fileToDelete, setFileToDelete] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState();

    const navigate = useNavigate();

    // --- Unified Sort Configuration ---
    const DEFAULT_SORT = { colId: "nr", direction: "asc" };
    const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);

    // --- Excel Filter States ---
    const [activeExcelFilters, setActiveExcelFilters] = useState({});
    const [excelFilter, setExcelFilter] = useState({
        open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 }
    });
    const [excelSearch, setExcelSearch] = useState("");
    const [excelSelected, setExcelSelected] = useState(new Set());
    const excelPopupRef = useRef(null);

    // ----- Horizontal Scroll Logic -----
    const scrollerRef = useRef(null);
    const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, hasDragged: false });
    const [isDraggingX, setIsDraggingX] = useState(false);
    const DRAG_THRESHOLD = 5;

    const isInteractive = (el) => !!el.closest('button, a, input, textarea, select, [role="button"], .no-drag');

    const onPointerDownX = (e) => {
        const el = scrollerRef.current;
        if (!el || isInteractive(e.target)) return;
        dragRef.current.active = true;
        dragRef.current.hasDragged = false;
        dragRef.current.startX = e.clientX;
        dragRef.current.startScrollLeft = el.scrollLeft;
    };

    const onPointerMoveX = (e) => {
        const el = scrollerRef.current;
        if (!el || !dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        if (!dragRef.current.hasDragged) {
            if (Math.abs(dx) >= DRAG_THRESHOLD) {
                dragRef.current.hasDragged = true;
                setIsDraggingX(true);
                try { el.setPointerCapture?.(e.pointerId); } catch { }
            } else return;
        }
        el.scrollLeft = dragRef.current.startScrollLeft - dx;
        e.preventDefault();
    };

    const endDragX = (e) => {
        const el = scrollerRef.current;
        if (dragRef.current.active && dragRef.current.hasDragged && e?.pointerId != null) {
            try { el?.releasePointerCapture?.(e.pointerId); } catch { }
        }
        dragRef.current.active = false;
        dragRef.current.hasDragged = false;
        setIsDraggingX(false);
    };

    const fileDelete = (id, fileName) => {
        setFileToDelete(id);
        setIsModalOpen(true);
        setSelectedFileName(fileName);
    }

    const closeModal = () => setIsModalOpen(null);

    const deleteFile = async () => {
        if (!fileToDelete) return;
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_URL}/api/fileGenDocs/blra/trashFile/${fileToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
                method: 'POST',
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

    const clearSearch = () => setSearchQuery("");

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-default';
        switch (status.toLowerCase()) {
            case 'published': return 'status-approved';
            case 'in review': return 'status-pending';
            default: return 'status-default';
        }
    };

    const getStatus = (status) => {
        if (!status) return "";
        if (status.toLowerCase() === 'published') return 'Ready for Approval';
        return status
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            const decodedToken = jwtDecode(storedToken);
            setUserID(decodedToken.userId);
        }
    }, [navigate]);

    useEffect(() => {
        if (token) fetchFiles();
    }, [token]);

    const fetchFiles = async () => {
        const route = `/api/fileGenDocs/blra/${userID}`;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}${route}`, {
                headers: { /* 'Authorization': `Bearer ${token}` */ }
            });
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            setFiles(data.files);
        } catch (error) {
            setError(error.message);
        }
    };

    const downloadFile = async (fileId, fileName) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_URL}/api/file/generatedBLRA/download/${fileId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to download the file');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert('Error downloading the file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const removeFileExtension = (fileName) => fileName.replace(/\.[^/.]+$/, "");

    // --- Excel Filtering Logic ---

    const getFilterValuesForCell = (row, colId, index) => {
        if (colId === "nr") return [String(index + 1)];
        if (colId === "name") return [removeFileExtension(row.formData.title)];
        if (colId === "version") return [String(row.formData.version)];
        if (colId === "firstPublishedBy") return [row.publisher?.username || "N/A"];
        if (colId === "firstPublishedDate") return [formatDate(row.datePublished)];
        if (colId === "lastReviewedBy") return [row.reviewer?.username || "N/A"];
        if (colId === "lastReviewDate") return [formatDate(row.dateReviewed)];
        if (colId === "status") return [getStatus(row.documentStatus)];
        const val = row[colId];
        return [val ? String(val).trim() : "N/A"];
    };

    const openExcelFilterPopup = (colId, e) => {
        if (colId === "action") return;
        const th = e.target.closest("th");
        const rect = th.getBoundingClientRect();
        const values = Array.from(new Set((files || []).flatMap((r, i) => getFilterValuesForCell(r, colId, i))))
            .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));

        const existing = activeExcelFilters[colId];
        const initialSelected = new Set(existing && Array.isArray(existing) ? existing : values);
        setExcelSelected(initialSelected);
        setExcelSearch("");
        setExcelFilter({
            open: true, colId, anchorRect: rect,
            pos: { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: Math.max(220, rect.width) }
        });
    };

    const toggleSort = (colId, direction) => {
        setSortConfig(prev => (prev?.colId === colId && prev?.direction === direction) ? DEFAULT_SORT : { colId, direction });
    };

    const processedFiles = useMemo(() => {
        let current = [...files];
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            current = current.filter(f => f.fileName.toLowerCase().includes(lowerQ));
        }
        current = current.filter((row, originalIndex) => {
            for (const [colId, selectedValues] of Object.entries(activeExcelFilters)) {
                if (!selectedValues || !Array.isArray(selectedValues)) continue;
                const cellValues = getFilterValuesForCell(row, colId, originalIndex);
                if (!cellValues.some(v => selectedValues.includes(v))) return false;
            }
            return true;
        });

        const { colId, direction } = sortConfig;
        const dir = direction === "desc" ? -1 : 1;
        if (colId !== "nr") {
            const normalize = (v) => { const s = v == null ? "" : String(v).trim(); return s === "" ? "(Blanks)" : s; };
            const tryDate = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d.getTime()) ? null : d.getTime(); }

            current.sort((a, b) => {
                let valA, valB;
                switch (colId) {
                    case "name": valA = a.formData.title; valB = b.formData.title; break;
                    case "version": valA = a.formData.version; valB = b.formData.version; break;
                    case "status": valA = getStatus(a.documentStatus); valB = getStatus(b.documentStatus); break;
                    case "firstPublishedBy": valA = a.publisher?.username; valB = b.publisher?.username; break;
                    case "firstPublishedDate": valA = a.datePublished; valB = b.datePublished; break;
                    case "lastReviewedBy": valA = a.reviewer?.username; valB = b.reviewer?.username; break;
                    case "lastReviewDate": valA = a.dateReviewed; valB = b.dateReviewed; break;
                    default: valA = a[colId]; valB = b[colId];
                }
                if (["firstPublishedDate", "lastReviewDate"].includes(colId)) {
                    const da = tryDate(valA); const db = tryDate(valB);
                    if (da !== null && db !== null) return (da - db) * dir;
                }
                if (colId === "version") return (Number(valA) - Number(valB)) * dir;
                return normalize(valA).localeCompare(normalize(valB), undefined, { numeric: true, sensitivity: 'base' }) * dir;
            });
        }
        return current;
    }, [files, searchQuery, activeExcelFilters, sortConfig]);

    const allColumns = [
        { id: "nr", title: "Nr", thClass: "gen-th ibraGenNr", tdClass: "cent-values-gen gen-point", td: (file, index) => index + 1 },
        {
            id: "name", title: "Document Name", thClass: "gen-th ibraGenFN", tdClass: "gen-point",
            onCellClick: (file) => setHoveredFileId(hoveredFileId === file._id ? null : file._id),
            td: (file) => (
                <div className="popup-anchor">
                    <span>{removeFileExtension(file.formData.title)}</span>
                    {(hoveredFileId === file._id) && (
                        <PopupMenuPubFiles file={file} isOpen={hoveredFileId === file._id} openDownloadModal={downloadFile} setHoveredFileId={setHoveredFileId} risk={true} typeDoc={"blra"} id={file._id} />
                    )}
                </div>
            )
        },
        { id: "version", title: "Version", thClass: "gen-th ibraGenVer", tdClass: "cent-values-gen gen-point", td: (file) => file.formData.version },
        { id: "status", title: "Document Status", thClass: "gen-th ibraGenStatus", tdClass: "cent-values-gen gen-point", td: (file) => getStatus(file.documentStatus) },
        { id: "firstPublishedBy", title: "First Published By", thClass: "gen-th ibraGenPB", tdClass: "cent-values-gen gen-point", td: (file) => file.publisher.username },
        { id: "firstPublishedDate", title: "First Published Date", thClass: "gen-th ibraGenPD", tdClass: "cent-values-gen gen-point", td: (file) => formatDate(file.datePublished) },
        { id: "lastReviewedBy", title: "Last Reviewed By", thClass: "gen-th ibraGenRB", tdClass: "cent-values-gen gen-point", td: (file) => file.reviewer?.username ? file.reviewer.username : "N/A" },
        { id: "lastReviewDate", title: "Last Review Date", thClass: "gen-th ibraGenRD", tdClass: "cent-values-gen gen-point", td: (file) => file.dateReviewed ? formatDate(file.dateReviewed) : "N/A" },
        {
            id: "action", title: "Action", thClass: "gen-th ibraGenType", tdClass: "cent-values-gen gen-point", td: (file) => (
                <button className={"delete-button-fi col-but"} onClick={(e) => { e.stopPropagation(); fileDelete(file._id, file.formData.title); }}>
                    <FontAwesomeIcon icon={faTrash} title="Delete Document" />
                </button>
            )
        }
    ];

    const [showColumns, setShowColumns] = useState(allColumns.map(c => c.id));
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const availableColumns = allColumns;

    const toggleColumn = (id) => { if (id !== "nr" && id !== "action") setShowColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]); };
    const toggleAllColumns = (selectAll) => setShowColumns(selectAll ? availableColumns.map(c => c.id) : ["nr", "action"]);
    const areAllSelected = () => availableColumns.every(col => showColumns.includes(col.id));
    const visibleColumns = availableColumns.filter(c => showColumns.includes(c.id));
    const isWide = visibleColumns.length > 9;

    useEffect(() => {
        if (!excelFilter.open) return;
        const close = (e) => { if (!e.target.closest('.excel-filter-popup')) setExcelFilter(p => ({ ...p, open: false })); };
        document.addEventListener('mousedown', close); window.addEventListener('scroll', close, true);
        return () => { document.removeEventListener('mousedown', close); window.removeEventListener('scroll', close, true); };
    }, [excelFilter.open]);

    // Popup positioning
    useEffect(() => {
        if (!excelFilter.open) return;
        const el = excelPopupRef.current; if (!el) return;
        const rect = el.getBoundingClientRect();
        let { top, left } = excelFilter.pos;
        if (rect.bottom > window.innerHeight - 8) top = Math.max(8, excelFilter.anchorRect.top - rect.height - 4);
        if (rect.right > window.innerWidth - 8) left = Math.max(8, left - (rect.right - (window.innerWidth - 8)));
        if (top !== excelFilter.pos.top || left !== excelFilter.pos.left) setExcelFilter(p => ({ ...p, pos: { ...p.pos, top, left } }));
    }, [excelFilter.open, excelSearch]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="gen-file-info-container">
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/home')} title="Home" />
                        <p className="logo-text-um">Risk Management</p>
                    </div>

                    <div className="button-container-create">
                        <button className="but-um" onClick={() => navigate('/FrontendDMS/deletedBLRADocs')}>
                            <div className="button-content">
                                <FontAwesomeIcon icon={faFolderOpen} className="button-logo-custom" />
                                <span className="button-text">Deleted Documents</span>
                            </div>
                        </button>
                    </div>

                    <div className="sidebar-logo-dm-fi">
                        <img src={`${process.env.PUBLIC_URL}/blra2.svg`} alt="Control Attributes" className="icon-risk-rm" />
                        <p className="logo-text-dm-fi">{"Ready for Approval BLRAs"}</p>
                    </div>
                </div>
            )}
            {!isSidebarVisible && (<div className="sidebar-hidden"><div className="sidebar-toggle-icon" title="Show Sidebar" onClick={() => setIsSidebarVisible(true)}><FontAwesomeIcon icon={faCaretRight} /></div></div>)}

            <div className="main-box-gen-info">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um"><FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" /></div>
                    <div className="um-input-container">
                        <input className="search-input-um" type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoComplete="off" />
                        {searchQuery ? <i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i> : <i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>}
                    </div>
                    <div className={`info-box-fih`}>Number of Documents: {processedFiles.length}</div>
                    <div className="spacer"></div>
                    <TopBar />
                </div>
                <div className="table-flameproof-card">
                    <div className="flameproof-table-header-label-wrapper">
                        <label className="risk-control-label">{"Ready for Approval BLRAs"}</label>
                        <FontAwesomeIcon icon={faColumns} title="Select Columns" className="top-right-button-control-att" onClick={() => setShowColumnSelector(v => !v)} />
                        {showColumnSelector && (
                            <div className="column-selector-popup" onMouseDown={(e) => e.stopPropagation()}>
                                <div className="column-selector-header"><h4>Select Columns</h4><button className="close-popup-btn" onClick={() => setShowColumnSelector(false)}>×</button></div>
                                <div className="column-selector-content">
                                    <div className="select-all-container"><label className="select-all-checkbox"><input type="checkbox" checked={areAllSelected()} onChange={(e) => toggleAllColumns(e.target.checked)} /><span className="select-all-text">Select All</span></label></div>
                                    <div className="column-checkbox-container">{availableColumns.map(col => (<div className="column-checkbox-item" key={col.id}><label><input type="checkbox" checked={showColumns.includes(col.id)} disabled={col.id === "nr" || col.id === "action"} onChange={() => toggleColumn(col.id)} /><span>{col.title}</span></label></div>))}</div>
                                    <div className="column-selector-footer"><p>{visibleColumns.length} columns selected</p><button className="apply-columns-btn" onClick={() => setShowColumnSelector(false)}>Apply</button></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="table-container-file-flameproof-all-assets">
                        <div className={`limit-table-height-visitor-wrap ${isDraggingX ? 'dragging' : ''} ${isWide ? 'wide' : ''}`} ref={scrollerRef} onPointerDown={onPointerDownX} onPointerMove={onPointerMoveX} onPointerUp={endDragX} onPointerLeave={endDragX} onDragStart={(e) => e.preventDefault()} style={{ maxHeight: "calc(100% - 0px)", height: "100%" }}>
                            <table className={`limit-table-height-visitor ${isWide ? 'wide' : ''}`} style={{ height: "0" }}>
                                <thead className="gen-head">
                                    <tr>
                                        {visibleColumns.map(col => {
                                            const active = activeExcelFilters[col.id] || (sortConfig.colId === col.id && col.id !== "nr");
                                            return (
                                                <th key={col.id} className={col.thClass} onClick={(e) => openExcelFilterPopup(col.id, e)} style={{ cursor: col.id === "action" ? "default" : "pointer" }}>
                                                    {col.title} {active && <FontAwesomeIcon icon={faFilter} className="th-filter-icon" style={{ marginLeft: "8px", opacity: 0.8 }} />}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedFiles.length === 0 ? <tr><td colSpan={visibleColumns.length} className="cent-values-gen">No documents found.</td></tr> : processedFiles.map((file, index) => (
                                        <tr key={file._id} className="file-info-row-height gen-tr">
                                            {visibleColumns.map(col => {
                                                const statusVal = col.id === "status" ? getStatus(file.documentStatus) : null;
                                                return <td key={`${file._id}-${col.id}`} className={`${col.tdClass} ${statusVal ? getStatusClass(file.documentStatus) : ""}`} onClick={col.onCellClick ? () => col.onCellClick(file) : undefined}>{col.td(file, index)}</td>
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {excelFilter.open && (
                <div className="excel-filter-popup" ref={excelPopupRef} style={{ position: "fixed", top: excelFilter.pos.top, left: excelFilter.pos.left, width: excelFilter.pos.width, zIndex: 9999 }} onWheel={(e) => e.stopPropagation()}>
                    <div className="excel-filter-sortbar">
                        <button className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId && sortConfig.direction === "asc" ? "active" : ""}`} onClick={() => toggleSort(excelFilter.colId, "asc")}>Sort A to Z</button>
                        <button className={`excel-sort-btn ${sortConfig.colId === excelFilter.colId && sortConfig.direction === "desc" ? "active" : ""}`} onClick={() => toggleSort(excelFilter.colId, "desc")}>Sort Z to A</button>
                    </div>
                    <input type="text" className="excel-filter-search" placeholder="Search" value={excelSearch} onChange={(e) => setExcelSearch(e.target.value)} />
                    <div className="excel-filter-list">
                        <label className="excel-filter-item"><span className="excel-filter-checkbox"><input type="checkbox" className="checkbox-excel-attend" checked={Array.from(new Set((files || []).flatMap((r, i) => getFilterValuesForCell(r, excelFilter.colId, i)))).filter(v => String(v).toLowerCase().includes(excelSearch.toLowerCase())).every(v => excelSelected.has(v))} onChange={(e) => { const visible = Array.from(new Set((files || []).flatMap((r, i) => getFilterValuesForCell(r, excelFilter.colId, i)))).filter(v => String(v).toLowerCase().includes(excelSearch.toLowerCase())); setExcelSelected(prev => { const next = new Set(prev); visible.forEach(v => { if (e.target.checked) next.add(v); else next.delete(v); }); return next; }); }} /></span><span className="excel-filter-text">(Select All)</span></label>
                        {Array.from(new Set((files || []).flatMap((r, i) => getFilterValuesForCell(r, excelFilter.colId, i)))).sort().filter(v => String(v).toLowerCase().includes(excelSearch.toLowerCase())).map(v => (
                            <label className="excel-filter-item" key={String(v)}><span className="excel-filter-checkbox"><input type="checkbox" className="checkbox-excel-attend" checked={excelSelected.has(v)} onChange={() => setExcelSelected(prev => { const next = new Set(prev); if (next.has(v)) next.delete(v); else next.add(v); return next; })} /></span><span className="excel-filter-text">{v}</span></label>
                        ))}
                    </div>
                    <div className="excel-filter-actions">
                        <button type="button" className="excel-filter-btn" onClick={() => { const all = Array.from(new Set((files || []).flatMap((r, i) => getFilterValuesForCell(r, excelFilter.colId, i)))); const isAll = all.every(v => excelSelected.has(v)); setActiveExcelFilters(p => { const n = { ...p }; if (isAll) delete n[excelFilter.colId]; else n[excelFilter.colId] = Array.from(excelSelected); return n; }); setExcelFilter(p => ({ ...p, open: false })); }}>Apply</button>
                        <button type="button" className="excel-filter-btn-cnc" onClick={() => setExcelFilter(p => ({ ...p, open: false }))}>Cancel</button>
                    </div>
                </div>
            )}

            {isModalOpen && (<DeletePopup closeModal={closeModal} deleteFile={deleteFile} isTrashView={false} loading={loading} selectedFileName={selectedFileName} />)}
        </div >
    );
};

export default RiskDocumentsBLRA;