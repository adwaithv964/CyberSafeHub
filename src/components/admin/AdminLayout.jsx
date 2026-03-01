import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink as RouterNavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import Icon from '../Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import BackgroundBlobs from '../BackgroundBlobs';

export default function AdminLayout() {
    const { currentAdmin, adminRole, logoutAdmin, loading } = useAdminAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-danger"></div>
            </div>
        );
    }

    if (!currentAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const NavLink = ({ to, icon, children, allowedRoles }) => {
        if (allowedRoles && !allowedRoles.includes(adminRole)) return null;

        const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));

        return (
            <RouterNavLink
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
                {isActive && (
                    <motion.div
                        layoutId="active-admin-nav"
                        className="absolute inset-0 bg-accent/10 rounded-lg border-l-2 border-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
                <Icon name={icon} className="w-5 h-5 z-10" />
                <span className="z-10">{children}</span>
            </RouterNavLink>
        );
    };

    return (
        <div className="h-screen w-full flex flex-col font-sans text-text-primary relative overflow-hidden bg-background">
            <BackgroundBlobs />

            {/* Mobile Header */}
            <div className="md:hidden flex-none flex items-center p-4 glass-panel m-2 z-50 gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-primary p-1 hover:text-accent transition-colors">
                    <Icon name={isSidebarOpen ? "x" : "menu"} className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="shield" className="w-8 h-8 text-danger drop-shadow-glow-danger" />
                    <h1 className="text-xl font-bold text-text-primary tracking-wider">Admin Panel</h1>
                </div>
            </div>

            <div className="flex-1 flex relative items-start p-4 gap-4 overflow-hidden">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside className={`w-64 glass-panel border-danger/20 h-[calc(100vh-2rem)] flex flex-col fixed inset-y-4 left-4 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:inset-auto md:left-auto md:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
                    <div className="flex items-center gap-2 px-6 py-6 border-b border-glass-border">
                        <Icon name="shieldAlert" className="w-8 h-8 text-danger drop-shadow-glow-danger" />
                        <div>
                            <h1 className="text-xl font-bold text-text-primary tracking-wider">Admin</h1>
                            <span className="text-xs text-text-secondary uppercase">{adminRole?.replace('_', ' ')}</span>
                        </div>
                    </div>

                    <nav className="mt-6 flex-grow space-y-2 px-4 overflow-y-auto custom-scrollbar">
                        <NavLink to="/admin" icon="layoutDashboard" allowedRoles={['super_admin', 'analyst', 'support']}>Command Center</NavLink>
                        <NavLink to="/admin/users" icon="users" allowedRoles={['super_admin', 'support']}>User Manager</NavLink>
                        <NavLink to="/admin/threats" icon="alertTriangle" allowedRoles={['super_admin', 'analyst']}>Threat Intel</NavLink>
                        <NavLink to="/admin/cyber-tools" icon="tool" allowedRoles={['super_admin', 'analyst']}>Cyber Tool Manager</NavLink>
                        <NavLink to="/admin/academy" icon="academicCap" allowedRoles={['super_admin', 'content_manager']}>Academy LMS</NavLink>
                        <NavLink to="/admin/content" icon="newspaper" allowedRoles={['super_admin', 'content_manager']}>Content CMS</NavLink>
                        <NavLink to="/admin/ai" icon="bot" allowedRoles={['super_admin']}>AI Governance</NavLink>
                        <NavLink to="/admin/admin-manager" icon="userCog" allowedRoles={['super_admin']}>Admin Manager</NavLink>
                    </nav>

                    <div className="mt-auto space-y-2 p-4 border-t border-glass-border">
                        <NavLink to="/admin/logs" icon="activity" allowedRoles={['super_admin']}>Audit Logs</NavLink>
                        <button
                            onClick={logoutAdmin}
                            className="w-full relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-danger hover:bg-danger/10 hover:shadow-glow-danger"
                        >
                            <Icon name="logOut" className="w-5 h-5 z-10" />
                            <span className="z-10">Admin Logout</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 glass-panel border-danger/10 h-full overflow-y-auto p-8 relative scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
