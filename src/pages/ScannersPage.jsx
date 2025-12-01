import React, { useState } from 'react';
import Icon from '../components/Icon';
import ThemedModal from '../components/ThemedModal';
import Header from '../components/Header';
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';

// Sub-components are kept here for convenience but can be split further
const MalwareScanner = () => {
    const [file, setFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const showModal = (title, body) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile && selectedFile.size <= 50 * 1024 * 1024) {
            setFile(selectedFile);
            setScanResult(null);
        } else {
            showModal("File Too Large", "Please select a file smaller than 50MB.");
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

    const handleScan = () => {
        if (!file) return;
        setIsScanning(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const isMalicious = Math.random() > 0.7;
                        setScanResult({
                            verdict: isMalicious ? 'Malicious' : 'Clean',
                            details: isMalicious ? [{ threat: 'Trojan.Generic.123', type: 'Trojan' }] : []
                        });
                        setIsScanning(false);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const resetScanner = () => {
        setFile(null);
        setScanResult(null);
        setIsScanning(false);
        setProgress(0);
    };

    return (
        <>
            <ThemedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}>
                <p>{modalContent.body}</p>
            </ThemedModal>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
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
                {file && !isScanning && !scanResult && (
                    <div className="text-center">
                        <Icon name="file" className="w-16 h-16 mx-auto text-blue-500" />
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">{file.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button onClick={handleScan} className="mt-6 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg">Scan Now</button>
                    </div>
                )}
                {isScanning && (
                    <div>
                        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Scanning...</p>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{file.name}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                            <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{progress}%</p>
                    </div>
                )}
                {scanResult && (
                    <div className="text-center">
                        {scanResult.verdict === 'Clean' ? <Icon name="checkCircle" className="w-20 h-20 mx-auto text-green-500" /> : <Icon name="shieldAlert" className="w-20 h-20 mx-auto text-red-500" />}
                        <h3 className={`mt-4 text-3xl font-bold ${scanResult.verdict === 'Clean' ? 'text-green-500' : 'text-red-500'}`}>File is {scanResult.verdict}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Finished scanning <span className="font-medium text-gray-800 dark:text-gray-100">{file.name}</span>.</p>
                        {scanResult.details.length > 0 && (
                            <div className="mt-6 text-left w-full max-w-md mx-auto">
                                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Threats Found:</h4>
                                <div className="mt-2 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-600">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">Threat Name</th>
                                                <th className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {scanResult.details.map((threat, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{threat.threat}</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{threat.type}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <button onClick={resetScanner} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Scan Another File</button>
                    </div>
                )}
            </div>
        </>
    );
};

const PhishingScanner = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const handleScan = () => {
        if (!url) return;
        setIsScanning(true);
        setScanResult(null);
        setTimeout(() => {
            const isPhishing = url.includes('phishing') || Math.random() > 0.7;
            setScanResult({
                verdict: isPhishing ? 'Phishing Detected' : 'Safe',
                explanation: isPhishing ? 'This URL matches patterns of known phishing sites.' : 'This URL appears to be safe.',
            });
            setIsScanning(false);
        }, 2000);
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {!scanResult ? (
                <div className="max-w-xl mx-auto text-center">
                    <Icon name="link" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Spam/Phishing URL Scanner</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Enter a URL to check if it's a known phishing or spam site.</p>
                    <div className="mt-6 flex flex-col md:flex-row gap-2">
                        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <button onClick={handleScan} disabled={isScanning || !url} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500">{isScanning ? 'Scanning...' : 'Scan URL'}</button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    {scanResult.verdict === 'Safe' ? <Icon name="shieldCheck" className="w-20 h-20 mx-auto text-green-500" /> : <Icon name="shieldAlert" className="w-20 h-20 mx-auto text-red-500" />}
                    <h3 className={`mt-4 text-3xl font-bold ${scanResult.verdict === 'Safe' ? 'text-green-500' : 'text-red-500'}`}>{scanResult.verdict}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2"><span className="font-medium text-gray-800 dark:text-gray-100">{url}</span></p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{scanResult.explanation}</p>
                    <button onClick={() => { setScanResult(null); setUrl(''); }} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Scan Another URL</button>
                </div>
            )}
        </div>
    );
};

const BreachDetector = () => {
    const [email, setEmail] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null);
    const [actionPlan, setActionPlan] = useState('');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const handleCheck = () => {
        if (!email) return;
        setIsChecking(true);
        setCheckResult(null);
        setActionPlan('');
        setTimeout(() => {
            const hasBreaches = email.includes('breached') || Math.random() > 0.6;
            setCheckResult({
                found: hasBreaches,
                breaches: hasBreaches ? [{ name: 'Social Media Platform 2021', details: 'Exposed passwords, usernames.' }, { name: 'Online Retailer 2020', details: 'Exposed emails, physical addresses.' }] : []
            });
            setIsChecking(false);
        }, 2000);
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
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {!checkResult ? (
                <div className="max-w-xl mx-auto text-center">
                    <Icon name="user" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Data Breach Detector</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Enter an email address to see if it has been exposed in a known data breach.</p>
                    <div className="mt-6 flex flex-col md:flex-row gap-2">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <button onClick={handleCheck} disabled={isChecking || !email} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500">{isChecking ? 'Checking...' : 'Check Email'}</button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
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
                </div>
            )}
        </div>
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
            className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeScanner === scannerName ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            {children}
        </button>
    );
    return (
        <>
            <Header title="Security Scanners" subtitle="Proactively check for threats to your digital security." />
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
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
