import React, { useState } from 'react';

// ── n8n Webhook URL ──
const N8N_WEBHOOK_URL = 'https://allianceoneauto.app.n8n.cloud/webhook-test/report-guide';

// Parses text and converts URLs into highlighted clickable link badges
function renderWithLinks(text) {
    const urlRegex = /(https?:\/\/[^\s,;)\]"]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noreferrer"
                title={part}
                style={{
                    color: '#be123c',
                    background: '#fff1f2',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    textDecoration: 'none',
                    border: '1px solid #fecdd3',
                    display: 'inline-block',
                    margin: '2px 3px',
                    wordBreak: 'break-all',
                    transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffe4e6'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
            >
                🔗 {part.length > 60 ? part.substring(0, 60) + '…' : part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

function StepCard({ number, text }) {
    const [expanded, setExpanded] = useState(false);

    // Extract bold title: text before first " — " or ": " if within 100 chars
    const dashIdx = text.indexOf(' — ');
    const colonIdx = text.indexOf(': ');
    let splitIdx = -1;
    if (dashIdx > 0 && dashIdx < 100) splitIdx = dashIdx;
    else if (colonIdx > 0 && colonIdx < 100) splitIdx = colonIdx;

    let title = '';
    let body = text;
    if (splitIdx > 0) {
        title = text.substring(0, splitIdx).replace(/^Step \d+[:.]\s*/i, '').trim();
        body = text.substring(splitIdx + (dashIdx === splitIdx ? 3 : 2)).trim();
    }

    const isLong = body.length > 220;
    const displayBody = isLong && !expanded ? body.substring(0, 220) + '…' : body;

    return (
        <div
            style={{
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                padding: '16px 18px', background: '#fff', borderRadius: '14px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(190,18,60,0.1)';
                e.currentTarget.style.borderColor = '#fecdd3';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#f3f4f6';
            }}
        >
            {/* Step Number Badge */}
            <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #be123c, #e11d48)',
                color: '#fff', fontWeight: '800', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 2px 8px rgba(190,18,60,0.3)',
            }}>
                {number}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: '4px' }}>
                {/* Bold title line */}
                {title && (
                    <div style={{
                        fontWeight: '700', fontSize: '14px', color: '#111827',
                        marginBottom: '8px', lineHeight: '1.4',
                    }}>
                        {title}
                    </div>
                )}
                {/* Body with URL highlights */}
                <div style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: '1.8' }}>
                    {renderWithLinks(displayBody)}
                    {isLong && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            style={{
                                marginLeft: '8px', background: 'none', border: 'none',
                                color: '#be123c', fontWeight: '600', fontSize: '12px',
                                cursor: 'pointer', padding: 0, textDecoration: 'underline',
                            }}
                        >
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f3f4f6', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '13px', background: '#f3f4f6', borderRadius: '6px', width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '6px', width: '85%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '6px', width: '65%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
        </div>
    );
}

function TakedownGuide({ sourceUrl }) {
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const fetchGuide = async () => {
        if (open && guide) { setOpen(false); return; }
        setOpen(true);
        if (guide) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sourceUrl }),
            });
            if (!res.ok) throw new Error(`Request failed (status ${res.status})`);
            const text = await res.text();
            if (!text || text.trim() === '' || text === 'undefined') throw new Error('Empty response from n8n workflow.');
            const data = JSON.parse(text);
            if (typeof data.steps === 'string') {
                try { data.steps = JSON.parse(data.steps); } catch { data.steps = [data.steps]; }
            }
            if (!Array.isArray(data.steps)) data.steps = [];
            setGuide(data);
        } catch (err) {
            setError(err.message || 'Could not reach the AI guide service.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '26px', borderRadius: '16px', border: '1.5px solid #fca5a5', overflow: 'hidden', background: '#fff' }}>

            {/* Header Bar */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #be123c, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(190,18,60,0.25)' }}>
                        🛡️
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#be123c', letterSpacing: '-0.01em' }}>AI-Powered Takedown Assistant</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Personalized removal steps generated by AI for this platform</div>
                    </div>
                </div>
                <button
                    onClick={fetchGuide}
                    disabled={loading}
                    style={{
                        padding: '10px 20px', borderRadius: '10px', border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        background: open ? 'rgba(190,18,60,0.1)' : 'linear-gradient(135deg, #be123c, #e11d48)',
                        color: open ? '#be123c' : '#fff',
                        fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s ease', opacity: loading ? 0.8 : 1,
                        boxShadow: open ? 'none' : '0 4px 12px rgba(190,18,60,0.3)',
                    }}
                >
                    {loading ? (
                        <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Generating...</>
                    ) : open ? '▲ Hide Guide' : '✨ Generate AI Guide'}
                </button>
            </div>

            {/* Content Panel */}
            {open && (
                <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease' }}>

                    {/* Error State */}
                    {error && (
                        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#dc2626', fontSize: '13px', display: 'flex', gap: '10px' }}>
                            <span>⚠️</span>
                            <div><strong>Error:</strong> {error}</div>
                        </div>
                    )}

                    {/* Loading Skeleton */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ height: '48px', background: '#f9fafb', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '8px' }} />
                            {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Guide Content */}
                    {guide && !loading && (
                        <>
                            {/* Platform Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', padding: '14px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>{guide.icon || '🌐'}</span>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '18px', color: guide.color || '#111' }}>{guide.platform}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Platform detected from source URL</div>
                                    </div>
                                </div>
                                {guide.estimated_time && (
                                    <div style={{ padding: '6px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>⏱️</span>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#15803d' }}>Est. response: {guide.estimated_time}</span>
                                    </div>
                                )}
                            </div>

                            {/* Steps Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '16px' }}>📋</span>
                                <span style={{ fontWeight: '700', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Step-by-Step Reporting Procedure
                                </span>
                                <span style={{ marginLeft: 'auto', padding: '3px 10px', background: '#fef2f2', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#be123c' }}>
                                    {guide.steps.length} steps
                                </span>
                            </div>

                            {/* Step Cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {guide.steps.map((step, i) => <StepCard key={i} number={i + 1} text={step} />)}
                            </div>

                            {/* Tip */}
                            {guide.tip && (
                                <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde047', borderRadius: '12px', marginBottom: '14px', display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '11px', color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Pro Tip</div>
                                        <div style={{ fontSize: '13px', color: '#713f12', lineHeight: '1.7' }}>{renderWithLinks(guide.tip)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Escalation */}
                            {guide.escalation && (
                                <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>🚨</span>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '11px', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>If Platform Doesn't Respond</div>
                                        <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.7' }}>{renderWithLinks(guide.escalation)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {guide.official_link && (
                                    <a href={guide.official_link} target="_blank" rel="noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', background: `linear-gradient(135deg, ${guide.color || '#be123c'}, ${guide.color || '#e11d48'})`, color: '#fff', fontWeight: '700', fontSize: '13px', boxShadow: `0 4px 12px ${guide.color || '#be123c'}40`, transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        🚩 Official Report Form ↗
                                    </a>
                                )}
                                {guide.dmca_link && (
                                    <a href={guide.dmca_link} target="_blank" rel="noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}>
                                        ⚖️ DMCA / Copyright Removal ↗
                                    </a>
                                )}
                                <a href="https://stopncii.org" target="_blank" rel="noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}>
                                    🤝 StopNCII.org ↗
                                </a>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Footer */}
            {!open && (
                <div style={{ padding: '10px 20px', borderTop: '1px solid #fef2f2', fontSize: '12px', color: '#9ca3af', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <a href="https://www.dmca.com/takedown.aspx" target="_blank" rel="noreferrer" style={{ color: '#be123c', textDecoration: 'none' }}>Universal DMCA Takedown</a>
                    <a href="https://stopncii.org" target="_blank" rel="noreferrer" style={{ color: '#be123c', textDecoration: 'none' }}>StopNCII.org</a>
                    <a href="https://cybercivilrights.org" target="_blank" rel="noreferrer" style={{ color: '#be123c', textDecoration: 'none' }}>Cyber Civil Rights Initiative</a>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}

export default function ResultStep({ isActive, scanResult, uploadedImage, onReset }) {
    if (!isActive) return null;

    const isSafe = scanResult?.status !== 'FOUND';
    const score = isSafe ? 0 : Math.round((scanResult?.similarity || 0) * 100);
    const sourceUrl = scanResult?.source_url || '#';

    let matchedImageUrl = null;
    if (scanResult?.file_path) {
        const filename = scanResult.file_path.split('/').pop().split('\\').pop();
        matchedImageUrl = `http://localhost:8000/matched-images/${encodeURIComponent(filename)}`;
    }

    setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    return (
        <section className="card result-area fade-in" id="results-section">
            {isSafe ? (
                <div id="result-safe">
                    <div className="result-badge safe-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Status: Safe
                    </div>
                    {uploadedImage && (
                        <div className="compare-grid safe-grid">
                            <div className="compare-card">
                                <span className="compare-label">Your Upload</span>
                                <div className="compare-img-wrap">
                                    <img src={uploadedImage} alt="Uploaded" />
                                </div>
                            </div>
                            <div className="compare-card compare-placeholder">
                                <span className="compare-label">No Match Found</span>
                                <div className="compare-img-wrap placeholder-wrap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <span>All Clear</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="result-desc">
                        No exact matches or manipulated variants of your image were found across the scanned networks. <strong>Your digital identity remains secure.</strong>
                    </p>
                </div>
            ) : (
                <div id="result-found">
                    <div className="result-badge found-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Status: Found
                    </div>
                    <p className="result-desc">
                        We detected a high-confidence match for your image in the scanned databases. Please review the details below.
                    </p>

                    <div className="compare-grid">
                        {uploadedImage && (
                            <div className="compare-card">
                                <span className="compare-label">Your Upload</span>
                                <div className="compare-img-wrap">
                                    <img src={uploadedImage} alt="Uploaded" />
                                </div>
                            </div>
                        )}
                        <div className="compare-card match-card">
                            <span className="compare-label match-label">Matched Image</span>
                            <div className="compare-img-wrap">
                                <img src={matchedImageUrl} alt="Matched" />
                            </div>
                        </div>
                    </div>

                    <div className="similarity-connector">
                        <div className="sim-line"></div>
                        <span className="sim-badge">{score}% Match</span>
                        <div className="sim-line"></div>
                    </div>

                    <div className="found-details">
                        <div className="detail-row">
                            <span className="detail-label">Confidence Score</span>
                            <span className="detail-value score">{score}%</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Source URL</span>
                            <a href={sourceUrl} className="detail-value link" target="_blank" rel="noreferrer">
                                {sourceUrl}
                            </a>
                        </div>
                    </div>

                    {sourceUrl && sourceUrl !== '#' && (
                        <TakedownGuide sourceUrl={sourceUrl} />
                    )}
                </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button className="btn" onClick={onReset} style={{ background: '#f0f2f8', color: '#5c6378' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Run Another Scan
                </button>
            </div>
        </section>
    );
}
