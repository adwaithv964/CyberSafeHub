import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { checkIpInfo } from '../utils/securityScanners';

const NetworkToolPage = () => {
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState('analyzing'); // 'safe', 'exposed', 'analyzing'
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

    return (
        <>
            <Header title="Network Tools" subtitle="Analyze your network connection and visibility." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Scan Card */}
                <Card className={`p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden transition-colors duration-500 ${isSafe ? 'border-success/50 shadow-glow-success' : 'border-danger/50 shadow-glow-danger'}`}>

                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 inset-x-0 h-1 ${isSafe ? 'bg-success' : 'bg-danger'}`} />

                    <div className={`p-4 rounded-full transition-colors duration-500 ${isSafe ? 'bg-success/20' : 'bg-danger/20'}`}>
                        <Icon name={isSafe ? "shieldCheck" : "shieldAlert"} className={`w-16 h-16 ${isSafe ? 'text-success' : 'text-danger'}`} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">
                            {isSafe ? 'Likely Protected' : 'Likely Exposed'}
                        </h2>
                        <p className={`text-sm font-medium uppercase tracking-widest mt-1 ${isSafe ? 'text-success' : 'text-danger'}`}>
                            {isSafe ? 'VPN / Proxy Detected' : 'Residential ISP Detected'}
                        </p>
                    </div>

                    {loading ? (
                        <p className="text-text-primary animate-pulse flex items-center gap-2"><Icon name="refreshCw" className="w-4 h-4 animate-spin" /> Scanning network...</p>
                    ) : (
                        ipData && (
                            <div className="w-full space-y-6 mt-4 relative z-10">
                                <div className="bg-background/50 p-6 rounded-xl border border-border-color backdrop-blur-sm">
                                    <p className="text-sm text-text-secondary uppercase tracking-wider mb-1">Public IP Address</p>
                                    <p className={`text-3xl md:text-4xl font-mono font-bold drop-shadow-lg ${isSafe ? 'text-success' : 'text-danger'}`}>
                                        {ipData.ip}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon name="database" className="w-4 h-4 text-text-secondary" />
                                            <p className="text-xs text-text-secondary uppercase">ISP Classification</p>
                                        </div>
                                        <p className="font-semibold text-text-primary truncate" title={ipData.org}>
                                            {ipData.org}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {isVpnLikely ? '(Datacenter/Hosting)' : '(Residential/Standard)'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon name="globe" className="w-4 h-4 text-text-secondary" />
                                            <p className="text-xs text-text-secondary uppercase">Visible Location</p>
                                        </div>
                                        <p className="font-semibold text-text-primary">{ipData.city}, {ipData.country_code}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {error && (
                        <div className="text-danger flex items-center gap-2 bg-danger/10 p-3 rounded-lg">
                            <Icon name="alertTriangle" className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}
                </Card>

                <div className="space-y-6">
                    {/* Status & Analysis */}
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Icon name="radio" className={`w-5 h-5 ${isSafe ? 'text-success' : 'text-danger'}`} />
                            Detailed Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-background/30 rounded-lg border border-border-color">
                                <div className={`w-3 h-3 mt-1.5 rounded-full ${isSafe ? 'bg-success shadow-glow-success' : 'bg-danger shadow-glow-danger'}`}></div>
                                <div>
                                    <p className="text-text-primary font-bold">
                                        {isSafe ? 'Traffic Appears Masked' : 'Traffic Appears Direct'}
                                    </p>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {isSafe
                                            ? "Your IP belongs to a hosting/VPN provider, which usually means your identity is masked."
                                            : "Your IP belongs to a standard residential ISP, meaning your physical location is likely visible."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-primary/50 to-transparent p-4 rounded-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-text-secondary">
                                        Accuracy 85% • Heuristic Analysis
                                    </p>
                                </div>
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
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Icon name="info" className="w-5 h-5 text-accent" />
                            Privacy Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-text-secondary">Connection Protocol</span>
                                <span className="text-text-primary font-mono bg-background/50 px-2 py-1 rounded">IPv4</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-text-secondary">Timezone</span>
                                <span className="text-text-primary">{ipData?.timezone || 'Scanning...'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-secondary">Region Code</span>
                                <span className="text-text-primary">{ipData?.region_code || '...'}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default NetworkToolPage;
