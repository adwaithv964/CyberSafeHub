import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../components/Icon';
import VaultModal from '../components/VaultModals'; // Import the modal
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';
import { checkPasswordStrength } from '../utils/securityScanners';
import { logActivity } from '../utils/activityLogger';
import { useAuth } from '../contexts/AuthContext'; // To get userId

const API_BASE_URL = 'http://localhost:3001/api/vault';

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

    // --- Vault State ---
    const { currentUser } = useAuth();
    const [vaultItems, setVaultItems] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('login');
    const [editingItem, setEditingItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [vaultError, setVaultError] = useState('');


    // --- Generator Logic ---
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
        logActivity('VAULT', 'Generated New Password', 'Strong password created');
        setCopySuccess('');
    }, [passwordLength, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = async (text) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setCopySuccess('Failed to copy');
        }
    };

    // --- Strength Checker Logic ---
    useEffect(() => {
        if (passwordToCheck) {
            const result = checkPasswordStrength(passwordToCheck);
            setStrength(result);
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

    // --- Vault Logic ---
    const fetchVaultItems = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setVaultError('');
        try {
            const res = await fetch(`${API_BASE_URL}/${currentUser.uid}`);
            if (!res.ok) throw new Error('Failed to fetch vault items');
            const data = await res.json();
            setVaultItems(data);
        } catch (err) {
            console.error(err);
            setVaultError('Could not load vault items. Ensure server is running.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchVaultItems();
    }, [fetchVaultItems]);

    const handleSaveItem = async (itemData) => {
        if (!currentUser) return;
        try {
            const payload = {
                userId: currentUser.uid,
                ...itemData
            };

            let res;
            if (editingItem) {
                // Update
                res = await fetch(`${API_BASE_URL}/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData)
                });
            } else {
                // Create
                res = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error('Failed to save item');

            fetchVaultItems(); // Refresh list
            logActivity('VAULT', editingItem ? 'Updated Item' : 'New Item Added', `Type: ${itemData.type}`);
        } catch (err) {
            console.error(err);
            setVaultError('Failed to save item.');
        } finally {
            setEditingItem(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchVaultItems();
            logActivity('VAULT', 'Deleted Item', 'Permanently removed vault item');
        } catch (err) {
            console.error(err);
            setVaultError('Failed to delete item.');
        }
    };

    const openAddModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setModalType(item.type);
        setIsModalOpen(true);
    };

    // Filter Logic
    const filteredItems = activeTab === 'all'
        ? vaultItems
        : vaultItems.filter(item => item.type === activeTab);

    // Helper to get copy value based on type
    const getCopyValue = (item) => {
        switch (item.type) {
            case 'login': return item.data.password;
            case 'card': return item.data.cardNumber;
            case 'identity': return item.data.idNumber;
            case 'note': return item.data.content;
            default: return '';
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'login': return 'globe';
            case 'card': return 'creditCard';
            case 'identity': return 'user';
            case 'note': return 'fileText';
            default: return 'lock';
        }
    };


    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Password Tools & Vault</h2>
                <p className="text-gray-500 dark:text-gray-400">Generate, analyze, and securely store your passwords.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Generator and Analyzer */}
                <div className="space-y-8">
                    {/* Password Generator */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Password Generator</h3>
                        <div className="relative mb-4">
                            <input type="text" readOnly value={generatedPassword} className="w-full p-4 pr-24 bg-gray-100 dark:bg-gray-900 rounded-lg text-lg font-mono text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700" />
                            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                                <button onClick={() => copyToClipboard(generatedPassword)} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50" title="Copy password">
                                    <Icon name="copy" className="w-6 h-6" />
                                </button>
                                <button onClick={generatePassword} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title="Generate new password">
                                    <Icon name="refreshCw" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        {copySuccess === 'Copied!' && <p className="text-green-500 text-sm mb-4">Copied to clipboard!</p>}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="length" className="text-gray-700 dark:text-gray-300">Password Length: <span className="font-bold">{passwordLength}</span></label>
                                <input id="length" type="range" min="8" max="32" value={passwordLength} onChange={(e) => setPasswordLength(e.target.value)} className="w-48" />
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
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

                {/* Right Column: Vault Dashboard */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Icon name="lock" className="w-6 h-6 text-accent" />
                            My Secure Vault
                        </h3>
                        {/* Quick Add Menu */}
                        <div className="flex gap-2">
                            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                                <button onClick={() => openAddModal('login')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all" title="Add Login"><Icon name="globe" className="w-4 h-4" /></button>
                                <button onClick={() => openAddModal('card')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all" title="Add specific card"><Icon name="creditCard" className="w-4 h-4" /></button>
                                <button onClick={() => openAddModal('identity')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all" title="Add Identity"><Icon name="user" className="w-4 h-4" /></button>
                                <button onClick={() => openAddModal('note')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all" title="Add Note"><Icon name="fileText" className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'login', label: 'Logins' },
                            { id: 'card', label: 'Cards' },
                            { id: 'identity', label: 'Identities' },
                            { id: 'note', label: 'Notes' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-accent text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[400px]">
                        {isLoading && <p className="text-center text-gray-500 py-10">Loading your vault...</p>}
                        {vaultError && <p className="text-center text-red-500 py-10">{vaultError}</p>}

                        {!isLoading && !vaultError && filteredItems.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <Icon name="shield" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p>No items in your vault yet.</p>
                                <p className="text-sm">Click the icons above to add your first item.</p>
                            </div>
                        )}

                        {filteredItems.map(item => (
                            <div key={item._id} className="group relative p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-accent dark:hover:border-accent transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-600 rounded-full shadow-sm text-accent">
                                            <Icon name={getIconForType(item.type)} className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100">{item.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Autofill / Copy Action */}
                                        <button
                                            onClick={() => copyToClipboard(getCopyValue(item))}
                                            className="p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                                            title="Copy main value"
                                        >
                                            <Icon name="copy" className="w-4 h-4" />
                                        </button>
                                        {/* Edit Action */}
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 transition-colors"
                                        >
                                            <Icon name="edit" className="w-4 h-4" />
                                        </button>
                                        {/* Delete Action */}
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                                        >
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Preview of data (Optional - masked) */}
                                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 truncate font-mono bg-gray-200 dark:bg-gray-900/50 p-2 rounded">
                                    {item.type === 'login' && (item.data.username || '***')}
                                    {item.type === 'card' && `**** **** **** ${item.data.cardNumber?.slice(-4) || '****'}`}
                                    {item.type === 'identity' && (item.data.firstName ? `${item.data.firstName} ${item.data.lastName}` : 'Functionality')}
                                    {item.type === 'note' && (item.data.content?.slice(0, 30) + '...')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <VaultModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                initialData={editingItem}
                type={modalType}
            />
        </>
    );
};

export default PasswordVaultPage;

