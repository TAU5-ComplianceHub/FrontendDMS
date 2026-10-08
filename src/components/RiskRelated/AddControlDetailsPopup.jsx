import React, { useState, useEffect } from 'react';
import './ControlEAPopup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import ControlType from './RiskInfo/ControlType';
import ControlActivation from './RiskInfo/ControlActivation';
import ControlHierarchy from './RiskInfo/ControlHierarchy';
import CriticalControl from './RiskInfo/CriticalControl';
import ControlQuality from './RiskInfo/ControlQuality';
import { toast } from 'react-toastify';

// NOTE: This is a standalone instance of the "Add Control" form used specifically
// for inline/quick-add flows (e.g. from the Applicable Controls "Add New Controls"
// popup). Unlike AddControlPopup.jsx, it does NOT post to the global
// /api/riskInfo/add-control endpoint - it simply hands the entered values back to
// the caller (onSubmit) so they can be stored locally against the row/control and
// pulled through into the CEA table. It also intentionally does not include the
// "Control Treatment" section used on ControlEAPopup.jsx.
const AddControlDetailsPopup = ({ onClose, onSubmit, initialValues = null, lockControlName = true }) => {
    const isEditMode = !!(initialValues && (initialValues.controlName || "").trim());

    const [controlName, setControlName] = useState(initialValues?.controlName || "");
    const [criticalControl, setCriticalControl] = useState(initialValues?.criticalControl || "");
    const [controlType, setControlType] = useState(initialValues?.controlType || "");
    const [controlActivation, setControlActivation] = useState(initialValues?.controlActivation || "");
    const [hierarchy, setHierarchy] = useState(initialValues?.hierarchy || "");
    const [controlAim, setControlAim] = useState(initialValues?.controlAim || "");
    const [quality, setQuality] = useState(initialValues?.quality || "");
    const [description, setDescription] = useState(initialValues?.description || "");
    const [performance, setPerformance] = useState(initialValues?.performance || "");
    const [category, setCategory] = useState(initialValues?.category || "");
    const [categoryOptions, setCategoryOptions] = useState([]);

    const [helpCT, setHelpCT] = useState(false);
    const [helpCA, setHelpCA] = useState(false);
    const [helpQuality, setHelpQuality] = useState(false);
    const [helpHier, setHelpHier] = useState(false);
    const [helpCritical, setHelpCritical] = useState(false);

    const [controlTypeOptions] = useState(['Act', 'Object', 'System']);
    const [activationOptions] = useState(['Prevention Control', 'Consequence Minimizing Control', 'Both']);
    const [hierarchyOptions] = useState(['1. Elimination', '2. Substitution', '3. Engineering', '4. Separation', '5. Administration', '6. PPE']);
    const [aimOptions] = useState([
        'Community (C)',
        'Environment (E)',
        'Health (H)',
        'Legal & Regulatory (L&R)',
        'Material Losses (M)',
        'Reputation (R)',
        'Safety (S)'
    ]);
    const [qualityOptions] = useState(['< 30%', '30-59%', '60-90%', '> 90%']);

    const [loading, setLoading] = useState(false);

    const openHelpCT = () => setHelpCT(true);
    const closeHelpCT = () => setHelpCT(false);
    const openHelpQuality = () => setHelpQuality(true);
    const closeHelpQuality = () => setHelpQuality(false);
    const openHelpCritical = () => setHelpCritical(true);
    const closeHelpCritical = () => setHelpCritical(false);
    const openHelpCA = () => setHelpCA(true);
    const closeHelpCA = () => setHelpCA(false);
    const openHelpHier = () => setHelpHier(true);
    const closeHelpHier = () => setHelpHier(false);

    const fetchCategories = async () => {
        const route = `/api/riskInfo/getCategories`;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}${route}`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();

            const sortedControls = (data.categories || []).sort((a, b) =>
                a.category.localeCompare(b.category, undefined, { sensitivity: 'base' })
            );
            setCategoryOptions(sortedControls);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        const values = {
            controlName: controlName.trim(),
            criticalControl: criticalControl.trim(),
            controlType: controlType.trim(),
            controlActivation: controlActivation.trim(),
            hierarchy: hierarchy.trim(),
            controlAim: controlAim.trim(),
            quality: quality.trim(),
            description: description.trim(),
            performance: performance.trim(),
            category: category.trim(),
        };

        onSubmit?.(values);

        toast.success(isEditMode ? 'Control details updated.' : 'Control details added.', {
            autoClose: 1200,
            closeButton: false
        });

        setLoading(false);
        onClose?.();
    };

    return (
        <div className="ibra-popup-page-container">
            <div className="ibra-popup-page-overlay">
                <div className="ibra-popup-page-popup-right">
                    <div className="ibra-popup-page-popup-header-right">
                        <h2>{isEditMode ? 'Edit Control Details' : 'Add Control Details'}</h2>
                        <button className="review-date-close" onClick={onClose} title="Close Popup">×</button>
                    </div>

                    <div className="ibra-popup-page-form-group-main-container">
                        <div className="ibra-popup-page-form-group-main-container-2 scrollable-container-controlea">
                            <div className="cea-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group inline-field">
                                    <label style={{ marginRight: '40px', textAlign: "left" }}>Control</label>
                                    <textarea
                                        className="cea-popup-page-text-area-input"
                                        value={controlName}
                                        onChange={(e) => setControlName(e.target.value)}
                                        style={{ resize: "none" }}
                                    />
                                </div>
                            </div>

                            <div className="cea-4-row">
                                <div className="cea-column-fourth">
                                    <div className="cea-popup-page-component-wrapper">
                                        <div className="ibra-popup-page-form-group">
                                            <label><FontAwesomeIcon icon={faInfoCircle} style={{ cursor: 'pointer' }} onClick={openHelpCritical} className="ibra-popup-label-icon" />Critical Control </label>
                                            <div className="ibra-popup-page-select-container">
                                                <select
                                                    className="ibra-popup-page-select"
                                                    value={criticalControl}
                                                    onChange={(e) => setCriticalControl(e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value='Yes'>Yes</option>
                                                    <option value='No'>No</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cea-column-fourth">
                                    <div className="cea-popup-page-component-wrapper">
                                        <div className="ibra-popup-page-form-group">
                                            <label><FontAwesomeIcon icon={faInfoCircle} style={{ cursor: 'pointer' }} onClick={openHelpCT} className="ibra-popup-label-icon" />Act, Object or System </label>
                                            <div className="ibra-popup-page-select-container">
                                                <select
                                                    className="ibra-popup-page-select"
                                                    value={controlType}
                                                    onChange={(e) => setControlType(e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    {
                                                        controlTypeOptions.map((option, index) => (
                                                            <option key={index} value={option}>
                                                                {option}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cea-column-fourth">
                                    <div className="cea-popup-page-component-wrapper">
                                        <div className="ibra-popup-page-form-group">
                                            <label style={{ marginLeft: '6px' }}><FontAwesomeIcon icon={faInfoCircle} onClick={openHelpCA} style={{ cursor: 'pointer' }} className="ibra-popup-label-icon" />Control Activation </label>
                                            <div className="ibra-popup-page-select-container">
                                                <select
                                                    className="ibra-popup-page-select"
                                                    value={controlActivation}
                                                    style={{ paddingRight: "30px" }}
                                                    onChange={(e) => setControlActivation(e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    {
                                                        activationOptions.map((option, index) => {
                                                            const displayLabel = option.replace(/ ?[Cc]ontrol\b/, '');
                                                            return (
                                                                <option key={index} value={option}>
                                                                    {displayLabel}
                                                                </option>
                                                            );
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cea-column-fourth">
                                    <div className="cea-popup-page-component-wrapper">
                                        <div className="ibra-popup-page-form-group">
                                            <label><FontAwesomeIcon icon={faInfoCircle} style={{ cursor: 'pointer' }} onClick={openHelpHier} className="ibra-popup-label-icon" />Hierarchy of Controls </label>
                                            <div className="ibra-popup-page-select-container">
                                                <select
                                                    className="ibra-popup-page-select"
                                                    value={hierarchy}
                                                    onChange={(e) => setHierarchy(e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    {
                                                        hierarchyOptions.map((option, index) => (
                                                            <option key={index} value={option}>
                                                                {option}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ibra-popup-page-additional-row">
                                <div className="ibra-popup-page-column-half">
                                    <div className="cea-popup-page-component-wrapper">
                                        <div className="ibra-popup-page-form-group">
                                            <label>Specific Consequence that the Control Aims to Address </label>
                                            <div className="ibra-popup-page-select-container">
                                                <select
                                                    className="ibra-popup-page-select"
                                                    value={controlAim}
                                                    onChange={(e) => setControlAim(e.target.value)}
                                                >
                                                    <option value="">Select Consequence</option>
                                                    {
                                                        aimOptions.sort().map((option, index) => (
                                                            <option key={index} value={option}>
                                                                {option}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ibra-popup-page-column-half">
                                    <div className="ibra-popup-page-additional-row">
                                        <div className="ibra-popup-page-column-half">
                                            <div className="ibra-popup-page-additional-row">
                                                <div className="cea-popup-page-component-wrapper-control-management">
                                                    <div className="ibra-popup-page-form-group">
                                                        <label><FontAwesomeIcon icon={faInfoCircle} style={{ cursor: 'pointer' }} onClick={openHelpQuality} className="ibra-popup-label-icon" />Quality</label>
                                                        <div className="ibra-popup-page-select-container">
                                                            <select
                                                                className="ibra-popup-page-select"
                                                                value={quality}
                                                                onChange={(e) => setQuality(e.target.value)}
                                                            >
                                                                <option value="">Select Quality</option>
                                                                {
                                                                    qualityOptions.map((option, index) => (
                                                                        <option key={index} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ibra-popup-page-column-half">
                                            <div className="ibra-popup-page-additional-row">
                                                <div className="cea-popup-page-component-wrapper-control-management">
                                                    <div className="ibra-popup-page-form-group">
                                                        <label>Category</label>
                                                        <div className="ibra-popup-page-select-container">
                                                            <select
                                                                className="ibra-popup-page-select"
                                                                value={category}
                                                                onChange={(e) => setCategory(e.target.value)}
                                                            >
                                                                <option value="">Select Category</option>
                                                                {
                                                                    categoryOptions.map((option, index) => (
                                                                        <option key={index} value={option.category}>
                                                                            {option.category}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ibra-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group">
                                    <label style={{ fontSize: "15px" }}>Description of Control</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="cea-popup-page-textarea-full"
                                        placeholder="Description of control"
                                        style={{ resize: "none" }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="ibra-popup-page-component-wrapper">
                                <div className="ibra-popup-page-form-group">
                                    <label style={{ fontSize: "15px" }}>Performance Requirements and Verification</label>
                                    <textarea
                                        value={performance}
                                        onChange={(e) => setPerformance(e.target.value)}
                                        className="cea-popup-page-textarea-full"
                                        placeholder="Performance requirement of control"
                                        style={{ resize: "none" }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ibra-popup-page-form-footer">
                        <div className="create-user-buttons">
                            <button
                                className="ibra-popup-page-upload-button"
                                onClick={handleSubmit}
                            >
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : (isEditMode ? `Save Changes` : `Submit`)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {helpCT && (<ControlType setClose={closeHelpCT} />)}
            {helpCA && (<ControlActivation setClose={closeHelpCA} />)}
            {helpHier && (<ControlHierarchy setClose={closeHelpHier} />)}
            {helpCritical && (<CriticalControl setClose={closeHelpCritical} />)}
            {helpQuality && (<ControlQuality setClose={closeHelpQuality} />)}
        </div>
    );
};

export default AddControlDetailsPopup;