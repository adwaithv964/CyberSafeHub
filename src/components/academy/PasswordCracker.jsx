import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Icon from '../Icon';

const PasswordCracker = () => {
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({
        entropy: 0,
        crackTimeLaptop: 'Instant',
        crackTimeHacker: 'Instant',
        crackTimeSuper: 'Instant',
        score: 0,
        note: ''
    });

    // --- Estimates (guesses per second) ---
    const SPEEDS = {
        laptop: 1e9,         // 1 Billion guesses/sec (Modern GPU)
        hacker: 1e11,        // 100 Billion guesses/sec (Mining Rig)
        supercomputer: 1e15  // 1 Quadrillion guesses/sec (Govt/Supercomputer)
    };

    const calculateTime = (combinations, speed) => {
        const seconds = combinations / speed;
        if (seconds < 1) return "Instant";
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
        if (seconds < 315360000000) return `${Math.round(seconds / 3153600000)} centuries`;
        return "Eons";
    };

    useEffect(() => {
        if (!password) {
            setStats({ entropy: 0, crackTimeLaptop: 'Instant', crackTimeHacker: 'Instant', crackTimeSuper: 'Instant', score: 0 });
            return;
        }

        // --- Realistic Adjustments ---
        const commonWords = ['password', 'hello', 'admin', 'welcome', 'login', 'user', 'qwerty', '123456', 'dragon', 'master'];
        const lowerPass = password.toLowerCase();
        let isCommon = false;

        // Check for dictionary words
        for (let word of commonWords) {
            if (lowerPass.includes(word)) {
                isCommon = true;
                break;
            }
        }

        // 1. Calculate Base Pool Size
        let poolSize = 0;
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/[0-9]/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

        // 2. Calculate Combinations (N^L)
        let combinations = Math.pow(poolSize, password.length);

        // 3. Apply Penalties for Realism (Dictionary/Hybrid Attacks)
        let note = "";

        if (isCommon) {
            // Drastic reduction: assume attacker uses dictionary + simple rules
            // Effective search space is reduced to ~10^6 - 10^8
            combinations = Math.min(combinations, 1e8);
            note = "Common word detected (Dictionary Attack vulnerability)";
        } else if (password.length < 8) {
            // Short passwords are trivial for rainbow tables
            combinations = Math.min(combinations, 1e9);
            note = "Too short (Vulnerable to Tables)";
        } else if (/^[a-zA-Z]+$/.test(password)) {
            // Only letters -> fast mask attack
            combinations = combinations / 100;
        }

        const entropy = Math.log2(Math.pow(poolSize, password.length)); // Keep "Mathematical" entropy for display, but use penalized calc for time?
        // Actually, let's show effective entropy.

        const effectiveEntropy = Math.log2(combinations);

        // 3. Calculate Score (0-100)
        let score = Math.min(100, Math.round((effectiveEntropy / 80) * 100));
        if (isCommon) score = Math.min(score, 20); // Cap score for dictionary words

        setStats({
            entropy: Math.round(effectiveEntropy),
            crackTimeLaptop: calculateTime(combinations, SPEEDS.laptop),
            crackTimeHacker: calculateTime(combinations, SPEEDS.hacker),
            crackTimeSuper: calculateTime(combinations, SPEEDS.supercomputer),
            score,
            note
        });

    }, [password]);

    const getScoreColor = (score) => {
        if (score < 40) return 'text-danger border-danger';
        if (score < 70) return 'text-warning border-warning';
        return 'text-success border-success';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-text-primary">Brute Force Simulator</h2>
                <p className="text-text-secondary">Type a password to see how long it would take for different attackers to crack it.</p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type a password..."
                    className="w-full text-center text-3xl font-mono bg-background/50 border-b-2 border-accent/50 focus:border-accent outline-none py-4 text-text-primary placeholder:text-text-secondary/20 transition-all"
                />
                {!password && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                        <span className="animate-pulse text-accent">|</span>
                    </div>
                )}
            </div>

            {password && (
                <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visualizer / Matrix Effect Placeholder */}
                    <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center transition-all duration-500 ${getScoreColor(stats.score)}`}>
                            <span className="text-4xl font-bold text-text-primary">{stats.score}</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-text-primary">Password Strength</p>
                            <p className="text-sm text-text-secondary">{stats.entropy} bits of effective entropy</p>
                            {stats.note && <p className="text-xs text-danger font-bold mt-1 bg-danger/10 px-2 py-1 rounded border border-danger/20">{stats.note}</p>}
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="space-y-4">
                        <Card className="p-4 flex items-center justify-between border-l-4 border-l-success">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background/50 rounded-lg"><Icon name="smartphone" className="w-6 h-6 text-text-secondary" /></div>
                                <div>
                                    <p className="text-sm text-text-secondary">Common Laptop</p>
                                    <p className="text-xs text-text-secondary opacity-70">1 Billion guesses/sec</p>
                                </div>
                            </div>
                            <p className="text-xl font-mono font-bold text-text-primary">{stats.crackTimeLaptop}</p>
                        </Card>

                        <Card className="p-4 flex items-center justify-between border-l-4 border-l-warning">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background/50 rounded-lg"><Icon name="zap" className="w-6 h-6 text-warning" /></div>
                                <div>
                                    <p className="text-sm text-text-secondary">Hacker GPU Rig</p>
                                    <p className="text-xs text-text-secondary opacity-70">100 Billion guesses/sec</p>
                                </div>
                            </div>
                            <p className="text-xl font-mono font-bold text-text-primary">{stats.crackTimeHacker}</p>
                        </Card>

                        <Card className="p-4 flex items-center justify-between border-l-4 border-l-danger">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background/50 rounded-lg"><Icon name="server" className="w-6 h-6 text-danger" /></div>
                                <div>
                                    <p className="text-sm text-text-secondary">Supercomputer</p>
                                    <p className="text-xs text-text-secondary opacity-70">1 Quadrillion guesses/sec</p>
                                </div>
                            </div>
                            <p className="text-xl font-mono font-bold text-text-primary">{stats.crackTimeSuper}</p>
                        </Card>
                    </div>
                </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-200 flex gap-3">
                <Icon name="info" className="w-5 h-5 flex-shrink-0" />
                <p>This simulation assumes a standard brute-force attack. Real attacks often use dictionary lists, which are much faster against common words. Always use random, complex passwords!</p>
            </div>
        </div>
    );
};

export default PasswordCracker;
