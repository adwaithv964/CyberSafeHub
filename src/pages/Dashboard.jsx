import React, { useState, useEffect } from 'react';

import Card from '../components/Card';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { getRecentActivity, getActivityIcon } from '../utils/activityLogger';
import Cyber3DScene from '../components/Cyber3DScene';

const Dashboard = ({ onNavigate }) => {
    // State for Security Roadmap persistence
    const [roadmapItems, setRoadmapItems] = useState(() => {
        try {
            const saved = localStorage.getItem('securityRoadmap');
            const parsed = saved ? JSON.parse(saved) : null;
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse roadmap from storage", e);
        }
        // Default fallbacks
        return [
            { id: 1, text: "Enable 2FA on Google Account", done: false },
            { id: 2, text: "Review Recent Login Activity", done: false },
            { id: 3, text: "Update Main Password", done: false },
            { id: 4, text: "Check Email for Breaches", done: false },
            { id: 5, text: "Secure Social Media Settings", done: false },
        ];
    });

    const [securityScore, setSecurityScore] = useState(0);
    const [activityItems, setActivityItems] = useState([]);
    const [tipOfTheDay, setTipOfTheDay] = useState("");

    // --- Load Real Data ---
    useEffect(() => {
        // 1. Get Score from Health Check History
        const history = JSON.parse(localStorage.getItem('healthCheckHistory') || '[]');
        if (history.length > 0) {
            setSecurityScore(history[0].score); // Latest score
        } else {
            // If no scan, potentially fallback or stay at 0
        }

        // 2. Get Recent Activity
        const activities = getRecentActivity(5);

        // Listen for real-time updates
        const handleLogUpdate = () => {
            setActivityItems(getRecentActivity(5));
        };
        window.addEventListener('activityLogUpdated', handleLogUpdate);

        setActivityItems(activities);
        return () => window.removeEventListener('activityLogUpdated', handleLogUpdate);
    }, []);

    // Dynamic Tip of the Day (rotates daily)
    useEffect(() => {
        const tips = [
            "Regularly review app permissions on your mobile devices to ensure they only have access to the data they need.",
            "Use a password manager to generate and store complex, unique passwords for every account.",
            "Enable Two-Factor Authentication (2FA) wherever possible to add an extra layer of security.",
            "Be wary of phishing emails. Check the sender's address and avoid clicking suspicious links.",
            "Keep your software and operating system updated to patch known vulnerabilities.",
            "Avoid using public Wi-Fi for sensitive transactions like banking; use a VPN if necessary.",
            "Back up your important data regularly to an external drive or a secure cloud service."
        ];
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        setTipOfTheDay(tips[dayOfYear % tips.length]);
    }, []);

    const toggleItem = (id) => {
        const newItems = roadmapItems.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        );
        setRoadmapItems(newItems);
        localStorage.setItem('securityRoadmap', JSON.stringify(newItems));
    };

    const getScoreColor = (score) => {
        if (score > 80) return 'text-success drop-shadow-[0_0_8px_rgba(63,185,80,0.6)]';
        if (score > 60) return 'text-warning drop-shadow-[0_0_8px_rgba(248,231,28,0.6)]';
        return 'text-danger drop-shadow-[0_0_8px_rgba(248,81,73,0.6)]';
    };

    const getScoreRingColor = (score) => {
        if (score > 80) return 'text-success';
        if (score > 60) return 'text-warning';
        return 'text-danger';
    };

    return (
        <div className="space-y-8 animate-fadeIn relative">
            {/* 3D Background */}
            <Cyber3DScene />

            <header className="mb-10 relative z-10">
                <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2 drop-shadow-lg">Dashboard</h2>
                <p className="text-text-primary/80 text-lg">Welcome back! Here's your security overview.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* Security Score Card */}
                <Card className="col-span-1 lg:col-span-1 relative group">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="flex flex-col items-center justify-center p-2">
                        <h3 className="text-xl font-bold text-text-primary mb-6 tracking-wide">Security Score</h3>
                        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"></div>

                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md">
                                {/* Track */}
                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                                {/* Progress */}
                                <circle
                                    cx="96" cy="96" r="80"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={502.65}
                                    strokeDashoffset={502.65 - (502.65 * securityScore) / 100}
                                    strokeLinecap="round"
                                    className={`${getScoreRingColor(securityScore)} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className={`text-5xl font-bold ${getScoreColor(securityScore)} drop-shadow-lg`}>{securityScore}</span>
                                <span className="text-xs text-text-secondary uppercase tracking-wider mt-1">out of 100</span>
                            </div>
                        </div>
                        <p className="text-center text-text-secondary mb-6 px-4 min-h-[48px]">
                            {securityScore === 0 ? "No scan data found. Run a scan to assess your security." : securityScore >= 80 ? "Excellent! Your system is well protected." : securityScore >= 60 ? "Good, but there is room for improvement." : "Critical! Immediate action is required."}
                        </p>
                        <Button onClick={() => onNavigate('healthcheck')} variant="primary" className="w-full max-w-[200px] glass-button">
                            {securityScore === 0 ? "Start First Scan" : "View Full Report"}
                        </Button>
                    </div>
                </Card>

                {/* Right Column: Recent Activity & Tips */}
                <div className="col-span-1 lg:col-span-2 space-y-8 flex flex-col h-full">

                    {/* Recent Activity Card */}
                    <Card title="Recent Activity" icon="menu" className="flex-1">
                        <div className="relative h-full">
                            {/* Vertical Line for Timeline */}
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-white/10"></div>

                            <ul className="space-y-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar pl-2">
                                {activityItems.length > 0 ? (
                                    activityItems.map((item) => {
                                        return (
                                            <li key={item.id} className="relative flex items-start gap-4 group">
                                                {/* Timeline Dot */}
                                                <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ml-[11px] ring-4 ring-white/10 ${item.type === 'alert' || item.type === 'scan' ? 'bg-accent shadow-[0_0_10px_#00d2ff]' : 'bg-gray-400'
                                                    }`}></div>

                                                <div className="flex-1 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-semibold text-text-primary">{item.description}</p>
                                                        <span className="text-xs text-text-secondary whitespace-nowrap">{item.timeFormatted}</span>
                                                    </div>
                                                    <p className="text-xs text-text-secondary">{item.details}</p>
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="text-text-secondary text-sm text-center py-8 italic">No recent activity recorded.</li>
                                )}
                            </ul>
                        </div>
                    </Card>

                    {/* Tip of the Day Card */}
                    <Card title="Tips of the Day" icon="lightbulb" className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none"></div>
                        <div className="relative p-2">
                            <div className="absolute -top-4 -left-2 text-6xl text-accent/20 font-serif leading-none">“</div>
                            <p className="text-lg text-text-primary font-medium leading-relaxed indent-6 relative z-10 drop-shadow-sm">
                                {tipOfTheDay}
                            </p>
                            <div className="absolute -bottom-6 -right-2 text-6xl text-accent/20 font-serif leading-none transform rotate-180">“</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Security Roadmap */}
            <div className="glass-panel p-8 mt-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-success/20 rounded-lg text-success shadow-[0_0_10px_rgba(0,255,157,0.3)]">
                        <Icon name="checkCircle" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">Your Security Roadmap</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {roadmapItems.map(item => (
                        <RoadmapItem key={item.id} item={item} onToggle={() => toggleItem(item.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const RoadmapItem = ({ item, onToggle }) => {
    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${item.done ? 'bg-white/5 border-transparent opacity-60' : 'bg-white/5 border-white/10 hover:border-accent/50 hover:shadow-glow-accent/20 hover:bg-white/10'
                }`}
            onClick={onToggle}
        >
            <div className={`
                w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 border-2
                ${item.done ? 'bg-success border-success scale-100 shadow-[0_0_10px_rgba(0,255,157,0.5)]' : 'border-text-secondary group-hover:border-accent scale-90 group-hover:scale-100'}
            `}>
                {item.done && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>
            <span className={`text-sm md:text-base transition-colors duration-200 ${item.done ? 'text-text-secondary line-through' : 'text-text-primary font-medium group-hover:text-accent'} `}>
                {item.text}
            </span>
        </div>
    );
};


export default Dashboard;
