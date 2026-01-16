import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './LandingPage';
import Icon from './components/Icon';
import Dashboard from './pages/Dashboard';
import ScannersPage from './pages/ScannersPage';
import CyberAssistantPage from './pages/CyberAssistantPage';
import HealthCheckPage from './pages/HealthCheckPage';
import MetadataWasher from './components/tools/MetadataWasher';
import UsernameDetective from './components/tools/UsernameDetective';
import WiFiRadar from './components/tools/WiFiRadar';
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

function AppContent() {
    const { currentUser, logout } = useAuth();
    const [activePage, setActivePage] = useState(() => {
        const path = window.location.pathname;
        if (path.includes('/tools/metadata-washer')) return 'metadata-washer';
        if (path.includes('/tools/metadata-washer')) return 'metadata-washer';
        if (path.includes('/tools/username-detective')) return 'username-detective';
        if (path.includes('/tools/wifi-radar')) return 'wifi-radar';
        // if (path.startsWith('/tools')) return 'tools'; // Commented out to make Dashboard default on refresh
        return 'dashboard';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState('');

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

    const renderPage = () => {
        let componentToRender;
        switch (activePage) {
            case 'dashboard': componentToRender = <Dashboard onNavigate={setActivePage} />; break;
            case 'network': componentToRender = <NetworkToolPage />; break;
            case 'scanners': componentToRender = <ScannersPage />; break;
            case 'news': componentToRender = <CyberNewsPage />; break;
            case 'assistant': componentToRender = <CyberAssistantPage />; break;
            case 'healthcheck': componentToRender = <HealthCheckPage />; break;
            case 'vault': componentToRender = <PasswordVaultPage />; break;
            case 'privacy': componentToRender = <DigitalPrivacyPage />; break;
            case 'emergency': componentToRender = <EmergencyGuidesPage />; break;
            case 'academy': componentToRender = <CyberAcademyPage />; break;
            case 'tools': componentToRender = <CyberToolsPage onNavigate={setActivePage} />; break;
            case 'metadata-washer': componentToRender = <MetadataWasher onNavigate={setActivePage} />; break;
            case 'username-detective': componentToRender = <UsernameDetective onNavigate={setActivePage} />; break;
            case 'wifi-radar': componentToRender = <WiFiRadar onNavigate={setActivePage} />; break;
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
            onClick={(e) => {
                e.preventDefault();
                if (pageName === 'tools') window.history.pushState({}, '', '/tools');
                setActivePage(pageName);
                setIsSidebarOpen(false);
            }}
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

    if (!currentUser) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen font-sans text-text-primary relative overflow-hidden">
            <BackgroundBlobs />
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 glass-panel m-2 sticky top-2 z-50 gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-primary p-1 hover:text-accent transition-colors">
                    <Icon name={isSidebarOpen ? "x" : "menu"} className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="shield" className="w-8 h-8 text-accent drop-shadow-glow-accent" />
                    <h1 className="text-xl font-bold text-text-primary tracking-wider">CyberSafeHub</h1>
                </div>
            </div>

            <div className="flex relative items-start p-4 gap-4 h-screen overflow-hidden">
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
                        <NavLink pageName="dashboard" icon="layoutDashboard">Dashboard</NavLink>
                        <NavLink pageName="network" icon="globe">IP & DNS Checker</NavLink>
                        <NavLink pageName="scanners" icon="scan">Scanners</NavLink>
                        <NavLink pageName="vault" icon="lock">Password Vault</NavLink>
                        <NavLink pageName="assistant" icon="messageCircle">Cyber Assistant</NavLink>
                        <NavLink pageName="healthcheck" icon="checkCircle">Health Check</NavLink>
                        <NavLink pageName="tools" icon="terminal">Cyber Tools</NavLink>
                        <NavLink pageName="academy" icon="academicCap">Cyber Academy</NavLink>
                        <NavLink pageName="news" icon="newspaper">Cyber News</NavLink>
                        <NavLink pageName="privacy" icon="book">Digital Privacy</NavLink>
                        <NavLink pageName="emergency" icon="alertTriangle">Emergency Guides</NavLink>
                    </nav>
                    <div className="mt-auto space-y-2 p-4 border-t border-glass-border">
                        <NavLink pageName="settings" icon="settings">Settings</NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-danger hover:bg-danger/10 hover:shadow-glow-danger"
                        >
                            <Icon name="logOut" className="w-5 h-5 z-10" />
                            <span className="z-10">Sign Out</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 glass-panel h-full overflow-y-auto p-8 relative">
                    <AnimatePresence mode="wait">
                        {renderPage()}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}


export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}