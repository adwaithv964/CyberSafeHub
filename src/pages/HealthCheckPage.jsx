import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';

const HealthCheckPage = () => {
    const [scanState, setScanState] = useState('idle'); // idle, scanning, results
    const [currentStep, setCurrentStep] = useState(0);
    const [scanResults, setScanResults] = useState(null);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const scanSteps = [
        "Checking for data breaches...",
        "Analyzing password strength...",
        "Scanning for device vulnerabilities...",
        "Reviewing social media privacy...",
        "Compiling your report...",
    ];

    useEffect(() => {
        if (scanState === 'scanning' && currentStep < scanSteps.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (scanState === 'scanning' && currentStep >= scanSteps.length) {
            // Simulate results
            setScanResults({
                score: 72,
                findings: [
                    { text: '2 weak passwords found', severity: 'high' },
                    { text: 'Email found in 1 data breach', severity: 'high' },
                    { text: '2FA is not enabled on 1 account', severity: 'medium' },
                    { text: 'Social media profiles are public', severity: 'low' },
                ],
                roadmap: [
                    { text: 'Change your 2 weak passwords immediately', done: false },
                    { text: 'Enable 2FA on your primary email account', done: false },
                    { text: 'Review and update social media privacy settings', done: false },
                ]
            });
            setScanState('results');
        }
    }, [scanState, currentStep]);

    const startScan = () => {
        setScanState('scanning');
        setCurrentStep(0);
        setAiSummary('');
    };

    const getAISummary = async () => {
        setIsGeneratingSummary(true);
        const findingsText = scanResults.findings.map(f => `- ${f.text} (Severity: ${f.severity})`).join('\n');
        const systemPrompt = "You are a friendly, encouraging cybersecurity coach. A user has just completed a security health check. Based on their results, provide a short, easy-to-understand summary. Congratulate them on what they're doing well, gently point out the key area for improvement, and motivate them to follow their new roadmap. Keep it under 100 words.";
        const userPrompt = `My security scan found the following issues:\n${findingsText}\n\nMy overall score is ${scanResults.score}/100. Please give me a summary of my results.`;

        const summary = await callGeminiAPI(userPrompt, systemPrompt);
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
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Security Health Check</h2>
                <p className="text-gray-500 dark:text-gray-400">Get a comprehensive overview of your security posture and a personalized roadmap.</p>
            </header>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                {scanState === 'idle' && (
                    <div className="text-center max-w-md mx-auto">
                        <Icon name="checkCircle" className="w-20 h-20 mx-auto text-blue-500" />
                        <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Ready to Check Your Security Health?</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Our comprehensive scan will analyze key areas of your digital life to identify vulnerabilities and provide you with a clear action plan.</p>
                        <button onClick={startScan} className="mt-8 px-10 py-4 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition-colors">Start Health Check</button>
                    </div>
                )}

                {scanState === 'scanning' && (
                    <div className="text-center max-w-lg mx-auto">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Scanning Your Security...</h3>
                        <div className="mt-6 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(currentStep / scanSteps.length) * 100}%` }}></div>
                        </div>
                        <p className="mt-3 text-gray-600 dark:text-gray-300 h-6">{scanSteps[currentStep] || 'Finalizing...'}</p>
                    </div>
                )}

                {scanState === 'results' && scanResults && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Results</h3>
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <p className="text-gray-600 dark:text-gray-300">Overall Security Score</p>
                                <p className={`text-7xl font-bold my-2 ${getScoreColor(scanResults.score)}`}>{scanResults.score}<span className="text-4xl">/100</span></p>
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
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-700 dark:text-indigo-300" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(aiSummary) }} />
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
                                {scanResults.roadmap.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="w-5 h-5 border-2 border-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={startScan} className="mt-8 w-full px-10 py-3 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition-colors">Rescan My Security</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HealthCheckPage;
