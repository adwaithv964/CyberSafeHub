import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi, FaNetworkWired, FaServer, FaMobileAlt, FaLaptop, FaQuestion, FaExclamationTriangle, FaShieldAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const WiFiRadar = ({ onNavigate }) => {
    const [scanning, setScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [analyzingIds, setAnalyzingIds] = useState([]);
    const [error, setError] = useState(null);

    const startScan = async () => {
        setScanning(true);
        setError(null);
        setDevices([]); // Clear previous results
        try {
            // Use the actual backend endpoint:
            const response = await axios.get('http://localhost:3001/api/wifi-radar/scan');
            setDevices(response.data);
        } catch (err) {
            console.error("Scan failed:", err);
            // Fallback for demo if backend is not reachable/running
            setError("Scan failed. Ensure backend is running. Showing demo data.");

            // Mock data for demo purposes if real scan fails
            setTimeout(() => {
                setDevices([
                    { ip: '192.168.1.1', mac: '00:11:22:33:44:55', name: 'Gateway', vendor: 'Cisco', isSuspicious: false },
                    { ip: '192.168.1.15', mac: 'AA:BB:CC:DD:EE:FF', name: 'User-PC', vendor: 'Apple', isSuspicious: false },
                    { ip: '192.168.1.22', mac: '12:34:56:78:90:AB', name: '?Unknown?', vendor: 'Unknown', isSuspicious: false },
                ]);
            }, 1500);
        } finally {
            setScanning(false);
        }
    };

    const analyzeDevice = async (device) => {
        const id = device.mac || device.ip;
        setAnalyzingIds(prev => [...prev, id]);

        try {
            const response = await axios.post('http://localhost:3001/api/wifi-radar/analyze', {
                ip: device.ip,
                mac: device.mac
            });

            // Update device with analysis results
            setDevices(prevDevices => prevDevices.map(d => {
                if ((d.mac && d.mac === device.mac) || d.ip === device.ip) {
                    return { ...d, ...response.data, analyzed: true };
                }
                return d;
            }));

        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setAnalyzingIds(prev => prev.filter(pid => pid !== id));
        }
    };

    const getIcon = (vendor) => {
        if (!vendor) return <FaQuestion className="text-gray-400" />;
        const v = vendor.toLowerCase();
        if (v.includes('apple') || v.includes('samsung') || v.includes('google')) return <FaMobileAlt className="text-blue-400" />;
        if (v.includes('intel') || v.includes('dell')) return <FaLaptop className="text-green-400" />;
        if (v.includes('cisco') || v.includes('tp-link')) return <FaNetworkWired className="text-yellow-400" />;
        return <FaQuestion className="text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-cyan-50 p-6 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <header className="mb-10 text-center relative">
                    <button
                        onClick={() => onNavigate && onNavigate('tools')}
                        className="absolute left-0 top-1 text-cyan-500 hover:text-cyan-300 flex items-center gap-2 transition-colors font-bold z-20"
                    >
                        &larr; Back to Tools
                    </button>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 flex justify-center items-center gap-3">
                        <FaWifi className="text-cyan-400 animate-pulse" /> WiFi Radar
                    </h1>
                    <p className="text-cyan-200/70">Scan local network for devices & detect promiscuous nodes</p>
                </header>

                {/* Radar Visualization */}
                <div className="flex justify-center mb-12 relative h-64">
                    <div className="relative w-64 h-64 flex justify-center items-center">
                        {/* Rings */}
                        <div className="absolute border-2 border-cyan-500/30 rounded-full w-full h-full"></div>
                        <div className="absolute border-2 border-cyan-500/30 rounded-full w-3/4 h-3/4"></div>
                        <div className="absolute border-2 border-cyan-500/30 rounded-full w-1/2 h-1/2"></div>
                        <div className="absolute w-2 h-2 bg-cyan-500 rounded-full"></div>

                        {/* Sweep Line */}
                        {scanning && (
                            <motion.div
                                className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tl from-cyan-500/50 to-transparent top-0 left-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                style={{ borderRight: '2px solid cyan', borderRadius: '100% 0 0 0' }}
                            />
                        )}

                        {/* Dots for devices */}
                        <AnimatePresence>
                            {!scanning && devices.map((device, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`absolute w-3 h-3 rounded-full ${device.isPromiscuous ? 'bg-red-500 animate-ping' : 'bg-green-400'}`}
                                    style={{
                                        top: `${50 + (Math.sin(i) * 35)}%`,
                                        left: `${50 + (Math.cos(i) * 35)}%`
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <button
                        onClick={startScan}
                        disabled={scanning}
                        className={`px-8 py-3 rounded-full font-bold text-lg tracking-wider transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)] ${scanning ? 'bg-cyan-900 text-cyan-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                    >
                        {scanning ? 'SCANNING...' : 'START NETWORK SCAN'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6 text-center">
                        <FaExclamationTriangle className="inline-block mr-2" /> {error}
                    </div>
                )}

                {/* Device List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {devices.map((device, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gray-800/80 backdrop-blur-sm border ${device.isPromiscuous ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-cyan-500/30'} rounded-xl p-5 hover:border-cyan-400/60 transition-colors group`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${device.isPromiscuous ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                            {getIcon(device.vendor)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{device.name || 'Unknown Device'}</h3>
                                            <p className="text-xs text-gray-400 font-mono">{device.ip}</p>
                                        </div>
                                    </div>
                                    {device.isPromiscuous && (
                                        <FaExclamationTriangle className="text-red-500 text-xl animate-pulse" title="Suspicious Activity Detected" />
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">MAC:</span>
                                        <span className="text-cyan-300 font-mono text-xs">{device.mac || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Vendor:</span>
                                        <span className="text-gray-300">{device.vendor || 'Unknown'}</span>
                                    </div>
                                    {device.analyzed && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Risk Level:</span>
                                                <span className={`font-bold ${device.riskLevel === 'HIGH' ? 'text-red-500' : 'text-green-500'}`}>{device.riskLevel}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 italic">{device.message}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => analyzeDevice(device)}
                                    disabled={analyzingIds.includes(device.mac || device.ip) || device.analyzed}
                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                                ${device.analyzed
                                            ? 'bg-gray-700 text-gray-400 cursor-default'
                                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        }`}
                                >
                                    {analyzingIds.includes(device.mac || device.ip) ? (
                                        <><FaSearch className="animate-spin" /> Analyzing...</>
                                    ) : device.analyzed ? (
                                        <><FaShieldAlt /> Analysis Complete</>
                                    ) : (
                                        <><FaSearch /> Analyze Security</>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {devices.length === 0 && !scanning && !error && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No devices found. Click "Start Network Scan" to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WiFiRadar;
