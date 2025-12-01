import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../components/Icon';
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';

const PasswordVaultPage = () => {
    // State for Password Generator
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordLength, setPasswordLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [copySuccess, setCopySuccess] = useState('');

    // State for Strength Checker
    const [passwordToCheck, setPasswordToCheck] = useState('');
    const [strength, setStrength] = useState({ score: 0, label: 'Very Weak', color: 'bg-red-500' });
    const [aiAdvice, setAiAdvice] = useState('');
    const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);

    const generatePassword = useCallback(() => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let charSet = lower;
        if (includeUppercase) charSet += upper;
        if (includeNumbers) charSet += nums;
        if (includeSymbols) charSet += syms;

        let pass = '';
        for (let i = 0; i < passwordLength; i++) {
            pass += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        setGeneratedPassword(pass);
        setCopySuccess('');
    }, [passwordLength, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = async () => {
        if (!generatedPassword) return;
        try {
            await navigator.clipboard.writeText(generatedPassword);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setCopySuccess('Failed to copy');
        }
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.length > 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthLevels = [
            { label: 'Very Weak', color: 'bg-red-500' },
            { label: 'Weak', color: 'bg-orange-500' },
            { label: 'Medium', color: 'bg-yellow-500' },
            { label: 'Strong', color: 'bg-green-500' },
            { label: 'Very Strong', color: 'bg-emerald-500' },
        ];

        const finalScore = Math.floor((score / 5) * 100);
        const levelIndex = Math.min(Math.floor(score), 4);
        setStrength({ score: finalScore, ...strengthLevels[levelIndex] });
    };

    useEffect(() => {
        if (passwordToCheck) {
            checkPasswordStrength(passwordToCheck);
        } else {
            setStrength({ score: 0, label: 'Very Weak', color: 'bg-red-500' });
            setAiAdvice('');
        }
    }, [passwordToCheck]);

    const getAIPasswordAdvice = async () => {
        if (!passwordToCheck || strength.score >= 60) return;
        setIsGeneratingAdvice(true);
        const systemPrompt = "You are a password security expert. A user has entered a weak password. Explain in a friendly, non-judgmental tone *why* their password is weak. Focus on concepts like predictability, common patterns (like using 'password123'), and the importance of randomness and length. Then, provide 2-3 actionable tips for creating a much stronger password, without suggesting a specific one. Use bullet points.";
        const userPrompt = `My password is "${passwordToCheck}". Please analyze it and tell me how to improve my password creation strategy.`;
        const advice = await callGeminiAPI(userPrompt, systemPrompt);
        setAiAdvice(advice);
        setIsGeneratingAdvice(false);
    };

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Password Tools & Vault</h2>
                <p className="text-gray-500 dark:text-gray-400">Generate, analyze, and securely store your passwords.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Generator and Analyzer */}
                <div className="space-y-8">
                    {/* Password Generator */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Password Generator</h3>
                        <div className="relative mb-4">
                            <input type="text" readOnly value={generatedPassword} className="w-full p-4 pr-24 bg-gray-100 dark:bg-gray-900 rounded-lg text-lg font-mono text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700" />
                            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                                <button onClick={copyToClipboard} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50" title="Copy password">
                                    <Icon name="copy" className="w-6 h-6" />
                                </button>
                                <button onClick={generatePassword} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title="Generate new password">
                                    <Icon name="refreshCw" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        {copySuccess && <p className="text-green-500 text-sm mb-4">{copySuccess}</p>}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="length" className="text-gray-700 dark:text-gray-300">Password Length: <span className="font-bold">{passwordLength}</span></label>
                                <input id="length" type="range" min="8" max="32" value={passwordLength} onChange={(e) => setPasswordLength(e.target.value)} className="w-48" />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(p => !p)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> A-Z</label>
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(p => !p)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> 0-9</label>
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(p => !p)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> !@#$</label>
                            </div>
                        </div>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Password Strength Meter</h3>
                        <input
                            type="text"
                            value={passwordToCheck}
                            onChange={(e) => setPasswordToCheck(e.target.value)}
                            placeholder="Type a password to analyze"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="mt-4">
                            <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full mb-2">
                                <div className={`h-2.5 rounded-full transition-all ${strength.color}`} style={{ width: `${strength.score}%` }}></div>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Strength: <span className="font-bold">{strength.label}</span></p>
                        </div>

                        {passwordToCheck && strength.score < 60 && (
                            <div className="text-center mt-6">
                                <button onClick={getAIPasswordAdvice} disabled={isGeneratingAdvice} className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                                    {isGeneratingAdvice ? 'Analyzing...' : <><Icon name="sparkles" className="w-5 h-5" /> Get AI Password Advice</>}
                                </button>
                            </div>
                        )}

                        {aiAdvice && (
                            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                                <h4 className="font-bold text-lg text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5" /> AI Advisor</h4>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-700 dark:text-indigo-300" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(aiAdvice) }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Vault (Placeholder) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">My Secure Vault</h3>
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Icon name="lock" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Vault functionality is coming soon!</p>
                        <p className="text-gray-500 dark:text-gray-400">Securely store and manage your passwords here.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PasswordVaultPage;
