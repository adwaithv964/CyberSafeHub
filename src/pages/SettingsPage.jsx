import React, { useState } from 'react';
import Icon from '../components/Icon';
import ThemedModal from '../components/ThemedModal';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', body: '', onConfirm: null, confirmText: 'OK' });

    const showModal = (config) => {
        setModalConfig(config);
        setIsModalOpen(true);
    };

    const handleToggle2FA = () => {
        showModal({
            title: "Two-Factor Authentication",
            body: "This is a placeholder. In a real app, this would guide you through setting up 2FA with an authenticator app.",
            onConfirm: () => setIsModalOpen(false)
        });
    };

    const SettingsSection = ({ title, subtitle, children }) => (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{subtitle}</p>
            <div className="space-y-6">{children}</div>
        </div>
    );

    const Toggle = ({ label, description, isEnabled, onToggle }) => (
        <div className="flex justify-between items-center">
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <SettingsSection title="Profile & Account" subtitle="Manage your personal information and connected accounts.">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">U</div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input type="text" defaultValue="User" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" defaultValue="user@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Update Profile</button>
                        <hr className="dark:border-gray-600" />
                        <p className="font-medium text-gray-800 dark:text-gray-100">Change Password</p>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">Change Password</button>
                    </SettingsSection>
                );
            case 'security':
                return (
                    <SettingsSection title="Security & Privacy" subtitle="Control your security settings and manage active sessions.">
                        <Toggle label="Two-Factor Authentication (2FA)" description="Add an extra layer of security to your account." isEnabled={false} onToggle={handleToggle2FA} />
                        <hr className="dark:border-gray-600" />
                        <p className="font-medium text-gray-800 dark:text-gray-100">Active Sessions</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.</p>
                        <button className="w-full text-left px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100">Log out of all other sessions</button>
                    </SettingsSection>
                );
            case 'notifications':
                return (
                    <SettingsSection title="Notifications" subtitle="Choose how you want to be notified.">
                        <Toggle label="Email Alerts" description="Receive alerts for data breaches and suspicious logins." isEnabled={true} onToggle={() => { }} />
                        <Toggle label="In-App Notifications" description="Get notified about security tips and new features." isEnabled={true} onToggle={() => { }} />
                        <Toggle label="Security Reminders" description="Periodic reminders to check your security health." isEnabled={false} onToggle={() => { }} />
                    </SettingsSection>
                );
            case 'appearance':
                return (
                    <SettingsSection title="Appearance" subtitle="Customize the look and feel of the application.">
                        <p className="font-medium text-gray-800 dark:text-gray-100">Theme</p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 border rounded-md text-sm font-medium border-blue-500 bg-blue-50 dark:bg-blue-900/50">Light</button>
                            <button className="px-4 py-2 border rounded-md text-sm font-medium">Dark</button>
                            <button className="px-4 py-2 border rounded-md text-sm font-medium">System</button>
                        </div>
                    </SettingsSection>
                );
            case 'data':
                return (
                    <SettingsSection title="Data & Account Management" subtitle="Manage your personal data and account status.">
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">Download My Data</button>
                        <hr className="dark:border-gray-600" />
                        <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all of your data. This action is irreversible.</p>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Delete My Account</button>
                    </SettingsSection>
                );
            default:
                return null;
        }
    };

    const NavItem = ({ tab, icon, children }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg text-sm transition-colors ${activeTab === tab ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <Icon name={icon} className="w-5 h-5" />
            {children}
        </button>
    );

    return (
        <>
            <ThemedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalConfig.title}
            >
                <p>{modalConfig.body}</p>
                <div className="text-right mt-4">
                    <button onClick={modalConfig.onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">{modalConfig.confirmText}</button>
                </div>
            </ThemedModal>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences.</p>
            </header>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="space-y-1">
                        <NavItem tab="profile" icon="user">Profile & Account</NavItem>
                        <NavItem tab="security" icon="shield">Security & Privacy</NavItem>
                        <NavItem tab="notifications" icon="bell">Notifications</NavItem>
                        <NavItem tab="appearance" icon="palette">Appearance</NavItem>
                        <NavItem tab="data" icon="database">Data & Accounts</NavItem>
                    </nav>
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

export default SettingsPage;
