import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import CryptoJS from 'crypto-js';

const API_URL = 'http://localhost:3001/api/secrets'; // Adjust if needed

export default function DeadDrop({ onNavigate }) {
    const [mode, setMode] = useState('create'); // 'create' | 'view'

    // Create State
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // View State
    const [viewPassword, setViewPassword] = useState('');
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const [viewError, setViewError] = useState('');
    const [isViewing, setIsViewing] = useState(false);

    // Check URL for ID and Key
    useEffect(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;

        // Expected format: /tools/dead-drop/view/<id>#<key> (or #)
        if (path.includes('/view/')) {
            setMode('view');
            const parts = path.split('/view/');
            if (parts.length > 1) {
                const id = parts[1];
                if (hash && hash.length > 1) {
                    // Auto-decrypt if key is in hash
                    const key = hash.substring(1);
                    handleViewSecret(id, key);
                }
            }
        }
    }, []);

    const handleCreate = async () => {
        if (!message) return setError('Message is required');
        setError('');
        setIsLoading(true);

        try {
            // 1. Generate Key
            let key;
            if (password) {
                key = password; // User provided password
            } else {
                key = CryptoJS.lib.WordArray.random(16).toString(); // Random Key
            }

            // 2. Encrypt Message
            const encrypted = CryptoJS.AES.encrypt(message, key).toString();

            // 3. Hash Key for Server Auth
            // We hash the key so the server can verify the requester has the key,
            // WITHOUT the server knowing the key itself.
            const authHash = CryptoJS.SHA256(key).toString();

            // 4. Send to Server
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encryptedData: encrypted, authHash })
            });

            if (!response.ok) throw new Error('Failed to create secret');

            const data = await response.json();
            const id = data.id;

            // 5. Generate Link
            const baseUrl = window.location.origin + '/tools/dead-drop/view/' + id;
            const finalLink = password ? baseUrl : `${baseUrl}#${key}`; // Append key if no password

            setGeneratedLink(finalLink);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewSecret = async (id, key) => {
        setIsViewing(true);
        setViewError('');

        try {
            // 1. Hash the Key to prove we own it
            const authHash = CryptoJS.SHA256(key).toString();

            // 2. Fetch from Server
            const response = await fetch(`${API_URL}/${id}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authHash })
            });

            if (response.status === 404) throw new Error('Secret not found or already destroyed.');
            if (response.status === 403) throw new Error('Invalid Password/Link.');
            if (!response.ok) throw new Error('Failed to retrieve secret.');

            const data = await response.json();

            // 3. Decrypt
            const bytes = CryptoJS.AES.decrypt(data.encryptedData, key);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);

            if (!originalText) throw new Error('Decryption Failed. Wrong Password?');

            setDecryptedMessage(originalText);

        } catch (err) {
            setViewError(err.message);
        } finally {
            setIsViewing(false);
        }
    };

    const manuallyTriggerView = () => {
        const path = window.location.pathname;
        const id = path.split('/view/')[1];
        if (id && viewPassword) {
            handleViewSecret(id, viewPassword);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        // Could add toast here
    };

    if (mode === 'view') {
        return (
            <div className="max-w-2xl mx-auto p-6 relative">
                <button
                    onClick={() => {
                        if (onNavigate) {
                            window.history.pushState({}, '', '/tools');
                            onNavigate('tools');
                        } else {
                            window.location.href = '/tools';
                        }
                    }}
                    className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-6"
                >
                    <Icon name="arrowLeft" className="w-5 h-5" />
                    Back to Tools
                </button>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-400 mb-6 flex items-center gap-3">
                    <Icon name="eye" className="w-8 h-8 text-accent" />
                    Retrieving Secret
                </h2>

                {decryptedMessage ? (
                    <div className="bg-glass-panel p-8 rounded-xl border border-accent/20 text-center animate-fade-in">
                        <Icon name="checkCircle" className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-4 text-text-primary">Secret Decrypted</h3>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-left text-green-400 break-words border border-green-500/30 shadow-inner">
                            {decryptedMessage}
                        </div>
                        <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2 justify-center">
                            <Icon name="alertTriangle" className="w-4 h-4" />
                            This secret has been destroyed from the server.
                        </div>
                        <button onClick={() => window.location.href = '/tools'} className="mt-8 px-6 py-2 bg-glass-surface hover:bg-glass-highlight rounded-lg transition-all text-text-secondary">
                            Create New Secret
                        </button>
                    </div>
                ) : (
                    <div className="bg-glass-panel p-8 rounded-xl border border-glass-border">
                        <div className="text-center mb-6">
                            <Icon name="lock" className="w-12 h-12 text-accent mx-auto mb-2" />
                            <h3 className="text-xl font-semibold text-text-primary">Locked Secret</h3>
                            <p className="text-text-secondary">Enter the password or ensure the link is correct.</p>
                        </div>

                        {!window.location.hash && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Password / Key</label>
                                <input
                                    type="password"
                                    value={viewPassword}
                                    onChange={(e) => setViewPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                    placeholder="Enter password to unlock"
                                />
                            </div>
                        )}

                        {viewError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
                                <Icon name="xOctagon" className="w-4 h-4" />
                                {viewError}
                            </div>
                        )}

                        {!window.location.hash && (
                            <button
                                onClick={manuallyTriggerView}
                                disabled={isViewing}
                                className="w-full py-3 bg-gradient-to-r from-accent to-blue-600 rounded-lg font-bold text-white hover:shadow-glow-accent transition-all disabled:opacity-50"
                            >
                                {isViewing ? 'Unlocking...' : 'Unlock Secret'}
                            </button>
                        )}

                        {window.location.hash && !decryptedMessage && (
                            <div className="text-center text-text-secondary animate-pulse">
                                Decrypting...
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => {
                    if (onNavigate) {
                        window.history.pushState({}, '', '/tools');
                        onNavigate('tools');
                    } else {
                        window.location.href = '/tools';
                    }
                }}
                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-6"
            >
                <Icon name="arrowLeft" className="w-5 h-5" />
                Back to Tools
            </button>
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-400 mb-4 inline-block">
                    Dead Drop
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    Create encapsulated, encrypted secrets that self-destruct after being viewed once.
                    The server never sees your password or the decrypted content.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="bg-glass-panel p-6 rounded-xl border border-glass-border">
                    <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Icon name="plus" className="w-5 h-5 text-accent" />
                        New Secret
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 bg-black/40 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"
                                placeholder="Enter your secret message here..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Optional Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                placeholder="Leave empty for auto-generated link key"
                            />
                            <p className="text-xs text-text-secondary mt-1">If set, the recipient MUST enter this password.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-accent to-blue-600 rounded-lg font-bold text-white hover:shadow-glow-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                            ) : (
                                <>
                                    <Icon name="link" className="w-5 h-5" />
                                    Create Self-Destruct Link
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Result */}
                <div className="flex flex-col">
                    <div className={`bg-glass-panel p-6 rounded-xl border border-glass-border flex-1 transition-all duration-300 ${generatedLink ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Icon name="share" className="w-5 h-5 text-accent" />
                            Your Link
                        </h2>

                        {generatedLink ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                                    <p className="text-sm text-accent font-medium mb-1">Ready to share!</p>
                                    <p className="text-xs text-text-secondary">This link will work exactly ONCE.</p>
                                </div>

                                <div className="relative">
                                    <input
                                        readOnly
                                        value={generatedLink}
                                        className="w-full bg-black/50 border border-glass-border rounded-lg px-4 py-3 text-gray-300 font-mono text-sm pr-12 truncate"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-2 top-2 p-1.5 bg-glass-highlight rounded-md hover:bg-glass-surface text-white transition-colors"
                                    >
                                        <Icon name="copy" className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-text-secondary italic">
                                        "This message will self-destruct in..." <br />
                                        <span className="text-accent not-italic font-bold">Immediately after reading.</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                                <Icon name="lock" className="w-16 h-16 mb-4" />
                                <p>Generate a link to see it here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
