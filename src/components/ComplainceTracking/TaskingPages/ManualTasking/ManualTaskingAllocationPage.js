import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faCircleUser, faChevronLeft, faChevronRight, faSearch, faEraser, faTimes, faDownload, faCaretLeft, faCaretRight, faTableColumns, faArrowsLeftRight, faArrowsRotate, faFolderOpen, faCirclePlus, faEdit, faFilter, faSort, faFile, faSave, faCheck, faX, faCalendarAlt, faClock, faClockRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from 'jwt-decode';
import { saveAs } from "file-saver";
import TopBar from "../../../Notifications/TopBar";
import { canIn, getCurrentUser } from "../../../../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import AddTaskPopup from "./AddTaskPopup";

const ManualTaskingAllocationPage = () => {
    const [tasks, setTasks] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const access = getCurrentUser();
    const scrollerRef = useRef(null);
    const tbodyRef = useRef(null);
    const DRAG_THRESHOLD_PX = 6;
    const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusTab, setStatusTab] = useState("All");
    const DEFAULT_SORT = { colId: null, direction: "asc" };
    const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);
    const [activeExcelFilters, setActiveExcelFilters] = useState({});
    const [excelFilter, setExcelFilter] = useState({
        open: false,
        colId: null,
        anchorRect: null,
        pos: { top: 0, left: 0, width: 0 }
    });
    const [excelSearch, setExcelSearch] = useState("");
    const [excelSelected, setExcelSelected] = useState(new Set());
    const excelPopupRef = useRef(null);
    const [activeControlMenuId, setActiveControlMenuId] = useState(null);
    const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);

    const handleOpenAddTaskPopup = () => {
        setShowAddTaskPopup(true);
    };

    const handleCloseAddTaskPopup = () => {
        setShowAddTaskPopup(false);
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const onNativeDragStart = (e) => {
        e.preventDefault();
    };

    const STATUS_OPTIONS = [
        { value: "25% Completed", color: "#FFC000" },
        { value: "50% Completed", color: "#FFFF00" },
        { value: "75% Completed", color: "#FFFFCC" },
        { value: "Completed", color: "#7EAC87" },
    ];

    const getStatusColor = (status) => {
        const match = STATUS_OPTIONS.find(option => option.value === status);
        return match ? match.color : "transparent";
    };

    const getStatusTextColor = (status) => {
        if (status === "Completed") return "#FFFFFF"; // white
        return "#000000"; // black for 25%–75%
    };

    const onRowPointerDown = (e) => {
        if (
            e.target.closest(".rca-action-btn") ||
            e.target.closest(".risk-control-attributes-action-cell") ||
            e.target.closest(".category-input-container") ||
            e.target.closest(".control-popup-menu") ||
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest("input") ||
            e.target.closest("textarea") ||
            e.target.closest("select")
        ) {
            return;
        }

        const tr = e.target.closest("tr");
        if (!tr) return;

        const scroller = scrollerRef.current;
        if (!scroller) return;

        drag.current.active = true;
        drag.current.moved = false;
        drag.current.startX = e.clientX;
        drag.current.startLeft = scroller.scrollLeft;

        tr.setPointerCapture?.(e.pointerId);
    };

    const onRowPointerMove = (e) => {
        if (!drag.current.active) return;

        const scroller = scrollerRef.current;
        if (!scroller) return;

        const dx = e.clientX - drag.current.startX;

        // Don't treat it as a drag until user moves enough
        if (!drag.current.moved) {
            if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;

            drag.current.moved = true;
            scroller.classList.add("dragging");
        }

        scroller.scrollLeft = drag.current.startLeft - dx;
        e.preventDefault();
    };

    const endRowDrag = (e) => {
        if (!drag.current.active) return;

        drag.current.active = false;
        scrollerRef.current?.classList.remove("dragging");

        const tr = e.target.closest("tr");
        tr?.releasePointerCapture?.(e.pointerId);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            const decodedToken = jwtDecode(storedToken);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // 🔹 Fake data instead of API call
            const fakeData = {
                tasks: [
                    {
                        _id: "1",
                        taskDescription: "Review monthly compliance report",
                        responsible: "John Smith",
                        allocatedDate: "2026-04-01",
                        dueDate: "2026-04-08",
                        completionDate: "",
                        status: "25% Completed",
                        comments: "Focus on section A",
                        attachments: ["Report.pdf"],
                        userAttachments: ["User Report.pdf"],
                        closeStatus: false,
                    },
                    {
                        _id: "2",
                        taskDescription: "Submit training attendance",
                        responsible: "Sarah Williams",
                        allocatedDate: "2026-04-02",
                        dueDate: "2026-04-10",
                        completionDate: "2026-04-09",
                        status: "50% Completed",
                        comments: "Include signed sheet",
                        attachments: ["Attendance.xlsx"],
                        userAttachments: ["User Report.pdf"],
                        closeStatus: true,
                    },
                    {
                        _id: "3",
                        taskDescription: "Prepare incident summary",
                        responsible: "Michael Brown",
                        allocatedDate: "2026-04-03",
                        dueDate: "2026-04-12",
                        completionDate: "",
                        status: "75% Completed",
                        comments: "Add all incidents",
                        attachments: [],
                        userAttachments: ["User Report.pdf"],
                        closeStatus: false,
                    },
                    {
                        _id: "4",
                        taskDescription: "Verify emergency contacts",
                        responsible: "Lisa Johnson",
                        allocatedDate: "2026-04-04",
                        dueDate: "2026-04-15",
                        completionDate: "",
                        status: "Completed",
                        comments: "Cross-check numbers",
                        attachments: ["Contacts.csv"],
                        userAttachments: ["User Report.pdf"],
                        closeStatus: false,
                    },
                ],
            };

            // 🔹 Keep your sorting pattern (but updated to taskDescription)
            const sortedTasks = fakeData.tasks.sort((a, b) =>
                a.taskDescription.localeCompare(b.taskDescription, undefined, {
                    sensitivity: "base",
                })
            );

            // 🔹 IMPORTANT: use your correct setter
            setTasks(sortedTasks);

        } catch (error) {
        }
    };

    const getFilterValuesForCell = (row, colId, index) => {
        if (colId === "nr") return [String(index + 1)];
        if (colId === "status") return [row.status ? String(row.status).trim() : "-"];
        if (colId === "closeStatus") return [row.closeStatus ? "Yes" : "No"];
        if (colId === "attachments") {
            return [Array.isArray(row.attachments) && row.attachments.length > 0 ? "Has Attachments" : "No Attachments"];
        }
        if (colId === "userAttachments") {
            return [Array.isArray(row.userAttachments) && row.userAttachments.length > 0 ? "Has Attachments" : "No Attachments"];
        }

        const val = row[colId];
        return [val ? String(val).trim() : "-"];
    };

    const getAvailableOptions = (colId) => {
        let filtered = [...tasks];

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.taskDescription || "").toLowerCase().includes(lowerQ)
            );
        }

        if (statusTab === "General") {
            filtered = filtered.filter(row =>
                String(row.status || "").trim().toLowerCase() === "general"
            );
        } else if (statusTab === "Specialised") {
            filtered = filtered.filter(row => {
                const status = String(row.status || "").trim().toLowerCase();
                return status !== "general";
            });
        }

        for (const [filterColId, selectedValues] of Object.entries(activeExcelFilters)) {
            if (filterColId === colId) continue;
            if (!selectedValues || !Array.isArray(selectedValues)) continue;

            filtered = filtered.filter((row, index) => {
                const cellValues = getFilterValuesForCell(row, filterColId, index);
                return cellValues.some(v => selectedValues.includes(v));
            });
        }

        const uniqueValues = Array.from(
            new Set(filtered.flatMap((r, i) => getFilterValuesForCell(r, colId, i)))
        ).sort((a, b) =>
            String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
        );

        return uniqueValues;
    };

    const openExcelFilterPopup = (colId, e) => {
        if (colId === "action") return;

        const th = e.target.closest("th");
        const rect = th.getBoundingClientRect();
        const values = getAvailableOptions(colId);
        const existing = activeExcelFilters[colId];
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
    };

    const toggleSort = (colId, direction) => {
        setSortConfig(prev => {
            if (prev?.colId === colId && prev?.direction === direction) {
                return DEFAULT_SORT;
            }
            return { colId, direction };
        });
    };

    const processedTasks = useMemo(() => {
        let current = [...tasks];

        // 1. Global Search
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            current = current.filter(c =>
                (c.taskDescription || "").toLowerCase().includes(lowerQ)
            );
        }

        current = current.filter((row, originalIndex) => {
            for (const [colId, selectedValues] of Object.entries(activeExcelFilters)) {
                if (!selectedValues || !Array.isArray(selectedValues)) continue;

                const cellValues = getFilterValuesForCell(row, colId, originalIndex);
                const match = cellValues.some(v => selectedValues.includes(v));
                if (!match) return false;
            }
            return true;
        });

        if (statusTab === "General") {
            current = current.filter(row =>
                String(row.status || "").trim().toLowerCase() === "general"
            );
        } else if (statusTab === "Specialised") {
            current = current.filter(row => {
                const status = String(row.status || "").trim().toLowerCase();
                return status !== "general";
            });
        }

        const normalize = (v) => {
            const s = v == null ? "" : String(v).trim();
            return s === "" ? "(Blanks)" : s;
        };

        const compareText = (a, b) =>
            String(a).localeCompare(String(b), undefined, {
                numeric: true,
                sensitivity: "base"
            });

        current.sort((a, b) => {
            const parseDateValue = (value) => {
                if (!value || value === "(Blanks)") return null;
                const d = new Date(value);
                return Number.isNaN(d.getTime()) ? null : d.getTime();
            };

            // Default sort: Due Date ascending
            if (!sortConfig?.colId) {
                const dueA = parseDateValue(a?.dueDate);
                const dueB = parseDateValue(b?.dueDate);

                if (dueA === null && dueB !== null) return 1;
                if (dueA !== null && dueB === null) return -1;

                if (dueA !== null && dueB !== null) {
                    const dateResult = dueA - dueB;
                    if (dateResult !== 0) return dateResult;
                }

                const taskA = normalize(a?.taskDescription);
                const taskB = normalize(b?.taskDescription);

                if (taskA === "(Blanks)" && taskB !== "(Blanks)") return 1;
                if (taskA !== "(Blanks)" && taskB === "(Blanks)") return -1;

                return compareText(taskA, taskB);
            }

            const { colId, direction } = sortConfig;
            const dir = direction === "desc" ? -1 : 1;

            let valA;
            let valB;

            // Date columns should sort as real dates, not text
            if (["allocatedDate", "dueDate", "completionDate"].includes(colId)) {
                valA = parseDateValue(a?.[colId]);
                valB = parseDateValue(b?.[colId]);

                if (valA === null && valB !== null) return 1;
                if (valA !== null && valB === null) return -1;

                if (valA !== null && valB !== null) {
                    const dateResult = (valA - valB) * dir;
                    if (dateResult !== 0) return dateResult;
                }
            } else {
                valA = normalize(a?.[colId]);
                valB = normalize(b?.[colId]);

                if (valA === "(Blanks)" && valB !== "(Blanks)") return 1;
                if (valA !== "(Blanks)" && valB === "(Blanks)") return -1;

                const mainResult = compareText(valA, valB) * dir;
                if (mainResult !== 0) return mainResult;
            }

            // Tie-breaker: always fall back to due date first
            const dueA = parseDateValue(a?.dueDate);
            const dueB = parseDateValue(b?.dueDate);

            if (dueA === null && dueB !== null) return 1;
            if (dueA !== null && dueB === null) return -1;

            if (dueA !== null && dueB !== null) {
                const dueResult = dueA - dueB;
                if (dueResult !== 0) return dueResult;
            }

            // Final tie-breaker
            const taskA = normalize(a?.taskDescription);
            const taskB = normalize(b?.taskDescription);

            if (taskA === "(Blanks)" && taskB !== "(Blanks)") return 1;
            if (taskA !== "(Blanks)" && taskB === "(Blanks)") return -1;

            return compareText(taskA, taskB);
        });

        return current;
    }, [tasks, searchQuery, activeExcelFilters, statusTab, sortConfig]);

    const availableColumns = [
        { id: "nr", title: "Nr" },
        { id: "taskDescription", title: "Task Description" },
        { id: "responsible", title: "Responsible Person" },
        { id: "allocatedDate", title: "Allocated Date" },
        { id: "dueDate", title: "Due Date" },
        { id: "completionDate", title: "Completion Date" },
        { id: "status", title: "Status" },
        { id: "comments", title: "Comments / Notes" },
        { id: "attachments", title: "Attachments" },
        { id: "userAttachments", title: "User Attachments" },
        { id: "closeStatus", title: "Task Closeout Status" },
        { id: "action", title: "Action" },
    ];

    const [showColumns, setShowColumns] = useState([
        "nr",
        "taskDescription",
        "responsible",
        "allocatedDate",
        "dueDate",
        "completionDate",
        "status",
        "comments",
        "attachments",
        "userAttachments",
        "closeStatus",
        "action",
    ]);

    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const allColumnIds = availableColumns.map(c => c.id);

    const toggleColumn = (columnId) => {
        if (columnId === "nr") return;
        if (columnId === "action") return;

        setShowColumns(prev => {
            if (prev.includes(columnId)) {
                return prev.filter(id => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const toggleAllColumns = (selectAll) => {
        if (selectAll) {
            setShowColumns(allColumnIds);
        } else {
            setShowColumns(["nr", "action"]);
        }
    };

    const areAllColumnsSelected = () => {
        return allColumnIds.every(id => showColumns.includes(id));
    };

    useEffect(() => {
        if (!showColumnSelector) return;

        const handleClickOutside = (e) => {
            if (
                !e.target.closest('.column-selector-popup') &&
                !e.target.closest('.top-right-button-control-att-3')
            ) {
                setShowColumnSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showColumnSelector]);

    const [columnWidths, setColumnWidths] = useState({
        nr: 60,
        taskDescription: 320,
        responsible: 220,
        allocatedDate: 150,
        dueDate: 150,
        completionDate: 170,
        status: 140,
        comments: 300,
        attachments: 220,
        userAttachments: 220,
        closeStatus: 180,
        action: 80,
    });

    const [initialColumnWidths] = useState({
        nr: 60,
        taskDescription: 320,
        responsible: 220,
        allocatedDate: 150,
        dueDate: 150,
        completionDate: 170,
        status: 140,
        comments: 300,
        attachments: 220,
        userAttachments: 220,
        closeStatus: 180,
        action: 80,
    });

    const columnSizeLimits = {
        nr: { min: 60, max: 60 },
        taskDescription: { min: 220, max: 800 },
        responsible: { min: 180, max: 400 },
        allocatedDate: { min: 130, max: 260 },
        dueDate: { min: 130, max: 260 },
        completionDate: { min: 140, max: 260 },
        status: { min: 120, max: 240 },
        comments: { min: 200, max: 700 },
        attachments: { min: 180, max: 420 },
        userAttachments: { min: 180, max: 420 },
        closeStatus: { min: 160, max: 260 },
        action: { min: 80, max: 80 },
    };

    const [tableWidth, setTableWidth] = useState(null);
    const [wrapperWidth, setWrapperWidth] = useState(0);
    const [hasFittedOnce, setHasFittedOnce] = useState(false);
    const widthsInitializedRef = useRef(false);
    const isResizingRef = useRef(false);
    const resizingColRef = useRef(null);
    const resizeStartXRef = useRef(0);
    const resizeStartWidthRef = useRef(0);

    const getDisplayColumns = () => showColumns;

    const startColumnResize = (e, columnId) => {
        e.preventDefault();
        e.stopPropagation();

        isResizingRef.current = true;
        resizingColRef.current = columnId;
        resizeStartXRef.current = e.clientX;

        const th = e.target.closest('th');
        const currentWidth =
            columnWidths[columnId] ??
            (th ? th.getBoundingClientRect().width : 150);

        resizeStartWidthRef.current = currentWidth;

        document.addEventListener('mousemove', handleColumnResizeMove);
        document.addEventListener('mouseup', stopColumnResize);
    };

    const handleColumnResizeMove = (e) => {
        const colId = resizingColRef.current;
        if (!colId) return;

        const deltaX = e.clientX - resizeStartXRef.current;
        let newWidth = resizeStartWidthRef.current + deltaX;

        const limits = columnSizeLimits[colId];
        if (limits) {
            if (limits.min != null) newWidth = Math.max(limits.min, newWidth);
            if (limits.max != null) newWidth = Math.min(limits.max, newWidth);
        }

        setColumnWidths(prev => {
            const updated = { ...prev, [colId]: newWidth };
            const visibleCols = getDisplayColumns().filter(
                id => typeof updated[id] === "number"
            );
            const totalWidth = visibleCols.reduce(
                (sum, id) => sum + (updated[id] || 0),
                0
            );
            setTableWidth(totalWidth);
            return updated;
        });
    };

    const stopColumnResize = () => {
        document.removeEventListener('mousemove', handleColumnResizeMove);
        document.removeEventListener('mouseup', stopColumnResize);

        setTimeout(() => {
            isResizingRef.current = false;
        }, 0);

        resizingColRef.current = null;
    };

    useEffect(() => {
        if (widthsInitializedRef.current) return;
        if (!scrollerRef.current) return;

        const wrapperEl = scrollerRef.current;
        const wWidth = wrapperEl.clientWidth;
        if (!wWidth) return;

        const displayColumns = getDisplayColumns();

        const totalWidth = displayColumns.reduce((sum, colId) => {
            const w = columnWidths[colId];
            return sum + (typeof w === "number" ? w : 0);
        }, 0);

        if (!totalWidth) return;

        const factor = wWidth / totalWidth;

        setColumnWidths(prev => {
            const updated = { ...prev };
            displayColumns.forEach(colId => {
                const w = prev[colId];
                if (typeof w === "number") {
                    updated[colId] = Math.round(w * factor);
                }
            });
            return updated;
        });

        setWrapperWidth(wrapperEl.getBoundingClientRect().width);
        setTableWidth(wWidth);
        setHasFittedOnce(true);

        widthsInitializedRef.current = true;
    }, [showColumns, columnWidths]);

    const fitTableToWidth = () => {
        const wrapper = scrollerRef.current;
        if (!wrapper) return;

        const wrapperWidth = wrapper.getBoundingClientRect().width;
        if (!wrapperWidth) return;

        const visibleCols = getDisplayColumns().filter(
            id => typeof columnWidths[id] === "number"
        );
        if (!visibleCols.length) return;

        const prevWidths = visibleCols.map(id => columnWidths[id]);
        const totalWidth = prevWidths.reduce((a, b) => a + b, 0);

        if (totalWidth >= wrapperWidth) {
            setTableWidth(totalWidth);
            return;
        }

        const scale = wrapperWidth / totalWidth;
        let newWidths = prevWidths.map(w => w * scale);
        newWidths = newWidths.map(w => Math.round(w));

        let diff = wrapperWidth - newWidths.reduce((s, w) => s + w, 0);
        let i = 0;
        while (diff !== 0 && i < newWidths.length * 2) {
            newWidths[i % newWidths.length] += diff > 0 ? 1 : -1;
            diff = wrapperWidth - newWidths.reduce((s, w) => s + w, 0);
            i++;
        }

        setColumnWidths(prev => {
            const updated = { ...prev };
            visibleCols.forEach((id, index) => {
                updated[id] = newWidths[index];
            });
            return updated;
        });

        setTableWidth(wrapperWidth);
        setWrapperWidth(wrapperWidth);
    };

    const resetColumnWidths = () => {
        const wrapper = scrollerRef.current;
        if (!wrapper) return;

        const wrapperWidth = wrapper.getBoundingClientRect().width;
        if (!wrapperWidth) return;

        const defaultColumns = [
            "nr",
            "taskDescription",
            "responsible",
            "allocatedDate",
            "dueDate",
            "completionDate",
            "status",
            "comments",
            "attachments",
            "userAttachments",
            "closeStatus",
            "action",
        ];

        setShowColumns(defaultColumns);

        const visibleCols = defaultColumns.filter(
            id => typeof initialColumnWidths[id] === "number"
        );
        if (!visibleCols.length) return;

        const prevWidths = visibleCols.map(id => initialColumnWidths[id]);
        const totalWidth = prevWidths.reduce((a, b) => a + b, 0);
        if (!totalWidth) return;

        const scale = wrapperWidth / totalWidth;
        let newWidths = prevWidths.map(w => Math.round(w * scale));

        let diff = wrapperWidth - newWidths.reduce((s, w) => s + w, 0);
        let i = 0;

        while (diff !== 0 && i < newWidths.length * 10) {
            const idx = i % newWidths.length;
            const colId = visibleCols[idx];
            const limits = columnSizeLimits[colId] || {};

            if (diff > 0) {
                if (limits.max == null || newWidths[idx] < limits.max) {
                    newWidths[idx] += 1;
                    diff -= 1;
                }
            } else {
                if (limits.min == null || newWidths[idx] > limits.min) {
                    newWidths[idx] -= 1;
                    diff += 1;
                }
            }

            i++;
        }

        setColumnWidths(prev => {
            const updated = { ...prev };
            visibleCols.forEach((id, index) => {
                updated[id] = newWidths[index];
            });
            return updated;
        });

        setTableWidth(wrapperWidth);
        setWrapperWidth(wrapperWidth);
    };

    const isTableFitted =
        hasFittedOnce &&
        wrapperWidth > 0 &&
        tableWidth != null &&
        Math.abs(tableWidth - wrapperWidth) <= 1;

    const showFitButton =
        hasFittedOnce &&
        wrapperWidth > 0 &&
        tableWidth != null &&
        tableWidth < wrapperWidth - 1;

    const showResetButton =
        hasFittedOnce && !isTableFitted;

    useEffect(() => {
        if (!hasFittedOnce) return;
        fitTableToWidth();
    }, [isSidebarVisible, showColumns]);

    useEffect(() => {
        if (!excelFilter.open) return;

        const handleClickOutside = (e) => {
            if (e.target.closest('.excel-filter-popup')) return;
            setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
        };

        const handleScroll = (e) => {
            if (e.target.closest('.excel-filter-popup')) return;
            setExcelFilter({ open: false, colId: null, anchorRect: null, pos: { top: 0, left: 0, width: 0 } });
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [excelFilter.open]);

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
    }, [excelFilter.open, excelFilter.pos, excelSearch]);

    const [filterMenu, setFilterMenu] = useState({ isOpen: false, anchorRect: null });
    const filterMenuTimerRef = useRef(null);

    const hasActiveFilters = useMemo(() => {
        const hasColumnFilters = Object.keys(activeExcelFilters).length > 0;
        const hasSort = sortConfig.colId !== null || sortConfig.direction !== "asc";
        return hasColumnFilters || hasSort;
    }, [activeExcelFilters, sortConfig]);

    const openFilterMenu = (e) => {
        if (!hasActiveFilters) return;
        if (filterMenuTimerRef.current) clearTimeout(filterMenuTimerRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        setFilterMenu({ isOpen: true, anchorRect: rect });
    };

    const closeFilterMenuWithDelay = () => {
        filterMenuTimerRef.current = setTimeout(() => {
            setFilterMenu(prev => ({ ...prev, isOpen: false }));
        }, 200);
    };

    const handleClearFilters = () => {
        setActiveExcelFilters({});
        setSortConfig({ colId: null, direction: "asc" });
        setFilterMenu({ isOpen: false, anchorRect: null });
    };

    const getFilterBtnClass = () => {
        if (showResetButton) {
            return "top-right-button-control-att-3-new";
        }

        return "top-right-button-control-att-2-new";
    };

    return (
        <div className="risk-control-attributes-container" style={{ userSelect: "none" }}>
            {isSidebarVisible && (
                <div className="sidebar-um">
                    <div className="sidebar-toggle-icon" title="Hide Sidebar" onClick={() => setIsSidebarVisible(false)}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </div>
                    <div className="sidebar-logo-um">
                        <img src={`${process.env.PUBLIC_URL}/CH_Logo.svg`} alt="Logo" className="logo-img-um" onClick={() => navigate('/FrontendDMS/home')} title="Home" />
                        <p className="logo-text-um">Compliance Tracking</p>
                    </div>
                    <div className="sidebar-logo-dm-fi">
                        <img src={`${process.env.PUBLIC_URL}/controlAttributes.svg`} alt="Control Attributes" className="icon-risk-rm" />
                        <p className="logo-text-dm-fi">{`Task Management`}</p>
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

            <div className="main-box-risk-control-attributes">
                <div className="top-section-um">
                    <div className="burger-menu-icon-um">
                        <FontAwesomeIcon onClick={() => navigate(-1)} icon={faArrowLeft} title="Back" />
                    </div>

                    {canIn(access, "CTS", ["systemAdmin", "contributor"]) && (
                        <>
                            <div className="burger-menu-icon-um">
                                <FontAwesomeIcon
                                    icon={faCirclePlus}
                                    title="Allocate Task"
                                    onClick={() => handleOpenAddTaskPopup()}
                                />
                            </div>
                        </>
                    )}

                    <div className="um-input-container">
                        <input
                            className="search-input-um"
                            type="text"
                            placeholder="Search"
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery !== "" && (<i><FontAwesomeIcon icon={faX} onClick={clearSearch} className="icon-um-search" title="Clear Search" /></i>)}
                        {searchQuery === "" && (<i><FontAwesomeIcon icon={faSearch} className="icon-um-search" /></i>)}
                    </div>

                    {/* This div creates the space in the middle */}
                    <div className="spacer"></div>

                    {/* Container for right-aligned icons */}
                    <TopBar />
                </div>
                <div className="table-container-risk-control-attributes">
                    <div className="risk-control-label-wrapper-new">
                        {false && (<div className="control-attributes-pill-bar">
                            {["All", "General", "Specialised"].map((pill) => (
                                <div
                                    key={pill}
                                    className={`control-attributes-pill ${statusTab === pill ? "active" : ""}`}
                                    onClick={() => setStatusTab(pill)}
                                >
                                    {pill}
                                </div>
                            ))}
                        </div>)}

                        <label className="risk-control-label-new">Task Management</label>

                        <FontAwesomeIcon
                            icon={faTableColumns}
                            title="Show / Hide Columns"
                            className="top-right-button-control-att-new"
                            onClick={() => setShowColumnSelector(prev => !prev)}
                        />

                        <FontAwesomeIcon
                            icon={faFilter}
                            className={getFilterBtnClass()}
                            title={hasActiveFilters ? "Filters Active (Double Click to Clear)" : "Table is filter enabled."}
                            style={{
                                cursor: hasActiveFilters ? "pointer" : "default",
                                color: hasActiveFilters ? "#002060" : "gray",
                                userSelect: "none"
                            }}
                            onMouseEnter={(e) => {
                                if (hasActiveFilters) openFilterMenu(e);
                            }}
                            onMouseLeave={closeFilterMenuWithDelay}
                            onDoubleClick={handleClearFilters}
                        />

                        {showResetButton && (
                            <FontAwesomeIcon
                                icon={faArrowsRotate}
                                title="Reset column widths"
                                className={showFitButton ? "top-right-button-control-att-2-new" : "top-right-button-control-att-2-new"}
                                onClick={resetColumnWidths}
                            />
                        )}

                        {showColumnSelector && (
                            <div className="column-selector-popup" onMouseDown={e => e.stopPropagation()}>
                                <div className="column-selector-header">
                                    <h4>Select Columns</h4>
                                    <button
                                        className="close-popup-btn"
                                        type="button"
                                        onClick={() => setShowColumnSelector(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>

                                <div className="column-selector-content">
                                    <p className="column-selector-note">Select columns to display</p>

                                    <div className="select-all-container">
                                        <label className="select-all-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={areAllColumnsSelected()}
                                                onChange={(e) => toggleAllColumns(e.target.checked)}
                                            />
                                            <span className="select-all-text">Select All</span>
                                        </label>
                                    </div>

                                    <div
                                        className="column-checkbox-container"
                                    >
                                        {availableColumns.map(column => (
                                            <div className="column-checkbox-item" key={column.id}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={showColumns.includes(column.id)}
                                                        disabled={column.id === 'nr' || column.id === 'action'}
                                                        onChange={() => toggleColumn(column.id)}
                                                    />
                                                    <span>{column.title}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="column-selector-footer">
                                        <p>{showColumns.length} columns selected</p>
                                        <button
                                            className="apply-columns-btn"
                                            type="button"
                                            onClick={() => setShowColumnSelector(false)}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="table-scroll-wrapper-attributes-controls" ref={scrollerRef}>
                        <table className={`${isSidebarVisible ? `risk-control-attributes-table` : `risk-control-attributes-table-ws`}`}>
                            <thead className="risk-control-attributes-head">
                                <tr>
                                    {availableColumns.map(col => {
                                        if (col.id === "action") return null;
                                        if (!showColumns.includes(col.id)) return null;

                                        const classMap = {
                                            nr: "risk-control-attributes-nr",
                                            taskDescription: "risk-control-attributes-description",
                                            responsible: "risk-control-attributes-control",
                                            allocatedDate: "risk-control-attributes-activation",
                                            dueDate: "risk-control-attributes-activation",
                                            completionDate: "risk-control-attributes-activation",
                                            status: "risk-control-attributes-quality",
                                            comments: "risk-control-attributes-perf",
                                            attachments: "risk-control-attributes-cons",
                                            closeStatus: "risk-control-attributes-critcal",
                                            userAttachments: "risk-control-attributes-cons",
                                        };

                                        const isActiveFilter = activeExcelFilters[col.id];
                                        const isActiveSort = sortConfig.colId === col.id && col.id !== "nr";

                                        return (
                                            <th
                                                key={col.id}
                                                className={`risk-control-attributes-action`}
                                                onClick={(e) => {
                                                    if (isResizingRef.current) return;
                                                    if (e.target.classList.contains('rca-col-resizer')) return;
                                                    openExcelFilterPopup(col.id, e);
                                                }}
                                                style={{
                                                    position: "relative",
                                                    width: columnWidths[col.id] ? `${columnWidths[col.id]}px` : undefined,
                                                    minWidth: columnSizeLimits[col.id]?.min,
                                                    maxWidth: columnSizeLimits[col.id]?.max,
                                                    cursor: col.id === "nr" ? "default" : "pointer"
                                                }}
                                            >
                                                <span>{col.title}</span>
                                                {(isActiveFilter || isActiveSort) && (
                                                    <FontAwesomeIcon
                                                        icon={faFilter}
                                                        className="th-filter-icon"
                                                        style={{ marginLeft: "8px", opacity: 0.8 }}
                                                    />
                                                )}
                                                <div
                                                    className="rca-col-resizer"
                                                    onMouseDown={e => startColumnResize(e, col.id)}
                                                />
                                            </th>
                                        );
                                    })}

                                    {showColumns.includes("action") && (
                                        <th
                                            className="risk-control-attributes-action"
                                            style={{
                                                position: "relative",
                                                width: columnWidths.action
                                                    ? `${columnWidths.action}px`
                                                    : undefined,
                                                minWidth: columnSizeLimits.action?.min,
                                                maxWidth: columnSizeLimits.action?.max,
                                                cursor: "default"
                                            }}
                                        >
                                            <span>Action</span>
                                            <div
                                                className="rca-col-resizer"
                                                onMouseDown={(e) => startColumnResize(e, "action")}
                                            />
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody
                                ref={tbodyRef}
                                onPointerDown={onRowPointerDown}
                                onPointerMove={onRowPointerMove}
                                onPointerUp={endRowDrag}
                                onPointerCancel={endRowDrag}
                                onDragStart={onNativeDragStart}
                            >
                                {processedTasks.map((row, index) => {
                                    return (
                                        <tr
                                            className={`table-scroll-wrapper-attributes-controls`}
                                            key={row._id ?? index}
                                        >
                                            {showColumns.includes("nr") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    {index + 1}
                                                </td>
                                            )}

                                            {showColumns.includes("taskDescription") && (
                                                <td style={{ fontSize: "14px" }}>
                                                    {row.taskDescription}
                                                </td>
                                            )}

                                            {showColumns.includes("responsible") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    {row.responsible}
                                                </td>
                                            )}


                                            {showColumns.includes("allocatedDate") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    {row.allocatedDate || ""}
                                                </td>
                                            )}

                                            {showColumns.includes("dueDate") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    {row.dueDate || ""}
                                                </td>
                                            )}

                                            {showColumns.includes("completionDate") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    {row.completionDate || ""}
                                                </td>
                                            )}

                                            {showColumns.includes("status") && (
                                                <td
                                                    className="procCent"
                                                    style={{
                                                        fontSize: "14px",
                                                        backgroundColor: getStatusColor(row.status),
                                                        color: getStatusTextColor(row.status),
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    {row.status}
                                                </td>
                                            )}

                                            {showColumns.includes("comments") && (
                                                <td style={{ fontSize: "14px" }}>
                                                    {row.comments}
                                                </td>
                                            )}

                                            {showColumns.includes("attachments") && (
                                                <td style={{ fontSize: "14px" }}>
                                                    {Array.isArray(row.attachments) && row.attachments.length > 0 ? (
                                                        row.attachments.map((file, fileIndex) => (
                                                            <div key={`${row._id || index}-attachment-${fileIndex}`}>
                                                                {file}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span>No files</span>
                                                    )}
                                                </td>
                                            )}

                                            {showColumns.includes("userAttachments") && (
                                                <td style={{ fontSize: "14px" }}>
                                                    {Array.isArray(row.userAttachments) && row.userAttachments.length > 0 ? (
                                                        row.userAttachments.map((file, fileIndex) => (
                                                            <div key={`${row._id || index}-user-attachment-${fileIndex}`}>
                                                                {file}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span>No files</span>
                                                    )}
                                                </td>
                                            )}

                                            {showColumns.includes("closeStatus") && (
                                                <td className="procCent" style={{ fontSize: "14px" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-inp-abbr"
                                                        checked={!!row.closeStatus}
                                                        onChange={() => {
                                                            setTasks(prev =>
                                                                prev.map(task =>
                                                                    task._id === row._id
                                                                        ? { ...task, closeStatus: !task.closeStatus }
                                                                        : task
                                                                )
                                                            );
                                                        }}
                                                    />
                                                </td>
                                            )}

                                            {showColumns.includes("action") && (
                                                <td className="risk-control-attributes-action-cell">
                                                    <button
                                                        type="button"
                                                        className="rca-action-btn"
                                                        title="Edit Task"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="rca-action-btn"
                                                        title="Delete Task"
                                                        style={{ marginLeft: "5px" }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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

                            setActiveExcelFilters(prev => {
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

            {showAddTaskPopup && (
                <AddTaskPopup
                    onClose={handleCloseAddTaskPopup}
                />
            )}
            <ToastContainer />
        </div >
    );
};

export default ManualTaskingAllocationPage;