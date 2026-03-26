import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { checkIpInfo } from '../utils/securityScanners';

const NetworkToolPage = () => {
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState('analyzing');
    const [isVpnLikely, setIsVpnLikely] = useState(false);

    const fetchIpData = async () => {
        setLoading(true);
        setAnalysis('analyzing');
        try {
            const result = await checkIpInfo();
            setIpData(result.raw);
            setIsVpnLikely(result.isVpn);
            setAnalysis(result.isSafe ? 'safe' : 'exposed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIpData();
    }, []);

    const isSafe = analysis === 'safe';

    /* Inline styles so they work even when Tailwind purges/misses arbitrary values */
    const cardBorder = isSafe
        ? '1px solid rgba(52, 211, 153, 0.4)'
        : '1px solid rgba(239, 68, 68, 0.4)';

    const cardGlow = isSafe
        ? '0 0 30px rgba(52,211,153,0.15), 0 4px 6px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
        : '0 0 30px rgba(239,68,68,0.15), 0 4px 6px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)';

    const iconBg = isSafe
        ? 'rgba(52, 211, 153, 0.2)'
        : 'rgba(239, 68, 68, 0.2)';

    const iconGlow = isSafe
        ? '0 0 20px rgba(52,211,153,0.4)'
        : '0 0 20px rgba(239,68,68,0.4)';

    const accentColor = isSafe ? 'rgb(52, 211, 153)' : 'rgb(239, 68, 68)';
    const barBg = isSafe ? 'rgb(52, 211, 153)' : 'rgb(239, 68, 68)';

    return (
        <>
            <Header title="Network Tools" subtitle="Analyze your network connection and visibility." />

            <div className="flex flex-col md:grid md:grid-cols-2 gap-6">

                {/* ── Main Status Card ── */}
                <div
                    style={{
                        background: 'linear-gradient(to bottom right, rgba(30,41,59,0.85), rgba(15,23,42,0.85))',
                        border: cardBorder,
                        boxShadow: cardGlow,
                        backdropFilter: 'blur(12px)',
                        borderRadius: '0.75rem',
                        position: 'relative',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '1rem',
                    }}
                >
                    {/* Top colored bar */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: barBg,
                        borderRadius: '0.75rem 0.75rem 0 0',
                    }} />

                    {/* Shield Icon */}
                    <div style={{
                        padding: '1rem',
                        borderRadius: '50%',
                        background: iconBg,
                        boxShadow: iconGlow,
                        marginTop: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Icon
                            name={isSafe ? 'shieldCheck' : 'shieldAlert'}
                            style={{ width: '3.5rem', height: '3.5rem', color: accentColor }}
                            className={isSafe ? 'text-success' : 'text-danger'}
                        />
                    </div>

                    {/* Status Label */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgb(241,245,249)', marginBottom: '0.25rem' }}>
                            {loading ? 'Scanning...' : isSafe ? 'Likely Protected' : 'Likely Exposed'}
                        </h2>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentColor }}>
                            {loading ? 'Analyzing network' : isSafe ? 'VPN / Proxy Detected' : 'Residential ISP Detected'}
                        </p>
                    </div>

                    {/* Loading spinner */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgb(148,163,184)' }}>
                            <Icon name="refreshCw" className="w-4 h-4 animate-spin" />
                            <span>Scanning network...</span>
                        </div>
                    )}

                    {/* IP Data */}
                    {!loading && ipData && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* IP Address Box */}
                            <div style={{
                                background: 'rgba(2, 6, 23, 0.6)',
                                border: '1px solid rgba(56,189,248,0.15)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                backdropFilter: 'blur(8px)',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'rgb(148,163,184)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                    Public IP Address
                                </p>
                                <p style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: accentColor,
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    lineHeight: 1.4,
                                    fontSize: 'clamp(0.85rem, 4vw, 1.5rem)',
                                }}>
                                    {ipData.ip}
                                </p>
                            </div>

                            {/* ISP + Location row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>

                                {/* ISP */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                                        <Icon name="database" className="w-3.5 h-3.5 text-text-secondary" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.65rem', color: 'rgb(148,163,184)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ISP</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgb(226,232,240)', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                                        {ipData.org || 'Unknown'}
                                    </p>
                                    <p style={{ fontSize: '0.65rem', color: 'rgb(100,116,139)', marginTop: '0.2rem' }}>
                                        {isVpnLikely ? '(Datacenter)' : '(Residential)'}
                                    </p>
                                </div>

                                {/* Location */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                                        <Icon name="globe" className="w-3.5 h-3.5 text-text-secondary" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.65rem', color: 'rgb(148,163,184)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgb(226,232,240)', wordBreak: 'break-word', lineHeight: 1.35 }}>
                                        {ipData.city}{ipData.country_code ? `, ${ipData.country_code}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '0.5rem', padding: '0.75rem', color: 'rgb(239,68,68)',
                            width: '100%', textAlign: 'left',
                        }}>
                            <Icon name="alertTriangle" className="w-5 h-5 flex-shrink-0" />
                            <span style={{ fontSize: '0.85rem' }}>{error}</span>
                        </div>
                    )}
                </div>

                {/* ── Right Column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Detailed Analysis Card */}
                    <div style={{
                        background: 'linear-gradient(to bottom right, rgba(30,41,59,0.85), rgba(15,23,42,0.85))',
                        border: '1px solid rgba(56,189,248,0.1)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'rgb(241,245,249)', marginBottom: '1rem' }}>
                            <Icon name="radio" className={`w-5 h-5 ${isSafe ? 'text-success' : 'text-danger'}`} />
                            Detailed Analysis
                        </h3>

                        {/* Traffic status item */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56,189,248,0.1)',
                            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
                        }}>
                            <div style={{
                                width: '0.65rem', height: '0.65rem', borderRadius: '50%', flexShrink: 0, marginTop: '0.3rem',
                                background: accentColor,
                                boxShadow: `0 0 8px ${accentColor}`,
                            }} />
                            <div>
                                <p style={{ fontWeight: 700, color: 'rgb(226,232,240)', fontSize: '0.9rem' }}>
                                    {isSafe ? 'Traffic Appears Masked' : 'Traffic Appears Direct'}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'rgb(148,163,184)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                    {isSafe
                                        ? 'Your IP belongs to a hosting/VPN provider, which usually means your identity is masked.'
                                        : 'Your IP belongs to a standard residential ISP, meaning your physical location is likely visible.'}
                                </p>
                            </div>
                        </div>

                        {/* Re-scan button row */}
                        <div style={{
                            background: 'linear-gradient(to right, rgba(56,189,248,0.08), transparent)',
                            borderRadius: '0.5rem', padding: '0.75rem',
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        }} className="sm:flex-row sm:items-center sm:justify-between">
                            <p style={{ fontSize: '0.78rem', color: 'rgb(148,163,184)' }}>
                                Accuracy 85% • Heuristic Analysis
                            </p>
                            <Button
                                onClick={fetchIpData}
                                className="w-full sm:w-auto text-white hover:bg-white/10"
                                variant="secondary"
                            >
                                <Icon name="refreshCw" className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Re-scan
                            </Button>
                        </div>
                    </div>

                    {/* Privacy Details Card */}
                    <div style={{
                        background: 'linear-gradient(to bottom right, rgba(30,41,59,0.85), rgba(15,23,42,0.85))',
                        border: '1px solid rgba(56,189,248,0.1)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'rgb(241,245,249)', marginBottom: '1rem' }}>
                            <Icon name="info" className="w-5 h-5 text-accent" />
                            Privacy Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {[
                                { label: 'Connection Protocol', value: ipData?.ip?.includes(':') ? 'IPv6' : 'IPv4' },
                                { label: 'Timezone', value: ipData?.timezone || (loading ? 'Scanning...' : '—') },
                                { label: 'Region Code', value: ipData?.region_code || (loading ? '...' : '—') },
                            ].map((row, i, arr) => (
                                <div key={row.label} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.6rem 0',
                                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    gap: '0.5rem',
                                }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgb(148,163,184)', flexShrink: 0 }}>{row.label}</span>
                                    <span style={{
                                        fontSize: '0.85rem', color: 'rgb(226,232,240)', fontFamily: i === 0 ? 'monospace' : undefined,
                                        background: i === 0 ? 'rgba(15,23,42,0.6)' : undefined,
                                        padding: i === 0 ? '0.1rem 0.4rem' : undefined,
                                        borderRadius: i === 0 ? '0.25rem' : undefined,
                                        textAlign: 'right',
                                        wordBreak: 'break-all',
                                    }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── VPN Suggestion Banner (shown when exposed) ── */}
            {!loading && !isSafe && (
                <div style={{
                    marginTop: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(239,68,68,0.06) 100%)',
                    border: '1px solid rgba(234,179,8,0.25)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    backdropFilter: 'blur(12px)',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(234,179,8,0.15)',
                            boxShadow: '0 0 12px rgba(234,179,8,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon name="shieldAlert" className="w-4 h-4" style={{ color: 'rgb(234,179,8)' }} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgb(234,179,8)', margin: 0 }}>
                                Your IP is Visible to Your ISP
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgb(148,163,184)', margin: 0 }}>
                                Your internet provider can see every website you visit
                            </p>
                        </div>
                    </div>

                    {/* What ISP can see */}
                    <div style={{
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                    }}>
                        <p style={{ fontSize: '0.78rem', color: 'rgb(252,165,165)', fontWeight: 600, marginBottom: '0.4rem' }}>
                            ⚠ Without a VPN, your ISP can log:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                            {['All websites you visit', 'Your real location', 'Browsing timestamps', 'App usage patterns'].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ color: 'rgb(239,68,68)', fontSize: '0.7rem' }}>✗</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgb(203,213,225)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* What VPN fixes */}
                    <div style={{
                        background: 'rgba(52,211,153,0.06)',
                        border: '1px solid rgba(52,211,153,0.15)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                    }}>
                        <p style={{ fontSize: '0.78rem', color: 'rgb(110,231,183)', fontWeight: 600, marginBottom: '0.4rem' }}>
                            ✓ A VPN encrypts your traffic and hides it from your ISP:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                            {['Hides your real IP address', 'Encrypts all traffic', 'Masks your location', 'Prevents ISP tracking'].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ color: 'rgb(52,211,153)', fontSize: '0.7rem' }}>✓</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgb(203,213,225)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.85rem' }} />

                    {/* Recommended VPNs */}
                    <p style={{ fontSize: '0.75rem', color: 'rgb(148,163,184)', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Trusted VPN Options
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        {[
                            { name: 'ProtonVPN', tag: 'Free tier', color: 'rgb(109,167,255)', tagColor: 'rgba(52,211,153,0.15)', tagText: 'rgb(52,211,153)' },
                            { name: 'Mullvad', tag: 'No logs', color: 'rgb(251,191,36)', tagColor: 'rgba(251,191,36,0.15)', tagText: 'rgb(251,191,36)' },
                            { name: 'Windscribe', tag: '10GB free', color: 'rgb(167,139,250)', tagColor: 'rgba(167,139,250,0.15)', tagText: 'rgb(167,139,250)' },
                        ].map(vpn => (
                            <div key={vpn.name} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '0.5rem',
                                padding: '0.6rem 0.5rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: vpn.color, marginBottom: '0.25rem' }}>{vpn.name}</p>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 600,
                                    background: vpn.tagColor, color: vpn.tagText,
                                    borderRadius: '999px', padding: '0.1rem 0.4rem',
                                }}>{vpn.tag}</span>
                            </div>
                        ))}
                    </div>

                    {/* Note */}
                    <p style={{ fontSize: '0.7rem', color: 'rgb(100,116,139)', lineHeight: 1.5 }}>
                        💡 <strong style={{ color: 'rgb(148,163,184)' }}>Tip:</strong> For maximum privacy, combine a VPN with a privacy-respecting DNS (e.g., 1.1.1.1 or 9.9.9.9) so even your DNS queries are hidden from your ISP.
                    </p>
                </div>
            )}
        </>
    );
};

export default NetworkToolPage;

