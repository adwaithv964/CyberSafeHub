import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { callGeminiAPI } from '../utils/geminiApi';
import ReactMarkdown from 'react-markdown';
import { checkIpInfo, checkBrowserSecurity, checkBreaches, checkBatteryFingerprinting, checkCyberHygiene } from '../utils/securityScanners';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../utils/activityLogger';

const HealthCheckPage = () => {
    const { currentUser } = useAuth();
    const [scanState, setScanState] = useState('idle'); // idle, scanning, results, history
    const [currentStep, setCurrentStep] = useState(0);
    const [scanResults, setScanResults] = useState(null);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);

    // Background Monitoring State
    const [liveStatus, setLiveStatus] = useState({ status: 'active', message: 'Monitoring protected' });

    const scanSteps = [
        "Analyzing network connection...",
        "Checking browser security settings...",
        "Scanning for data breaches...",
        "Analyzing device security...",
        "Reviewing cyber hygiene...",
        "Compiling security report...",
    ];

    // --- Load History ---
    useEffect(() => {
        const savedHistory = localStorage.getItem('healthCheckHistory');
        if (savedHistory) {
            setScanHistory(JSON.parse(savedHistory));
        }
    }, []);

    // --- Background Monitoring ---
    useEffect(() => {
        const runBackgroundChecks = async () => {
            // Quick Browser/IP Check
            const ipData = await checkIpInfo().catch(() => ({ isSafe: false }));
            const browserData = checkBrowserSecurity();

            if (!ipData.isSafe) {
                setLiveStatus({ status: 'warning', message: 'IP is exposed' });
            } else if (browserData.scoreImpact < 0) {
                setLiveStatus({ status: 'warning', message: 'Browser settings need attention' });
            } else {
                setLiveStatus({ status: 'active', message: 'Monitoring protected' });
            }
        };

        runBackgroundChecks();
        const interval = setInterval(runBackgroundChecks, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);


    // --- Active Scan Logic ---
    const runFullScan = async () => {
        setScanState('scanning');
        setCurrentStep(0);
        setAiSummary('');

        const findings = [];
        let score = 100;
        const roadmap = [];

        try {
            // Step 1: Network
            await new Promise(r => setTimeout(r, 800));
            setCurrentStep(1);
            const ipResult = await checkIpInfo().catch(e => ({ isSafe: false, details: 'Could not check IP' }));

            if (!ipResult.isSafe) {
                findings.push({ text: "IP Address is exposed (Residential ISP detected)", severity: 'medium' });
                score -= 10;
                roadmap.push({ text: "Use a VPN to mask your online location", done: false });
            } else {
                findings.push({ text: "IP Identity is masked (VPN/Hosting detected)", severity: 'low' });
            }

            // Step 2: Browser
            await new Promise(r => setTimeout(r, 800));
            setCurrentStep(2);
            const browserResult = checkBrowserSecurity();
            findings.push(...browserResult.findings);
            score += browserResult.scoreImpact;
            if (browserResult.scoreImpact < 0) {
                roadmap.push({ text: "Ensure connection is secure (Force HTTPS)", done: false });
            }

            // Step 3: Breaches
            await new Promise(r => setTimeout(r, 800));
            setCurrentStep(3);
            let breachResult = { found: false, breaches: [] };
            if (currentUser && currentUser.email) {
                breachResult = await checkBreaches(currentUser.email).catch(e => ({ found: false, breaches: [] }));
                if (breachResult.found) {
                    findings.push({ text: `Email found in ${breachResult.breaches.length} data breaches`, severity: 'high' });
                    score -= 30;
                    roadmap.push({ text: "Change passwords for accounts linked to your email immediately", done: false });
                } else {
                    findings.push({ text: `No breaches found for ${currentUser.email}`, severity: 'low' });
                }
            } else {
                findings.push({ text: "Skipped breach check (No email logged in)", severity: 'low' });
            }

            // Step 4: Battery / Fingerprinting
            await new Promise(r => setTimeout(r, 800));
            setCurrentStep(4);
            const batteryResult = await checkBatteryFingerprinting();
            if (batteryResult.exposed) {
                findings.push({ text: `Hardware: ${batteryResult.message} (${batteryResult.details})`, severity: 'medium' });
                score -= 5;
                roadmap.push({ text: "Consider using a browser that blocks Battery API fingerprinting", done: false });
            }

            // Step 5: Cyber Hygiene
            await new Promise(r => setTimeout(r, 800));
            setCurrentStep(5);
            const hygieneResult = checkCyberHygiene();
            findings.push(...hygieneResult.findings);
            score += hygieneResult.scoreImpact;
            if (hygieneResult.scoreImpact < 0) {
                roadmap.push({ text: "Review your password reuse habits. Use the Password Vault to generate unique credentials.", done: false });
            } else {
                findings.push({ text: "Cyber Hygiene: Good local storage practices detected.", severity: 'low' });
            }

            // Finalize
            const finalScore = Math.max(0, score);
            const newResult = {
                score: finalScore,
                findings: findings.sort((a, b) => (a.severity === 'high' ? -1 : 1)),
                roadmap,
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
            };

            setScanResults(newResult);
            setCurrentStep(6);
            setScanState('results');

            // Save to History
            const updatedHistory = [newResult, ...scanHistory].slice(0, 10); // Keep last 10
            setScanHistory(updatedHistory);
            localStorage.setItem('healthCheckHistory', JSON.stringify(updatedHistory));

            // Log Activity
            logActivity('SCAN', 'Health Check Completed', `Score: ${finalScore}/100`);

        } catch (error) {
            console.error("Scan failed", error);
            setScanState('idle');
        }
    };


    const getAISummary = async () => {
        setIsGeneratingSummary(true);
        const findingsText = scanResults.findings.map(f => `- ${f.text} (Severity: ${f.severity})`).join('\n');
        const systemPrompt = "You are a friendly, encouraging cybersecurity coach. A user has just completed a security health check. Based on their results, provide a short, easy-to-understand summary. Congratulate them on what they're doing well, gently point out the key area for improvement, and motivate them to follow their new roadmap. Keep it under 100 words.";
        const userPrompt = `My security scan information:\nScore: ${scanResults.score}/100\n\nFindings:\n${findingsText}\n\nPlease give me a summary of my results.`;

        const summary = await callGeminiAPI([{ sender: 'user', text: userPrompt }], systemPrompt);
        setAiSummary(summary);
        setIsGeneratingSummary(false);
    };

    const getScoreColor = (score) => {
        if (score > 80) return 'text-green-500';
        if (score > 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Security Health Check</h2>
                    <p className="text-gray-500 dark:text-gray-400">Get a comprehensive overview of your security posture and a personalized roadmap.</p>
                </div>
                {/* Live Monitor Widget */}
                <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border ${liveStatus.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${liveStatus.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${liveStatus.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    </div>
                    <span className="text-sm font-medium">{liveStatus.message}</span>
                </div>
            </header>

            <div className="glass-panel p-8">
                {scanState === 'idle' && (
                    <div className="text-center max-w-md mx-auto">
                        <Icon name="checkCircle" className="w-20 h-20 mx-auto text-blue-500" />
                        <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Ready to Check Your Security Health?</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Our comprehensive scan will analyze key areas of your digital life to identify vulnerabilities and provide you with a clear action plan.</p>

                        <div className="flex flex-col gap-4 mt-8">
                            <button onClick={runFullScan} className="px-10 py-4 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition-colors">Start Health Check</button>
                            {scanHistory.length > 0 && (
                                <button onClick={() => setScanState('history')} className="px-10 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">View Past Results</button>
                            )}
                        </div>
                    </div>
                )}

                {scanState === 'history' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Scan History</h3>
                            <button onClick={() => setScanState('idle')} className="text-blue-600 hover:underline">Back to Scanner</button>
                        </div>
                        <div className="space-y-4">
                            {scanHistory.map((scan, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-glass-border rounded-lg hover:bg-glass-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${scan.score > 80 ? 'bg-green-100 text-green-700' : scan.score > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {scan.score}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{scan.date}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{scan.findings.length} issues found</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setScanResults(scan); setScanState('results'); }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {scanState === 'scanning' && (
                    <div className="text-center max-w-lg mx-auto">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Scanning Your Security...</h3>
                        <div className="mt-6 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(currentStep / scanSteps.length) * 100}%` }}></div>
                        </div>
                        <p className="mt-3 text-gray-600 dark:text-gray-300 h-6">{scanSteps[currentStep] || 'Finalizing...'}</p>
                    </div>
                )}

                {scanState === 'results' && scanResults && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setScanState('idle')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Icon name="arrowLeft" className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Scan Results</h3>
                            </div>

                            <div className="text-center p-6 bg-glass-200 rounded-xl">
                                <p className="text-gray-600 dark:text-gray-300">Overall Security Score</p>
                                <p className={`text-7xl font-bold my-2 ${getScoreColor(scanResults.score)}`}>{scanResults.score}<span className="text-4xl">/100</span></p>
                                <p className="text-sm text-gray-400">{scanResults.date}</p>
                            </div>

                            {!aiSummary && (
                                <div className="text-center mt-6">
                                    <button onClick={getAISummary} disabled={isGeneratingSummary} className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                                        {isGeneratingSummary ? 'Generating...' : <><Icon name="sparkles" className="w-5 h-5" /> Get AI-Powered Summary</>}
                                    </button>
                                </div>
                            )}

                            {aiSummary && (
                                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                                    <h4 className="font-bold text-lg text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5" /> AI Summary</h4>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-700 dark:text-indigo-300">
                                        <ReactMarkdown>{aiSummary}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mt-6 mb-3">Key Findings</h4>
                            <ul className="space-y-3">
                                {scanResults.findings.map((finding, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Icon name={finding.severity === 'high' ? 'alertTriangle' : 'checkCircle'} className={`w-5 h-5 ${finding.severity === 'high' ? 'text-red-500' : finding.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">{finding.text}</span>
                                    </li>
                                ))}
                            </ul>

                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Personalized Roadmap</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">Complete these steps to boost your security score.</p>
                            <ul className="space-y-3">
                                {scanResults.roadmap.length > 0 ? (
                                    scanResults.roadmap.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 p-3 bg-glass-200 rounded-lg">
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                                        Great job! No critical actions pending.
                                    </li>
                                )}
                            </ul>
                            <div className="flex flex-col gap-3 mt-8">
                                <button onClick={runFullScan} className="w-full px-10 py-3 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition-colors">Rescan My Security</button>
                                <button onClick={() => setScanState('history')} className="w-full px-10 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">View History</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HealthCheckPage;
