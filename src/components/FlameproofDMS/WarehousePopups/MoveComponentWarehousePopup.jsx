import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-multi-date-picker';
import UploadWithoutFileWarehouse from './UploadWithoutFileWarehouse';
import UploadWithoutFileValuesWarehouse from './UploadWithoutFileValuesWarehouse';
import Select from "react-select";

const MoveComponentWarehousePopup = ({ onClose, data, refresh }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [certificateAuth, setCertificateAuth] = useState('');
    const [certificateNum, setCertificateNum] = useState('');
    const [serialNumber, setSerialNumber] = useState("");
    const [issueDate, setIssueDate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState('');
    const [errors, setErrors] = useState({});
    const [expiryDate, setExpiryDate] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [siteError, setSiteError] = useState(false);
    const [assetError, setAssetError] = useState(false);
    const [componentError, setComponentError] = useState(false);
    const [withoutValues, setWithoutValues] = useState(false);
    const [withoutFile, setWithoutFile] = useState(false);
    const [siteId, setSiteId] = useState("");
    const [siteName, setSiteName] = useState("");
    const [assetTypesSelected, setAssetTypesSelected] = useState([]);

    useEffect(() => {
        setSiteId(data?.asset?.site?._id || "");
        setSiteName(data?.asset?.site?.site || "");
        setAssetTypesSelected(
            data?.asset?.assetType
                ? [data.asset.assetType]
                : []
        );
        setComponent(data?.component || "");
        setSerialNumber(data?.serialNumber || "");
    }, [data]);

    const [certifiers, setCertifiers] = useState([]);
    const [showCertifiersDropdown, setShowCertifiersDropdown] = useState(false);
    const [filteredCertifiers, setFilteredCertifiers] = useState([]);
    const certifiersRef = useRef(null);

    const [assetTypes, setAssetTypes] = useState([]);

    const [components, setComponents] = useState([]);
    const [component, setComponent] = useState("");

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

    const fetchAssetTypes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/flameWarehouse/getAssetTypes`);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();

            setAssetTypes(data.types);
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

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUserID(decodedToken.userId);
        }
    }, []);

    useEffect(() => {
        fetchCertifiers();
        fetchAssetTypes();
    }, []);

    const closeAllDropdowns = () => setShowCertifiersDropdown(false);

    const validateForm = () => {
        const newErrors = {};
        if (!selectedFile) newErrors.selectedFile = true;
        if (!siteId) newErrors.site = true;
        if (!certificateAuth) newErrors.certificateAuth = true;
        if (!certificateNum) newErrors.certificateNum = true;
        if (!issueDate) newErrors.issueDate = true;
        if (!expiryDate) newErrors.expiryDate = true;
        if (!component) newErrors.component = true;
        if (!assetTypesSelected.length > 0) newErrors.assetType = true;
        return newErrors;
    };

    useEffect(() => {
        if (assetError && assetTypesSelected.length > 0) {
            setAssetError(false);
        }

        if (siteError && siteId) {
            setSiteError(false);
        }

        if (componentError && component) {
            setComponentError(false);
        }

        if (Object.keys(errors).length > 0) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    }, [certificateAuth, certificateNum, issueDate, component, siteId, serialNumber, assetTypesSelected]);

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
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('serialNumber', serialNumber);
        formData.append('certificationAuthority', certificateAuth);
        formData.append('certificateNumber', certificateNum);
        formData.append('issueDate', issueDate);
        formData.append('expiryDate', expiryDate);

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_URL}/api/flameWarehouse/certificates/repairedNewCertificate/${data?._id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: formData,
            });
            if (!response.ok) throw new Error(response.error || 'Failed to upload file');
            const newData = await response.json();

            setSelectedFile(null);
            setCertificateAuth('');
            setSerialNumber("");
            setCertificateNum('');
            setIssueDate('');

            setError(null);
            setLoading(false);

            toast.success("Component Moved To Warehouse Successfully", {
                closeButton: false, autoClose: 2000, style: { textAlign: 'center' }
            });

            setTimeout(() => {
                refresh();
                onClose();
            }, 2000);
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
        if (!selectedFile) {
            toast.error("Please select a certificate file to upload", {
                closeButton: false,
                autoClose: 2000
            });
            return;
        }
        if (isFormValid()) handleFileUpload();
    };

    useEffect(() => {
        const popupSelector = '.floating-dropdown';

        const handleClickOutside = (e) => {
            const outside =
                !e.target.closest(popupSelector) &&
                !e.target.closest('input');
            if (outside) {
                closeDropdowns();
            }
        };

        const handleScroll = (e) => {
            if (e.target.closest('textarea, input')) return;
            if (e.target.closest(popupSelector)) return;

            closeDropdowns();
        };

        const closeDropdowns = () => {
            setShowCertifiersDropdown(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true); // capture scroll events from nested elements

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [showCertifiersDropdown]);

    // inside your component (above return):
    const onAssetTypesChange = (e) => {
        const opts = Array.from(e.target.selectedOptions).map(o => o.value);
        setAssetTypesSelected(opts);
    };

    return (
        <div className="ump-container">
            <div className="ump-overlay">
                <div className="ump-content">
                    <div className="review-date-header">
                        <h2 className="review-date-title">Move Repaired Component</h2>
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
                            <h2>Component Information</h2>
                        </div>

                        <form className="ump-form" onSubmit={handleSubmit}>
                            <div className="ump-form-row">
                                <div className={`ump-form-group ${errors.site || siteError ? "ump-error" : ""}`}>
                                    <label>Site <span className="ump-required">*</span></label>
                                    <div className={`fpm-select-container`}>
                                        <input
                                            value={siteName}
                                            onChange={(e) => setSiteId(e.target.value)}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: siteId === "" ? "GrayText" : "black" }}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className={`ump-form-group ${errors.assetType || assetError ? "ump-error" : ""}`}>
                                    <label>Asset Type <span className="ump-required">*</span></label>
                                    <div className="fi-info-popup-page-select-container">
                                        <Select options={assetTypes.map(d => ({ value: d.type, label: d.type }))} isMulti onChange={(selected) => setAssetTypesSelected(selected.map(s => s.value))} className="assetType-select remove-default-styling" placeholder="Select Asset Type(s)" value={assetTypesSelected.map(d => ({ value: d, label: d }))}
                                            classNamePrefix="sb" isDisabled={true} />
                                    </div>
                                </div>
                                <div className={`ump-form-group ${errors.component || componentError ? "ump-error" : ""}`}>
                                    <label>Component Name <span className="ump-required">*</span></label>
                                    <div className={`fpm-select-container`}>
                                        <input
                                            value={component}
                                            onChange={(e) => setComponent(e.target.value)}
                                            className="upm-comp-input-select font-fam"
                                            style={{ color: component === "" ? "GrayText" : "black" }}
                                            disabled
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="ump-form-row">
                                <div className={`ump-form-group ${errors.serialNumber ? "ump-error" : ""}`}>
                                    <label>Component Serial Number</label>
                                    <input
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        type="text"
                                        autoComplete="off"
                                        className="ump-input-select font-fam"
                                        placeholder="Insert Component Serial Number"
                                    />
                                </div>

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
                            </div>
                            <div className="ump-form-row">
                                <div style={{ width: "30%" }} className={`ump-form-group ${errors.issueDate ? "ump-error" : ""}`}>
                                    <label>Issue Date <span className="ump-required">*</span></label>

                                    <div className='date-container-license' style={{ position: "relative" }}>
                                        <DatePicker
                                            value={issueDate || ""}
                                            format="YYYY-MM-DD"
                                            onChange={(val) => {
                                                const v = val?.format("YYYY-MM-DD");
                                                const max = todayString();
                                                setIssueDate(v && v > max ? max : v); // clamp to today if future picked/typed
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

                                <div className={`ump-form-group ${errors.expiryDate ? "ump-error" : ""}`}>
                                    <label>Expiry Date <span className="ump-required">*</span></label>

                                    <div className='date-container-license' style={{ position: "relative" }}>
                                        <DatePicker
                                            value={expiryDate || ""}
                                            format="YYYY-MM-DD"
                                            onChange={(val) => {
                                                const v = val?.format("YYYY-MM-DD");
                                                setExpiryDate(v); // clamp to today if future picked/typed
                                            }}
                                            rangeHover={false}
                                            highlightToday={false}
                                            editable={false}
                                            placeholder="YYYY-MM-DD"
                                            hideIcon={false}
                                            inputClass='ump-input-select-new-3'
                                            minDate={issueDate}
                                            onOpenPickNewDate={false}
                                        />
                                        <FontAwesomeIcon
                                            icon={faCalendarDays}
                                            className="date-input-calendar-icon"
                                        />
                                    </div>
                                </div>

                                <div className={`ump-form-group ${errors.certificateNum ? "ump-error" : ""}`}>

                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="ump-form-footer">
                        <div className="ump-actions">
                            <button className="ump-upload-button" onClick={handleSubmit}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Upload Component'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveComponentWarehousePopup;
