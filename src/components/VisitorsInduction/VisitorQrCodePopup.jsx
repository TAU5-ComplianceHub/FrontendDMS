import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function safeFrontendBase() {
    try {
        return process.env.REACT_APP_FRONTEND_LINK;
    } catch {
        return window.location.origin;
    }
}

const VisitorQrCodePopup = ({
    onClose,
    profileId = '68cd13e0bb16bdbe346f669e',
    apiBase = `${process.env.REACT_APP_URL}/api/visitors`,
    qrDataUrl = '',
    qrPath = 'getVisitorQr',
}) => {
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState('');
    const [qr, setQr] = useState(qrDataUrl || '');

    const FRONTEND_BASE = useMemo(() => safeFrontendBase(), []);

    useEffect(() => {
        // If parent provided the QR already, just use it.
        if (qrDataUrl) {
            setQr(qrDataUrl);
            return;
        }

        let ignore = false;

        (async () => {
            setInitializing(true);
            setError('');

            if (!profileId) {
                setError('Missing profileId');
                setInitializing(false);
                return;
            }

            // Adjust this URL to match your backend.
            const url = `${apiBase}/${qrPath}/${profileId}`;

            try {
                const res = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: { Accept: 'application/json, text/plain;q=0.9,*/*;q=0.8' },
                });

                if (!res.ok) throw new Error(`HTTP_${res.status}`);

                const ct = res.headers.get('content-type') || '';
                let nextQr = '';

                if (ct.includes('application/json')) {
                    const data = await res.json();
                    nextQr = data.qr || data.dataUrl || data.image || data.qrCode || '';
                } else {
                    nextQr = (await res.text())?.trim();
                }

                if (!ignore) setQr(nextQr || '');
            } catch (e) {
                if (!ignore) {
                    setError('Could not load QR code');
                    setQr('');
                    toast.error('Could not load QR code');
                }
            } finally {
                if (!ignore) setInitializing(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [apiBase, FRONTEND_BASE, profileId, qrDataUrl, qrPath]);

    return (
        <div className="create-visitor-profile-page-container">
            <div className="create-visitor-profile-page-overlay">
                <div className="create-visitor-profile-page-popup-right-4">
                    <div className="create-visitor-profile-page-popup-header-right" style={{ paddingTop: "0px" }}>
                        <h2>Visitor QR Code</h2>
                        <button className="review-date-close" onClick={onClose} title="Close Popup">
                            ×
                        </button>
                    </div>

                    <div className="vqr-content">
                        {initializing ? (
                            <div className="vqr-loading">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        ) : error ? (
                            <div className="vqr-error">{error}</div>
                        ) : (
                            <div className="vqr-qr-wrap">
                                <img className="vqr-qr-img" src={qr} alt="Visitor QR Code" />
                            </div>
                        )}
                    </div>

                    {/* Footer removed intentionally (no button) */}
                </div>
            </div>
        </div>
    );
};

export default VisitorQrCodePopup;
