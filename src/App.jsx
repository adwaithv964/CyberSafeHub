import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './LandingPage';

// --- GEMINI API CALLER (Unchanged) ---
const callGeminiAPI = async (prompt, systemPrompt) => {
    const apiKey = "AIzaSyApdYCUuxNl30TEqHNYGL3Hzq2TrMgZxic";
    if (!apiKey) return "API Key not found. Please create a .env file with your VITE_GEMINI_API_KEY.";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    if (systemPrompt) payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            if (!response.ok) {
                console.error(`API call failed: ${response.status}`, await response.text());
                return "Sorry, the AI service might be temporarily unavailable.";
            }
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
            return "Sorry, I couldn't generate a valid response.";
        } catch (error) {
            console.error("Gemini API call error:", error);
            if (i < 4) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else return "Sorry, there's a connection issue.";
        }
    }
    return "Sorry, the AI service is overloaded. Please try again later.";
};

// --- ICON COMPONENT (Unchanged) ---
const Icon = ({ name, className }) => {
  const icons = {
    shield: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    layoutDashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>,
    scan: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M7 12a5 5 0 0 1 5-5"></path><path d="M12 17a5 5 0 0 1-5-5"></path></svg>,
    lock: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    messageCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>,
    checkCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    book: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>,
    file: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>,
    link: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>,
    lightbulb: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 7.5a6 6 0 0 0-12 0c0 1.5.3 2.7 1.5 3.9.8.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>,
    uploadCloud: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>,
    shieldAlert: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>,
    shieldCheck: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
    send: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
    sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5z"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="m21 21-1.5-3-3-1.5 3-1.5 1.5-3 1.5 3 3 1.5-3 1.5z"/><path d="M3 3 4.5 6l3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z"/></svg>,
    alertTriangle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    copy: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>,
    refreshCw: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>,
    arrowLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>,
    palette: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.16-.832-.435-1.155-.275-.323-.435-.746-.435-1.182A3.33 3.33 0 0 1 16 14.5c.318 0 .614.128.832.355.218.227.48.513.832.513 1.838 0 3.333-1.5 3.333-3.333C22 6.5 17.5 2 12 2z"></path></svg>,
    database: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  };
  return icons[name] || null;
};

// --- MARKDOWN CONVERTER ---
const simpleMarkdownToHtml = (text = "") => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let inList = false;
    html = lines.map(line => {
        const isListItem = line.match(/^\s*-\s/) || line.match(/^\s*\d\.\s/);
        let output = '';
        if (isListItem && !inList) {
            output += '<ul>';
            inList = true;
        } else if (!isListItem && inList) {
            output += '</ul>';
            inList = false;
        }
        if (isListItem) {
            const content = line.substring(line.search(/\S/)).replace(/^-\s*|^\d\.\s*/, '');
            output += `<li>${content.trim()}</li>`;
        } else {
            output += line;
        }
        return output;
    }).join('');
    if (inList) html += '</ul>';
    return html.replace(/\n/g, '<br />');
};

// --- THEMED UI COMPONENTS ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-primary border border-border-color rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', disabled = false, variant = 'primary' }) => {
    const baseClasses = 'px-5 py-2 font-bold rounded-lg tracking-wide uppercase transition-all duration-300 transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100';
    const variantClasses = {
        primary: 'bg-accent text-background shadow-md shadow-accent-glow hover:bg-accent-hover focus:ring-4 focus:ring-accent-glow',
        secondary: 'bg-secondary text-text-primary hover:bg-border-color',
        danger: 'bg-danger text-white shadow-md shadow-glow-danger hover:bg-red-700 focus:ring-4 focus:ring-red-400/50',
        success: 'bg-success text-white shadow-md shadow-glow-success hover:bg-green-700 focus:ring-4 focus:ring-green-400/50'
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </button>
    );
};


const Header = ({ title, subtitle }) => (
    <header className="mb-8">
        <h2 className="text-4xl font-bold text-text-primary mb-1">{title}</h2>
        <p className="text-text-secondary">{subtitle}</p>
    </header>
);

const ThemedModal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    className="bg-primary border border-border-color rounded-2xl shadow-xl w-full max-w-md m-4"
                >
                    <div className="p-6 border-b border-border-color flex justify-between items-center">
                        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                        <button onClick={onClose} className="text-text-secondary hover:text-accent text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- THEMED PAGE COMPONENTS ---

const Dashboard = () => {
    const securityScore = 85;
    const activityItems = [
        { icon: "user", text: "Successful login from Amsterdam, NL", time: "5 minutes ago", color: "text-success" },
        { icon: "link", text: "URL Scan: 'example.com'", time: "1 hour ago", color: "text-accent" },
        { icon: "lock", text: "New password generated", time: "2 days ago", color: "text-indigo-400" },
        { icon: "file", text: "File 'report.docx' scanned: Clean", time: "3 days ago", color: "text-success" }
    ];
    const securityTips = ["Regularly review app permissions on your mobile devices to ensure they only have access to the data they need."];

    return (
        <>
            <Header title="Dashboard" subtitle="Your security command center." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path className="text-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                                <motion.path
                                    className="text-accent drop-shadow-glow-accent"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray="100, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - securityScore }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-text-primary">{securityScore}</span>
                                <span className="text-sm text-text-secondary">/ 100</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary">Security Score: High</h3>
                            <p className="text-text-secondary mt-1">Great job! Your security posture is strong. Complete the roadmap items to improve even more.</p>
                            <Button className="mt-4 text-sm">View Full Report</Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Account Activity</h3>
                        <ul className="space-y-4">
                            {activityItems.map((item, index) => (
                                <li key={index} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full bg-secondary ${item.color}`}><Icon name={item.icon} className="w-5 h-5" /></div>
                                    <div className="flex-grow"><p className="text-text-primary">{item.text}</p></div>
                                    <p className="text-sm text-text-secondary whitespace-nowrap">{item.time}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Your Security Roadmap</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-background"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-text-secondary line-through">Enable 2FA</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-accent rounded-full"></div><span className="text-text-primary font-medium">Secure Social Media</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-border-color rounded-full"></div><span className="text-text-secondary">Update Passwords</span></li>
                        </ul>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-primary to-secondary">
                        <div className="flex items-center gap-3 mb-3"><Icon name="lightbulb" className="w-6 h-6 text-yellow-400" /><h3 className="text-xl font-semibold text-text-primary">Tip of the Day</h3></div>
                        <p className="text-text-secondary">{securityTips[0]}</p>
                    </Card>
                </div>
            </div>
        </>
    );
};

const ScannersPage = () => {
    const [activeScanner, setActiveScanner] = useState('malware');
    const renderScanner = () => {
        switch (activeScanner) {
            case 'malware': return <div>Malware Scanner Component</div>;
            case 'phishing': return <div>Phishing Scanner Component</div>;
            case 'breach': return <div>Breach Detector Component</div>;
            default: return <div>Malware Scanner Component</div>;
        }
    };
    const TabButton = ({ scannerName, children }) => (
        <button
            onClick={() => setActiveScanner(scannerName)}
            className={`relative px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${activeScanner === scannerName ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
            {children}
            {activeScanner === scannerName && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    layoutId="scannerTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
        </button>
    );
    return (
        <>
            <Header title="Security Scanners" subtitle="Proactively check for threats to your digital security." />
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2 p-1.5 bg-primary rounded-xl border border-border-color">
                    <TabButton scannerName="malware">Malware Scanner</TabButton>
                    <TabButton scannerName="phishing">Phishing Scanner</TabButton>
                    <TabButton scannerName="breach">Breach Detector</TabButton>
                </div>
            </div>
            <Card className="p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeScanner}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderScanner()}
                    </motion.div>
                </AnimatePresence>
            </Card>
        </>
    );
};

const CyberAssistantPage = () => {
    const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I am Cy, your personal AI security expert. How can I help you fortify your digital defenses today?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        const systemPrompt = "You are a friendly and helpful cybersecurity expert named Cy. Your goal is to explain complex security topics in a simple, easy-to-understand way for non-technical users. Avoid jargon where possible, or explain it clearly if you must use it. Keep your responses concise and actionable. Use markdown for formatting like bolding and lists.";
        const aiResponse = await callGeminiAPI(input, systemPrompt);
        
        const aiMessage = { sender: 'ai', text: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
             <Header title="Cyber Assistant" subtitle="Your personal AI-powered security expert." />
             <Card className="flex-grow flex flex-col p-4">
                 <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                     {messages.map((msg, index) => (
                         <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                             {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0"><Icon name="shield" className="w-6 h-6"/></div>}
                             <div className={`p-4 rounded-2xl max-w-lg ${msg.sender === 'user' ? 'bg-accent text-background rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                                 <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(msg.text) }} />
                             </div>
                         </div>
                     ))}
                     {isLoading && (
                          <div className="flex items-end gap-3"><div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0"><Icon name="shield" className="w-6 h-6"/></div><div className="p-4 rounded-2xl bg-secondary rounded-bl-none"><div className="flex items-center gap-2 text-text-secondary"><div className="w-2 h-2 bg-current rounded-full animate-bounce"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce delay-300"></div></div></div></div>
                     )}
                     <div ref={chatEndRef} />
                 </div>
                 <form onSubmit={handleSendMessage} className="mt-4 border-t border-border-color pt-4">
                     <div className="flex items-center gap-2">
                         <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about phishing, passwords, or anything security..." className="flex-grow p-3 border border-border-color rounded-lg bg-secondary text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"/>
                         <Button type="submit" disabled={isLoading} className="p-3"><Icon name="send" className="w-6 h-6"/></Button>
                     </div>
                 </form>
             </Card>
        </div>
    );
};

const HealthCheckPage = () => { return <Header title="Health Check" subtitle="Coming Soon." /> };
const PasswordVaultPage = () => { return <Header title="Password Vault" subtitle="Coming Soon." /> };
const DigitalPrivacyPage = () => { return <Header title="Digital Privacy" subtitle="Coming Soon." /> };
const EmergencyGuidesPage = () => { return <Header title="Emergency Guides" subtitle="Coming Soon." /> };
const SettingsPage = () => { return <Header title="Settings" subtitle="Coming Soon." /> };

// --- MAIN APP COMPONENT ---

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Enforce dark mode for this theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Framer Motion variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, filter: 'blur(5px)', y: 20 },
    in: { opacity: 1, filter: 'blur(0px)', y: 0 },
    out: { opacity: 0, filter: 'blur(5px)', y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  const renderPage = () => {
    let componentToRender;
    switch (activePage) {
      case 'dashboard': componentToRender = <Dashboard />; break;
      case 'scanners': componentToRender = <ScannersPage />; break;
      case 'assistant': componentToRender = <CyberAssistantPage />; break;
      case 'healthcheck': componentToRender = <HealthCheckPage />; break;
      case 'vault': componentToRender = <PasswordVaultPage />; break;
      case 'privacy': componentToRender = <DigitalPrivacyPage />; break;
      case 'emergency': componentToRender = <EmergencyGuidesPage />; break;
      case 'settings': componentToRender = <SettingsPage />; break;
      default: componentToRender = <Dashboard />;
    }
    
    return (
        <motion.div
            key={activePage}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {componentToRender}
        </motion.div>
    );
  };

  const NavLink = ({ pageName, icon, children }) => (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); setActivePage(pageName); }}
      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${activePage === pageName ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
    >
      {activePage === pageName && (
        <motion.div
          layoutId="active-nav-link"
          className="absolute inset-0 bg-accent/10 rounded-lg border-l-2 border-accent"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon name={icon} className="w-5 h-5 z-10" /> 
      <span className="z-10">{children}</span>
    </a>
  );

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="bg-background min-h-screen font-sans text-text-primary">
      <div className="flex">
        <aside className="w-64 bg-primary h-screen sticky top-0 border-r border-border-color p-4 flex flex-col">
          <div className="flex items-center gap-2 px-2 py-4 border-b border-border-color">
            <Icon name="shield" className="w-8 h-8 text-accent drop-shadow-glow-accent" />
            <h1 className="text-xl font-bold text-text-primary">CyberSafeHub</h1>
          </div>
          <nav className="mt-8 flex-grow space-y-2">
            <NavLink pageName="dashboard" icon="layoutDashboard">Dashboard</NavLink>
            <NavLink pageName="scanners" icon="scan">Scanners</NavLink>
            <NavLink pageName="assistant" icon="messageCircle">Cyber Assistant</NavLink>
            <NavLink pageName="healthcheck" icon="checkCircle">Health Check</NavLink>
            <NavLink pageName="vault" icon="lock">Password Vault</NavLink>
            <NavLink pageName="privacy" icon="book">Digital Privacy</NavLink>
            <NavLink pageName="emergency" icon="alertTriangle">Emergency Guides</NavLink>
          </nav>
          <div className="mt-auto">
            <NavLink pageName="settings" icon="settings">Settings</NavLink>
          </div>
        </aside>
        
        <main className="flex-1 p-8 overflow-y-auto h-screen">
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}