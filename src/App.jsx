import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import Icon from './components/Icon';
import Dashboard from './pages/Dashboard';
import ScannersPage from './pages/ScannersPage';
import CyberAssistantPage from './pages/CyberAssistantPage';
import HealthCheckPage from './pages/HealthCheckPage';
import MetadataWasher from './components/tools/MetadataWasher';
import UsernameDetective from './components/tools/UsernameDetective';
import WiFiRadar from './components/tools/WiFiRadar';
import SecureShare from './components/tools/SecureShare';
import ConversionSystem from './components/tools/conversion/ConversionSystem';
import CodeSecurityAuditor from './components/tools/CodeSecurityAuditor';
import PrivacyPolicyDecoder from './components/tools/PrivacyPolicyDecoder';
import PasswordVaultPage from './pages/PasswordVaultPage';
import DigitalPrivacyPage from './pages/DigitalPrivacyPage';
import EmergencyGuidesPage from './pages/EmergencyGuidesPage';
import SettingsPage from './pages/SettingsPage';
import NetworkToolPage from './pages/NetworkToolPage';
import CyberNewsPage from './pages/CyberNewsPage';
import SteganographyPage from './pages/SteganographyPage';
import CyberToolsPage from './pages/CyberToolsPage';
import CyberAcademyPage from './pages/CyberAcademyPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BackgroundBlobs from './components/BackgroundBlobs';
import SEO from './components/SEO';

function AppContent() {
    const { currentUser, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();

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

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            setError('Failed to log out');
            console.error(err);
        }
    }

    const NavLink = ({ to, icon, children }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

        return (
            <Link
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
                {isActive && (
                    <motion.div
                        layoutId="active-nav-link"
                        className="absolute inset-0 bg-accent/10 rounded-lg border-l-2 border-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
                <Icon name={icon} className="w-5 h-5 z-10" />
                <span className="z-10">{children}</span>
            </Link>
        );
    };

    if (!currentUser) {
        return <LandingPage />;
    }

    return (
        <div className="h-screen w-full flex flex-col font-sans text-text-primary relative overflow-hidden">
            <SEO />
            <BackgroundBlobs />
            {/* Mobile Header - Flex-none ensures it takes only necessary space */}
            <div className="md:hidden flex-none flex items-center p-4 glass-panel m-2 z-50 gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-primary p-1 hover:text-accent transition-colors">
                    <Icon name={isSidebarOpen ? "x" : "menu"} className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="shield" className="w-8 h-8 text-accent drop-shadow-glow-accent" />
                    <h1 className="text-xl font-bold text-text-primary tracking-wider">CyberSafeHub</h1>
                </div>
            </div>

            {/* Main Content Area - Flex-1 takes remaining space */}
            <div className="flex-1 flex relative items-start p-4 gap-4 overflow-hidden">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside className={`w-64 glass-panel h-[calc(100vh-2rem)] flex flex-col fixed inset-y-4 left-4 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:inset-auto md:left-auto md:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
                    <div className="flex items-center gap-2 px-6 py-6 border-b border-glass-border">
                        <Icon name="shield" className="w-8 h-8 text-accent drop-shadow-glow-accent" />
                        <h1 className="text-xl font-bold text-text-primary tracking-wider">CyberSafeHub</h1>
                    </div>
                    <nav className="mt-6 flex-grow space-y-2 px-4 overflow-y-auto custom-scrollbar">
                        <NavLink to="/" icon="layoutDashboard">Dashboard</NavLink>
                        <NavLink to="/network" icon="globe">IP & DNS Checker</NavLink>
                        <NavLink to="/scanners" icon="scan">Scanners</NavLink>
                        <NavLink to="/vault" icon="lock">Password Vault</NavLink>
                        <NavLink to="/assistant" icon="bot">Cyber Assistant</NavLink>
                        <NavLink to="/healthcheck" icon="checkCircle">Health Check</NavLink>
                        <NavLink to="/tools" icon="terminal">Cyber Tools</NavLink>
                        <NavLink to="/academy" icon="academicCap">Cyber Academy</NavLink>
                        <NavLink to="/news" icon="newspaper">Cyber News</NavLink>
                        <NavLink to="/privacy" icon="book">Digital Privacy</NavLink>
                        <NavLink to="/emergency" icon="alertTriangle">Emergency Guides</NavLink>
                    </nav>
                    <div className="mt-auto space-y-2 p-4 border-t border-glass-border">
                        <NavLink to="/settings" icon="settings">Settings</NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-danger hover:bg-danger/10 hover:shadow-glow-danger"
                        >
                            <Icon name="logOut" className="w-5 h-5 z-10" />
                            <span className="z-10">Sign Out</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 glass-panel h-full overflow-y-auto p-8 relative scroll-smooth">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <Dashboard />
                                </motion.div>
                            } />
                            <Route path="/network" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <NetworkToolPage />
                                </motion.div>
                            } />
                            <Route path="/scanners" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <ScannersPage />
                                </motion.div>
                            } />
                            <Route path="/news" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CyberNewsPage />
                                </motion.div>
                            } />
                            <Route path="/assistant" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CyberAssistantPage />
                                </motion.div>
                            } />
                            <Route path="/healthcheck" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <HealthCheckPage />
                                </motion.div>
                            } />
                            <Route path="/vault" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <PasswordVaultPage />
                                </motion.div>
                            } />
                            <Route path="/privacy" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <DigitalPrivacyPage />
                                </motion.div>
                            } />
                            <Route path="/emergency" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <EmergencyGuidesPage />
                                </motion.div>
                            } />
                            <Route path="/academy" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CyberAcademyPage />
                                </motion.div>
                            } />
                            <Route path="/academy/:moduleId" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CyberAcademyPage />
                                </motion.div>
                            } />
                            <Route path="/tools" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CyberToolsPage />
                                </motion.div>
                            } />
                            <Route path="/tools/metadata-washer" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <MetadataWasher />
                                </motion.div>
                            } />
                            <Route path="/tools/username-detective" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <UsernameDetective />
                                </motion.div>
                            } />
                            <Route path="/tools/wifi-radar" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <WiFiRadar />
                                </motion.div>
                            } />
                            <Route path="/tools/secure-share" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <SecureShare />
                                </motion.div>
                            } />
                            <Route path="/tools/conversion-system" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <ConversionSystem />
                                </motion.div>
                            } />
                            <Route path="/tools/code-auditor" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <CodeSecurityAuditor />
                                </motion.div>
                            } />
                            <Route path="/tools/privacy-decoder" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <PrivacyPolicyDecoder />
                                </motion.div>
                            } />
                            <Route path="/settings" element={
                                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    <SettingsPage />
                                </motion.div>
                            } />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}