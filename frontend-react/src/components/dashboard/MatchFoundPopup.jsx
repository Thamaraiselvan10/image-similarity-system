import React, { useEffect, useRef } from 'react';

export default function MatchFoundPopup({ scanResult, onViewDetails, onDismiss }) {
    const overlayRef = useRef(null);

    // Auto-scroll page to top when popup appears
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onDismiss();
    };

    const matches = scanResult?.matches || [];
    const score = matches.length > 0 ? Math.round((matches[0].similarity || 0) * 100) : 0;
    return (
        <div className="match-popup-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="match-popup pop-in">
                {/* Animated alert icon */}
                <div className="match-popup-icon-ring pulse-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>

                <h2 className="match-popup-title">Match Detected!</h2>
                <p className="match-popup-desc">
                    We found a <strong>high-confidence match</strong> of your image in the scanned databases.
                </p>

                {score > 0 && (
                    <div className="match-popup-score">
                        <span className="match-popup-score-value">{score}%</span>
                        <span className="match-popup-score-label">Similarity</span>
                    </div>
                )}

                <div className="match-popup-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>Review the matched image, confidence score, and source URL to decide your next steps — including filing a report or taking legal action.</span>
                </div>

                <button className="btn btn-primary match-popup-btn" onClick={onViewDetails}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View in Detail
                </button>


            </div>
        </div>
    );
}
