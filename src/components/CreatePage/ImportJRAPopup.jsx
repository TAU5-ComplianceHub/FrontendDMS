import React, { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faX,
    faFilter,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';

const ImportJRAPopup = ({ isOpen, onClose, setLoadedID, loadData, userID, type }) => {
    const [drafts, setDrafts] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showNoDrafts, setShowNoDrafts] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState(null);

    const toggleSort = (field) => {
        if (sortBy !== field) {
            setSortBy(field);
            setSortDir('asc');
            return;
        }
        if (sortDir === 'asc') {
            setSortDir('desc');
            return;
        }
        setSortBy(null);
        setSortDir(null);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return null;
        if (sortDir === 'asc') return <FontAwesomeIcon icon={faSortUp} style={{ marginLeft: 6 }} />;
        if (sortDir === 'desc') return <FontAwesomeIcon icon={faSortDown} style={{ marginLeft: 6 }} />;
        return null;
    };

    const filteredDrafts = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return drafts;
        return drafts.filter(d =>
            `${d?.formData?.title || ''} ${d?.formData?.documentType || ''}`.toLowerCase().includes(q)
        );
    }, [drafts, query]);

    const displayDrafts = useMemo(() => {
        const list = [...filteredDrafts];
        if (!sortBy || !sortDir) return list;

        const getTime = (d) => {
            if (sortBy === 'created') return d.dateCreated ? new Date(d.dateCreated).getTime() : null;
            if (sortBy === 'modified') return d.dateUpdated ? new Date(d.dateUpdated).getTime() : null;
            return null;
        };

        return list.sort((a, b) => {
            const at = getTime(a);
            const bt = getTime(b);

            if (at == null && bt == null) return 0;
            if (at == null) return 1;
            if (bt == null) return -1;

            return sortDir === 'asc' ? at - bt : bt - at;
        });
    }, [filteredDrafts, sortBy, sortDir]);

    useEffect(() => {
        if (!isOpen || !userID) return;

        const getDraftDocuments = async () => {
            setIsLoading(true);
            setShowNoDrafts(false);

            const token = localStorage.getItem("token");
            const route = `${process.env.REACT_APP_URL}/api/riskDraft/jraDocuments`;

            try {
                const response = await fetch(route, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch JRA documents");
                }

                const data = await response.json();

                const merged = [
                    ...(data.drafts || []).map(item => ({ ...item, source: "Draft" })),
                    ...(data.documents || []).map(item => ({ ...item, source: "Document" })),
                    ...(data.signedOffDocuments || []).map(item => ({ ...item, source: "Signed Off" })),
                ];

                setDrafts(merged);
            } catch (error) {
                console.error("Failed to fetch JRA documents:", error);
                setDrafts([]);
            } finally {
                setIsLoading(false);
            }
        };

        getDraftDocuments();
    }, [isOpen, userID]);

    useEffect(() => {
        if (!isLoading && drafts.length === 0) {
            const timer = setTimeout(() => setShowNoDrafts(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowNoDrafts(false);
        }
    }, [isLoading, drafts]);

    const handleLoad = async (item) => {
        loadData(item);
        setLoadedID?.('');
        onClose?.();
    };

    return (
        <div className="draftLoad-popup-overlay">
            <div className="draftLoad-popup-content">
                <div className="review-date-header">
                    <h2 className="review-date-title">Import JRA Data</h2>
                    <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                </div>

                <div className="draft-table-group">
                    <div className="draft-select-header">
                        <div className="draft-select-text">Select JRA to import</div>
                    </div>

                    <div className="draft-searchbar draft-searchbar--full">
                        <input
                            type="text"
                            className="draft-search-input"
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
                        />
                        <div className="draft-search-icons">
                            {query ? (
                                <span className="icon-static" title="Clear Search" onClick={() => setQuery('')}>
                                    <FontAwesomeIcon icon={faX} />
                                </span>
                            ) : (
                                <span className="icon-static" title="Search">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="popup-table-wrapper-draft">
                        <table className="popup-table font-fam">
                            <thead className="draft-headers">
                                <tr>
                                    <th className="draft-nr">Nr</th>
                                    <th className="draft-name">
                                        JRA document
                                        {query && <FontAwesomeIcon icon={faFilter} style={{ marginLeft: "10px" }} />}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && drafts.length > 0 && filteredDrafts.length > 0 && (
                                    displayDrafts.map((item, index) => (
                                        <tr key={`${item.source}-${item._id}`}>
                                            <td className="draft-nr">{index + 1}</td>
                                            <td onClick={() => handleLoad(item)} className="load-draft-td">
                                                {`${item.formData?.title || "Untitled"} ${item.formData?.documentType || ""}`}
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {isLoading && (
                                    <tr>
                                        <td colSpan="2" className="cent">
                                            Loading JRA documents
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && drafts.length === 0 && showNoDrafts && (
                                    <tr>
                                        <td colSpan="2" className="cent">
                                            No JRA documents available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportJRAPopup;