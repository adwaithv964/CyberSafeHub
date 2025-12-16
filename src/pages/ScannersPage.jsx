import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import ThemedModal from '../components/ThemedModal';
import Header from '../components/Header';
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';
import { checkBreaches } from '../utils/securityScanners';
import { logActivity } from '../utils/activityLogger';

// --- Shared History Logic ---
const useScannerHistory = (type) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadHistory = () => {
            const stored = JSON.parse(localStorage.getItem('scannerHistory') || '[]');
            setHistory(stored.filter(h => h.type === type));
        }
        loadHistory();
        // Listen for storage events to sync across tabs/components if needed,
        // but for now, we just load on mount. 
        // A custom event could be used for instant updates if the standard state update isn't enough,
        // but passing the add function handling state update locally is sufficient.
    }, [type]);

    const addHistoryItem = (item) => {
        const newItem = { ...item, id: Date.now(), type, date: new Date().toLocaleString() };
        const stored = JSON.parse(localStorage.getItem('scannerHistory') || '[]');
        const updated = [newItem, ...stored].slice(0, 20); // Keep last 20
        localStorage.setItem('scannerHistory', JSON.stringify(updated));
        setHistory(updated.filter(h => h.type === type));
    };

    const clearHistory = () => {
        const stored = JSON.parse(localStorage.getItem('scannerHistory') || '[]');
        const updated = stored.filter(h => h.type !== type);
        localStorage.setItem('scannerHistory', JSON.stringify(updated));
        setHistory([]);
    }

    return { history, addHistoryItem, clearHistory };
};

const ScannerHistory = ({ history, title, icon, clearHistory }) => {
    if (history.length === 0) return null;

    return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 w-full animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Icon name="clock" className="w-5 h-5 text-gray-500" />
                    Recent Scans
                </h4>
                <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">Clear History</button>
            </div>
            <div className="space-y-3">
                {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-full flex-shrink-0 ${item.status === 'safe' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Icon name={item.status === 'safe' ? 'checkCircle' : 'alertTriangle'} className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.target}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.resultText} • {item.date}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Sub-components are kept here for convenience but can be split further
const MalwareScanner = () => {
    const [file, setFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const { history, addHistoryItem, clearHistory } = useScannerHistory('malware');

    const showModal = (title, body) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            // 50MB limit
            if (selectedFile.size > 50 * 1024 * 1024) {
                showModal("File Too Large", "Please select a file smaller than 50MB.");
                return;
            }
            setFile(selectedFile);
            setScanResult(null);
            setError('');
        }
    };

    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleScan = async () => {
        if (!file) return;
        setIsScanning(true);
        setError('');
        setScanResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Connect to local backend
            const response = await fetch('http://localhost:3001/scan', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 500) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Server Error');
                }
                throw new Error(`Server returned ${response.status}. Ensure backend is running.`);
            }

            const data = await response.json();

            const result = {
                verdict: data.status === 'clean' ? 'Clean' : 'Malicious',
                details: data.viruses || [],
                message: data.message
            };

            setScanResult(result);

            // Add to history
            addHistoryItem({
                target: file.name,
                status: data.status === 'clean' ? 'safe' : 'unsafe',
                resultText: data.status === 'clean' ? 'Clean' : 'Threats Found'
            });

        } catch (err) {
            console.error("Scan error:", err);
            setError(err.message === 'Failed to fetch'
                ? 'Could not connect to scanner server. Is "node server/index.js" running?'
                : err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const resetScanner = () => {
        setFile(null);
        setScanResult(null);
        setIsScanning(false);
        setError('');
    };

    return (
        <>
            <ThemedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}>
                <p>{modalContent.body}</p>
            </ThemedModal>
            <div className="glass-panel p-8 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    {!file && !isScanning && !scanResult && (
                        <div
                            className={`p-10 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40' : 'border-gray-300 dark:border-gray-600'}`}
                            onDragEnter={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDrop={handleDrop}
                        >
                            <Icon name="uploadCloud" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Drag & drop your file here</p>
                            <p className="text-gray-500 dark:text-gray-400">or</p>
                            <label className="mt-2 inline-block px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
                                Browse File
                                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files[0])} />
                            </label>
                            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">Maximum file size: 50MB</p>
                        </div>
                    )}

                    {file && !isScanning && !scanResult && !error && (
                        <div className="text-center">
                            <Icon name="file" className="w-16 h-16 mx-auto text-blue-500" />
                            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">{file.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button onClick={handleScan} className="mt-6 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg">Scan Now</button>
                            <button onClick={resetScanner} className="mt-4 block mx-auto text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Cancel</button>
                        </div>
                    )}

                    {isScanning && (
                        <div>
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Scanning...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Checking {file.name} against virus signatures...</p>
                            <Icon name="refreshCw" className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center">
                            <Icon name="alertTriangle" className="w-16 h-16 mx-auto text-yellow-500" />
                            <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">Scanning Failed</h3>
                            <p className="text-red-500 mt-2">{error}</p>
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-left text-sm font-mono text-gray-600 dark:text-gray-400">
                                Tip: Ensure the backend server is running:<br />
                                1. Open new terminal<br />
                                2. cd server<br />
                                3. npm start
                            </div>
                            <button onClick={resetScanner} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Try Again</button>
                        </div>
                    )}

                    {scanResult && (
                        <div className="text-center">
                            {scanResult.verdict === 'Clean' ? <Icon name="checkCircle" className="w-20 h-20 mx-auto text-green-500" /> : <Icon name="shieldAlert" className="w-20 h-20 mx-auto text-red-500" />}
                            <h3 className={`mt-4 text-3xl font-bold ${scanResult.verdict === 'Clean' ? 'text-green-500' : 'text-red-500'}`}>File is {scanResult.verdict}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Finished scanning <span className="font-medium text-gray-800 dark:text-gray-100">{file.name}</span>.</p>

                            {scanResult.details && scanResult.details.length > 0 && (
                                <div className="mt-6 text-left w-full max-w-md mx-auto">
                                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Threats Found:</h4>
                                    <div className="mt-2 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-600">
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {scanResult.details.map((virus, i) => (
                                                <li key={i} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                                                    {virus}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <button onClick={resetScanner} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Scan Another File</button>
                        </div>
                    )}
                </div>

                <ScannerHistory history={history} clearHistory={clearHistory} />
            </div>
        </>
    );
};

const PhishingScanner = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');

    const { history, addHistoryItem, clearHistory } = useScannerHistory('phishing');

    const API_KEY = import.meta.env.VITE_GOOGLE_SAFE_BROWSING_API_KEY;

    const checkUrlSafety = async (urlToCheck) => {
        if (!API_KEY) {
            setError('Google Safe Browsing API Key is missing. Please configure VITE_GOOGLE_SAFE_BROWSING_API_KEY.');
            return null;
        }

        const apiEndpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
        const requestBody = {
            client: {
                clientId: "cyber-safe-hub",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [
                    { url: urlToCheck }
                ]
            }
        };

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                if (response.status === 400) throw new Error('Invalid API Request (400)');
                if (response.status === 403) throw new Error('Invalid API Key (403)');
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // If the object is empty or has no matches, it's safe
            if (!data || !data.matches || data.matches.length === 0) {
                return {
                    verdict: 'Safe',
                    explanation: 'Google Safe Browsing did not find any threats associated with this URL.'
                };
            } else {
                // Formatting the threat list for display
                const threats = data.matches.map(m => m.threatType).join(', ');
                return {
                    verdict: 'Unsafe',
                    explanation: `Google Safe Browsing detected threats: ${threats}. Do not visit this site.`
                };
            }

        } catch (err) {
            console.error("Safe Browsing API Error:", err);
            setError(err.message || 'Failed to scan URL');
            return null;
        }
    };

    const handleScan = async () => {
        if (!url) return;

        setError('');
        setScanResult(null);
        setIsScanning(true);

        const result = await checkUrlSafety(url);

        if (result) {
            setScanResult(result);
            // Add to history
            addHistoryItem({
                target: url,
                status: result.verdict === 'Safe' ? 'safe' : 'unsafe',
                resultText: result.verdict
            });
        }

        setIsScanning(false);
    };

    return (
        <div className="glass-panel p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                {!scanResult && !error ? (
                    <div className="max-w-xl mx-auto text-center">
                        <Icon name="link" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Google Safe Browsing Scanner</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Check URLs against Google's massive blacklist.</p>

                        {!API_KEY && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg border border-yellow-200 dark:border-yellow-800">
                                Note: No API configuration found. Scanner will return configuration error.
                            </div>
                        )}

                        <div className="mt-6 flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-grow p-3 glass-input "
                            />
                            <button
                                onClick={handleScan}
                                disabled={isScanning || !url}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
                            >
                                {isScanning ? 'Scanning...' : 'Scan URL'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        {/* Error State */}
                        {error && (
                            <div className="mb-6">
                                <Icon name="alertTriangle" className="w-16 h-16 mx-auto text-yellow-500" />
                                <h3 className="mt-4 text-2xl font-bold text-yellow-600">Scanner Error</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
                                <button onClick={() => { setError(''); setScanResult(null); }} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Try Again</button>
                            </div>
                        )}

                        {/* Result State */}
                        {scanResult && (
                            <>
                                {scanResult.verdict === 'Safe' ? <Icon name="shieldCheck" className="w-20 h-20 mx-auto text-green-500" /> : <Icon name="shieldAlert" className="w-20 h-20 mx-auto text-red-500" />}
                                <h3 className={`mt-4 text-3xl font-bold ${scanResult.verdict === 'Safe' ? 'text-green-500' : 'text-red-500'}`}>{scanResult.verdict}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm break-all"><span className="font-medium text-gray-800 dark:text-gray-100">{url}</span></p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">{scanResult.explanation}</p>
                                <button onClick={() => { setScanResult(null); setUrl(''); setError(''); }} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Scan Another URL</button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <ScannerHistory history={history} clearHistory={clearHistory} />
        </div>
    );
};

const BreachDetector = () => {
    const [email, setEmail] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null);
    const [actionPlan, setActionPlan] = useState('');
    const [error, setError] = useState('');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const { history, addHistoryItem, clearHistory } = useScannerHistory('breach');

    const handleCheck = async () => {
        if (!email) return;
        setIsChecking(true);
        setCheckResult(null);
        setActionPlan('');
        setError('');

        try {
            const result = await checkBreaches(email);
            setCheckResult(result);

            const isSafe = !result.found;
            const resultText = result.found ? `${result.breaches.length} Breaches` : 'Safe';

            if (result.found) {
                logActivity('SCAN', 'Breach Check: Compromised', `Email: ${email} found in ${result.breaches.length} breaches`);
            } else {
                logActivity('SCAN', 'Breach Check: Clean', `Email: ${email} is safe`);
            }

            // Add to history
            addHistoryItem({
                target: email,
                status: isSafe ? 'safe' : 'unsafe',
                resultText: resultText
            });

        } catch (err) {
            console.error("Breach check error:", err);
            setError('Error connecting to breach database. Please try again.');
            setCheckResult(null);
        } finally {
            setIsChecking(false);
        }
    };

    const handleGetActionPlan = async () => {
        setIsGeneratingPlan(true);
        const breachDetails = checkResult.breaches.map(b => `- ${b.name}: ${b.details}`).join('\n');
        const systemPrompt = "You are a cybersecurity incident response expert. A user has been found in data breaches. Based on the breach details provided, generate a clear, prioritized, step-by-step action plan for them to follow. Use headings and bullet points for clarity. Start with the most critical actions. The tone should be reassuring but firm.";
        const userPrompt = `I was found in the following data breaches:\n${breachDetails}\n\nPlease provide a step-by-step action plan.`;

        const plan = await callGeminiAPI(userPrompt, systemPrompt);
        setActionPlan(plan);
        setIsGeneratingPlan(false);
    };

    const reset = () => {
        setCheckResult(null);
        setEmail('');
        setActionPlan('');
    };

    return (
        <div className="glass-panel p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                {!checkResult ? (
                    <div className="max-w-xl mx-auto text-center">
                        <Icon name="user" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Data Breach Detector</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter an email address to see if it has been exposed in a known data breach.</p>
                        <div className="mt-6 flex flex-col md:flex-row gap-2">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="flex-grow p-3 glass-input" />
                            <button onClick={handleCheck} disabled={isChecking || !email} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500">{isChecking ? 'Checking...' : 'Check Email'}</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        {error ? (
                            <div className="mb-6">
                                <Icon name="alertTriangle" className="w-16 h-16 mx-auto text-yellow-500" />
                                <h3 className="mt-4 text-2xl font-bold text-yellow-600">Scanner Error</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
                                <button onClick={reset} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Try Again</button>
                            </div>
                        ) : (
                            <>
                                {checkResult.found ? <Icon name="shieldAlert" className="w-20 h-20 mx-auto text-red-500" /> : <Icon name="shieldCheck" className="w-20 h-20 mx-auto text-green-500" />}
                                <h3 className={`mt-4 text-3xl font-bold ${checkResult.found ? 'text-red-500' : 'text-green-500'}`}>{checkResult.found ? 'Breaches Found' : 'No Breaches Found'}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">We checked for <span className="font-medium text-gray-800 dark:text-gray-100">{email}</span> in our database.</p>
                                {checkResult.breaches.length > 0 && (
                                    <div className="mt-6 text-left w-full max-w-lg mx-auto">
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Exposure Details:</h4>
                                        <ul className="mt-2 space-y-3">
                                            {checkResult.breaches.map((breach, i) => (
                                                <li key={i} className="p-3 border rounded-lg border-gray-200 dark:border-gray-600">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{breach.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{breach.details}</p>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 text-center">
                                            {!actionPlan && (
                                                <button onClick={handleGetActionPlan} disabled={isGeneratingPlan} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                                                    {isGeneratingPlan ? 'Generating...' : <><Icon name="sparkles" className="w-5 h-5" /> Get Action Plan</>}
                                                </button>
                                            )}
                                            {actionPlan && (
                                                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-left">
                                                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Your Personalized Action Plan</h4>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(actionPlan) }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <button onClick={reset} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Check Another Email</button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <ScannerHistory history={history} clearHistory={clearHistory} />
        </div >
    );
};

const ScannersPage = () => {
    const [activeScanner, setActiveScanner] = useState('malware');
    const renderScanner = () => {
        switch (activeScanner) {
            case 'malware': return <MalwareScanner />;
            case 'phishing': return <PhishingScanner />;
            case 'breach': return <BreachDetector />;
            default: return <MalwareScanner />;
        }
    };
    const TabButton = ({ scannerName, children }) => (
        <button
            onClick={() => setActiveScanner(scannerName)}
            className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeScanner === scannerName ? 'bg-accent text-white shadow-glow-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
        >
            {children}
        </button>
    );
    return (
        <>
            <Header title="Security Scanners" subtitle="Proactively check for threats to your digital security." />
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2 p-1.5 glass-panel rounded-xl bg-glass-200">
                    <TabButton scannerName="malware">Malware Scanner</TabButton>
                    <TabButton scannerName="phishing">Phishing Scanner</TabButton>
                    <TabButton scannerName="breach">Breach Detector</TabButton>
                </div>
            </div>
            <div>
                {renderScanner()}
            </div>
        </>
    );
};

export default ScannersPage;
