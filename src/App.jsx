import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './LandingPage';
import Icon from './components/Icon';
import Dashboard from './pages/Dashboard';
import ScannersPage from './pages/ScannersPage';
import CyberAssistantPage from './pages/CyberAssistantPage';
import HealthCheckPage from './pages/HealthCheckPage';
import PasswordVaultPage from './pages/PasswordVaultPage';
import DigitalPrivacyPage from './pages/DigitalPrivacyPage';
import EmergencyGuidesPage from './pages/EmergencyGuidesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
    const [hasEntered, setHasEntered] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            onClick={(e) => {
                e.preventDefault();
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

    if (!hasEntered) {
        return <LandingPage onEnter={() => setHasEntered(true)} />;
    }

    return (
        <div className="bg-background min-h-screen font-sans text-text-primary">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 bg-primary border-b border-border-color sticky top-0 z-50 gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-primary p-1">
                    <Icon name={isSidebarOpen ? "x" : "menu"} className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="shield" className="w-8 h-8 text-accent drop-shadow-glow-accent" />
                    <h1 className="text-xl font-bold text-text-primary">CyberSafeHub</h1>
                </div>
            </div>

            <div className="flex relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside className={`w-64 bg-primary h-screen border-r border-border-color p-4 flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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