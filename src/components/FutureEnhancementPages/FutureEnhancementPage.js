import React, { useRef, useState } from 'react';
import './FutureEnhancementPage.css';
import { useNavigate } from 'react-router-dom';

const FutureEnhancementPage = () => {
    // refs for each of the three sections
    const navigate = useNavigate();
    const sectionRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    // track which section is currently active
    const [currentSection, setCurrentSection] = useState(0);

    const scrollToSection = (index) => {
        if (sectionRefs[index].current) {
            sectionRefs[index].current.scrollIntoView({ behavior: 'smooth' });
            setCurrentSection(index);
        }
    };

    const handleScrollDown = () => {
        if (currentSection < sectionRefs.length - 1) {
            scrollToSection(currentSection + 1);
        }
    };

    const handleScrollUp = () => {
        if (currentSection > 0) {
            scrollToSection(currentSection - 1);
        }
    };

    return (
        <div
            className="future-enhancement-page-container"
            style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
            <section
                ref={sectionRefs[0]}
                className="future-enhancement-page-section future-enhancement-page-section-1"
            >
                <img
                    src={`${process.env.PUBLIC_URL}/FI_Logo.svg`}
                    alt="Section 1 Illustration"
                    className="future-enhancement-page-section-1-image"
                />
                <p style={{ marginTop: "120px", fontSize: "20px", textAlign: "center", color: "black" }}>We are continuously exploring new ways to enhance the app’s functionality and user experience.<br />
                    Several new systems and modules are planned for development.</p>
            </section>

            <section
                ref={sectionRefs[2]}
                className="future-enhancement-page-section future-enhancement-page-section-3"
                style={{ flex: 1 }}
            >
                <h2 className="future-enhancement-page-section-3-header">Coming Soon
                </h2>
                <p className="future-enhancement-page-section-3-line">_______</p>
                <div className="future-enhancement-page-section-3-blocks">
                    {/* Block 1 */}
                    <div className="future-enhancement-page-section-2-block">
                        <div className='fi-card'>
                            <img
                                src={`${process.env.PUBLIC_URL}/CM.png`}
                                alt="Training Management System (TMS)"
                                className="future-enhancement-page-section-2-block-image-2"
                            />
                        </div>
                        <h3 className="future-enhancement-page-section-3-block-title">
                            Compliance Tracking System (CTS)
                        </h3>
                    </div>

                    {/* vertical divider */}
                    <div className="future-enhancement-page-section-3-divider" />

                    <div className="future-enhancement-page-section-3-block">
                        <div className='fi-card'>
                            <img
                                src={`${process.env.PUBLIC_URL}/ams.png`}
                                alt="Training Management System (TMS)"
                                className="future-enhancement-page-section-3-block-image"
                            />
                        </div>
                        <h3 className="future-enhancement-page-section-3-block-title">
                            Asset Management System (AMS)
                        </h3>
                    </div>

                    {/* vertical divider */}
                    <div className="future-enhancement-page-section-3-divider" />

                    {/* Block 2 */}
                    <div className="future-enhancement-page-section-3-block">
                        <div className='fi-card'>
                            <img
                                src={`${process.env.PUBLIC_URL}/crs.png`}
                                alt="Compliance Management System (CMS)"
                                className="future-enhancement-page-section-3-block-image-2"
                            />
                        </div>
                        <h3 className="future-enhancement-page-section-3-block-title">
                            Control Room System (CRS)
                        </h3>
                    </div>

                    <div className="future-enhancement-page-section-3-divider" />

                    {/* Block 2 */}
                    <div className="future-enhancement-page-section-3-block">
                        <div className='fi-card'>
                            <img
                                src={`${process.env.PUBLIC_URL}/fis.png`}
                                alt="Compliance Management System (CMS)"
                                className="future-enhancement-page-section-3-block-image-3"
                            />
                        </div>
                        <h3 className="future-enhancement-page-section-3-block-title">
                            Field Inspection System (FIS)
                        </h3>
                    </div>
                </div>

                <button className="logout-button-fi" onClick={() => navigate("/FrontendDMS/home")}>Back to Home</button>
            </section>
        </div>
    );
};

export default FutureEnhancementPage;
