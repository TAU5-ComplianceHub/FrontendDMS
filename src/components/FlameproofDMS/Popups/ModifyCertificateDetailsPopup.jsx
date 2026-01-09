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

const ModifyCertificateDetailsPopup = ({ onClose, refresh, data }) => {
    const [certificateAuth, setCertificateAuth] = useState('');
    const [certificateNum, setCertificateNum] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState('');
    const [errors, setErrors] = useState({});
    const [certifiers, setCertifiers] = useState([]);
    const [id, setId] = useState('');

    useEffect(() => {
        setCertificateAuth(data?.certAuth || "");
        setCertificateNum(data?.certNr || "");
        setId(data?._id);
        setExpiryDate(data?.certificateExipryDate || "");
        setIssueDate(data?.issueDate || "");
    }, [data])

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
        return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUserID(decodedToken.userId);
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!certificateAuth) newErrors.certificateAuth = true;
        if (!certificateNum) newErrors.certificateNum = true;
        if (!issueDate) newErrors.issueDate = true;
        return newErrors;
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    }, [certificateAuth, certificateNum, issueDate]);

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
        formData.append('certificationAuthority', certificateAuth);
        formData.append('certificateNr', certificateNum);
        formData.append('issueDate', issueDate);
        formData.append('expiryDate', expiryDate);

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_URL}/api/flameproof/updateCertificateDetails/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: formData,
            });
            if (!response.ok) throw new Error(response.error || 'Failed to upload file');
            const data = await response.json();

            setCertificateAuth('');
            setCertificateNum('');
            setIssueDate("");
            setIssueDate('');

            setError(null);
            setLoading(false);

            toast.success("Component Updated Successfully", {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid()) handleFileUpload();
    };

    useEffect(() => {
        fetchCertifiers();
    }, [])

    return (
        <div className="ump-container">
            <div className="ump-overlay">
                <div className="ump-content">
                    <div className="review-date-header">
                        <h2 className="review-date-title">Update Component</h2>
                        <button className="review-date-close" onClick={() => onClose(null, null, false)} title="Close Popup">×</button>
                    </div>
                    <div className="ump-form-group-main">
                        <form className="ump-form" onSubmit={handleSubmit}>
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
                                <div className={`ump-form-group ${errors.component ? "ump-error" : ""}`}>
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

                                <div className={`ump-form-group`}>
                                    <label>Expiry Date</label>

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
                                            minDate={todayString()}
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
                            <button className="ump-upload-button" onClick={handleSubmit}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Update Component'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModifyCertificateDetailsPopup;
