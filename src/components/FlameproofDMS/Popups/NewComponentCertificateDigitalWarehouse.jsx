import React, { useState, useEffect, useRef } from 'react';
import './UploadPopup.css';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import ComponentDateUpdates from './ComponentDateUpdates';
import DatePicker from 'react-multi-date-picker';

const NewComponentCertificateDigitalWarehouse = ({ onClose, refresh, assetNumber = "", site = "", assetType = "", newComponent = "", oldId = "" }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [certificateAuth, setCertificateAuth] = useState('');
    const [certificateNum, setCertificateNum] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [userID, setUserID] = useState('');
    const [errors, setErrors] = useState({});
    const [components, setComponents] = useState([])
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);
    const assetRef = useRef(null);
    const [assetNrs, setAssetNrs] = useState([]);
    const [filteredAssetNrs, setFilteredAssetNrs] = useState([]);
    const [siteId, setSiteId] = useState(site || "");
    const [sites, setSites] = useState([]);
    const [assetsBySite, setAssetsBySite] = useState({});
    const [assetNr, setAssetNr] = useState(assetNumber || "");
    const [availableComponents, setAvailableComponents] = useState([]);
    const [assetIndex, setAssetIndex] = useState({});
    const [allAssetOptions, setAllAssetOptions] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [assetOptions, setAssetOptions] = useState([]);
    const [confirmNavigation, setConfirmNavigation] = useState(false);
    const [assetID, setAssetID] = useState("");
    const [assetNumberR, setAssetNumberR] = useState("");
    const navigate = useNavigate();
    const [certifiers, setCertifiers] = useState([]);
    const [component, setComponent] = useState(newComponent || "");

    const fetchCertifiers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/flameWarehouse/getCertifiers`);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();

            setCertifiers(data.certifiers);
        } catch (error) {
            setError(error.message);
        }
    };

    const todayString = () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 10);
    };

    const normStr = (s = "") => s.toLowerCase().trim();
    const siteLocked = !!site;
    const assetLocked = !!assetNumber;
    const componentLocked = !!newComponent;
    const assetTypeFilter = normStr(assetType || "");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUserID(decodedToken.userId);
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!siteId) newErrors.site = true;
        if (!selectedFile) newErrors.file = true;
        if (!certificateAuth) newErrors.certificateAuth = true;
        if (!certificateNum) newErrors.certificateNum = true;
        if (!issueDate) newErrors.issueDate = true;
        if (!component) newErrors.component = true;
        if (!assetNr) newErrors.asset = true;
        return newErrors;
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    }, [selectedFile, certificateAuth, certificateNum, issueDate, component, siteId, assetNr]);

    const isFormValid = () => {
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill in all required fields marked by a *", {
                closeButton: false,
                autoClose: 2000,
                style: { textAlign: 'center' }
            });
            return false;
        }
        return true;
    };

    const handleFileUpload = async () => {
        if (!isFormValid()) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('certificationAuthority', certificateAuth);
        formData.append('certificateNr', certificateNum);
        formData.append('issueDate', issueDate);

        try {
            setLoading(true);
            if (!oldId) {
                throw new Error("Missing oldId (certificateId) for rollback-and-upload flow");
            }

            const response = await fetch(
                `${process.env.REACT_APP_URL}/api/flameWarehouse/certificates/rollbackAndUploadNewNext/${oldId}`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: formData,
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data?.error || 'Failed to upload file');

            setSelectedFile(null);
            setCertificateAuth('');
            setCertificateNum('');
            setIssueDate('');

            setError(null);
            setLoading(false);

            toast.success("Component moved to asset with new certificate", {
                closeButton: false, autoClose: 2000, style: { textAlign: 'center' }
            });

            setTimeout(() => {
                onClose();
                refresh();
            }, 1500);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        if (file) setSelectedFile(file);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid()) handleFileUpload();
    };

    useEffect(() => {
        const popupSelector = ".floating-dropdown";

        const closeDropdowns = () => setShowAssetDropdown(false);

        const handleClickOutside = (e) => {
            const outside = !e.target.closest(popupSelector) && !e.target.closest("input");
            if (outside) closeDropdowns();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [showAssetDropdown]);

    useEffect(() => {
        fetchCertifiers();
    }, [])

    return (
        <div className="ump-container">
            <div className="ump-overlay">
                <div className="ump-content">
                    <div className="review-date-header">
                        <h2 className="review-date-title">Upload New Certificate</h2>
                        <button className="review-date-close" onClick={() => onClose(null, null, false)} title="Close Popup">×</button>
                    </div>

                    <div className="ump-form-group-container">
                        <div className="ump-file-name">{selectedFile ? selectedFile.name : "No Certificate Selected"}</div>
                        <div className="ump-actions">
                            <label className="ump-choose-button">
                                {'Choose Certificate'}
                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>

                    <div className="ump-form-group-main">
                        <div className="ump-section-header">
                            <h2>Certificate Information</h2>
                        </div>

                        <form className="ump-form" onSubmit={handleSubmit}>
                            <div className="ump-form-row">
                                <div className={`ump-form-group ${errors.site ? "ump-error" : ""}`}>
                                    <label>Site <span className="ump-required">*</span></label>
                                    <div className={`${siteLocked ? `` : `fpm-select-container`}`}>
                                        <input
                                            value={siteId}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: siteId === "" ? "GrayText" : "black" }}
                                            disabled={siteLocked}
                                        />
                                    </div>
                                </div>
                                <div className={`ump-form-group ${errors.asset ? "ump-error" : ""}`}>
                                    <label>Asset Number <span className="ump-required">*</span></label>
                                    <div className={`${assetLocked ? `` : `fpm-select-container`}`}>
                                        <input
                                            value={assetNr || ""}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: assetNr === "" ? "GrayText" : "black" }}
                                            disabled={assetLocked}
                                        />
                                    </div>
                                </div>
                                <div className={`ump-form-group ${errors.component ? "ump-error" : ""}`}>
                                    <label>Component/ Type <span className="ump-required">*</span></label>
                                    <div className={`${componentLocked ? `` : `fpm-select-container`}`}>
                                        <input
                                            value={component || ""}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: component === "" ? "GrayText" : "black" }}
                                            disabled={componentLocked}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="ump-form-row">
                                <div className={`ump-form-group ${errors.certificateAuth ? "ump-error" : ""}`}>
                                    <label>Certification Body <span className="ump-required">*</span></label>
                                    <div className="ump-select-container">
                                        <select
                                            value={certificateAuth}
                                            onChange={(e) => setCertificateAuth(e.target.value)}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: certificateAuth === "" ? "GrayText" : "black" }}
                                        >
                                            <option value="" className="def-colour">Select Certification Body</option>
                                            {certifiers.map(s => (
                                                <option key={s._id} value={s.authority} className="norm-colour">
                                                    {s.authority}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={`ump-form-group ${errors.certificateNum ? "ump-error" : ""}`}>
                                    <label>Certificate Number <span className="ump-required">*</span></label>
                                    <input
                                        type="text"
                                        name="assetNr"
                                        value={certificateNum}
                                        onChange={(e) => setCertificateNum(e.target.value)}
                                        autoComplete="off"
                                        className="ump-input-select font-fam"
                                        placeholder="Insert Certificate Number"
                                    />
                                </div>

                                <div className={`ump-form-group ${errors.issueDate ? "ump-error" : ""}`}>
                                    <label>Issue Date <span className="ump-required">*</span></label>

                                    <div className='date-container-license' style={{ position: "relative" }}>
                                        <DatePicker
                                            value={issueDate || ""}
                                            format="YYYY-MM-DD"
                                            onChange={(val) => {
                                                const v = val?.format("YYYY-MM-DD");
                                                setIssueDate(v); // clamp to today if future picked/typed
                                            }}
                                            rangeHover={false}
                                            highlightToday={false}
                                            editable={false}
                                            placeholder="YYYY-MM-DD"
                                            hideIcon={false}
                                            inputClass='ump-input-select-new-3'
                                            maxDate={todayString()}
                                            onOpenPickNewDate={false}
                                        />
                                        <FontAwesomeIcon
                                            icon={faCalendarDays}
                                            className="date-input-calendar-icon"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="ump-form-footer">
                        <div className="ump-actions">
                            <button className="ump-upload-button" disabled={!selectedFile} onClick={handleSubmit}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Upload Certificate'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewComponentCertificateDigitalWarehouse;
