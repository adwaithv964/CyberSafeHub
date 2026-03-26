import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Icon from '../../components/Icon';
import { API_BASE_URL } from '../../config';

const GROUPS = [
    {
        title: "Main Pages",
        keys: [
            { id: 'network', label: 'IP & DNS Checker' },
            { id: 'vault', label: 'Password Vault' },
            { id: 'assistant', label: 'Cyber Assistant' },
            { id: 'healthcheck', label: 'Health Check' },
            { id: 'news', label: 'Cyber News' },
            { id: 'privacy', label: 'Digital Privacy' },
            { id: 'emergency', label: 'Emergency Guides' }
        ]
    },
    {
        title: "Scanners",
        keys: [
            { id: 'scanners', label: 'Scanners Hub' },
            { id: 'scanners_malware', label: 'Malware Scanner' },
            { id: 'scanners_phishing', label: 'Phishing Scanner' },
            { id: 'scanners_breach', label: 'Breach Detector' }
        ]
    },
    {
        title: "Cyber Tools",
        keys: [
            { id: 'tools', label: 'Cyber Tools Hub' },
            { id: 'tools_metadata', label: 'Metadata Washer' },
            { id: 'tools_wifi', label: 'WiFi Radar' },
            { id: 'tools_share', label: 'Secure Share' },
            { id: 'tools_converter', label: 'Conversion System' },
            { id: 'tools_auditor', label: 'Code Security Auditor' },
            { id: 'tools_policy', label: 'Privacy Policy Decoder' }
        ]
    },
    {
        title: "Cyber Academy",
        keys: [
            { id: 'academy', label: 'Cyber Academy Hub' },
            { id: 'academy_phishing', label: 'Phishing Simulator' },
            { id: 'academy_cracker', label: 'Password Cracker' },
            { id: 'academy_crypto', label: 'Encryption Lab' },
            { id: 'academy_stego', label: 'Steganography Studio' },
            { id: 'academy_incident', label: 'Incident Response RPG' }
        ]
    }
];

export default function MaintenanceManager() {
    const { currentAdmin } = useAdminAuth();
    const [settings, setSettings] = useState({});
    const [originalSettings, setOriginalSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (currentAdmin) fetchSettings();
    }, [currentAdmin]);

    const fetchSettings = async () => {
        try {
            const token = await currentAdmin.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/settings/maintenance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            setSettings(data.maintenanceData || {});
            setOriginalSettings(data.maintenanceData || {});
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id) => {
        // Toggle the value. If not explicitly FALSE initially, we treat it as TRUE.
        setSettings(prev => ({
            ...prev,
            [id]: prev[id] === false ? true : false
        }));
    };

    const handleSave = async () => {
        if (!currentAdmin) return;
        setSaving(true);
        setError('');
        setSuccessMsg('');
        try {
            const token = await currentAdmin.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/settings/maintenance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ maintenanceData: settings })
            });
            if (!res.ok) throw new Error('Failed to save settings');
            setOriginalSettings(settings);
            setSuccessMsg('Maintenance settings saved successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

    const ToggleSwitch = ({ checked, onChange }) => (
        <button
            type="button"
            className={`${checked ? 'bg-success' : 'bg-danger'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background`}
            onClick={onChange}
        >
            <span
                aria-hidden="true"
                className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Maintenance Mode Controls</h1>
                    <p className="text-sm text-text-secondary mt-1">Granular controls to disable specific tools or pages without taking the entire site offline.</p>
                </div>
                <div className="flex items-center gap-3">
                    {successMsg && <span className="text-success text-sm flex items-center gap-1"><Icon name="checkCircle" className="w-4 h-4" /> Saved</span>}
                    {error && <span className="text-danger text-sm">{error}</span>}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? <Icon name="refreshCw" className="w-4 h-4 animate-spin" /> : <Icon name="save" className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GROUPS.map((group, i) => (
                    <div key={i} className="bg-glass-panel border border-glass-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-glass-border pb-2">
                            {group.title}
                        </h3>
                        <div className="space-y-4">
                            {group.keys.map(item => {
                                const isActive = settings[item.id] !== false; // default true
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-glass-border">
                                        <div>
                                            <p className="font-medium text-text-primary">{item.label}</p>
                                            <p className={`text-xs mt-0.5 font-medium ${isActive ? 'text-success' : 'text-danger flex items-center gap-1'}`}>
                                                {isActive ? 'Active' : <><Icon name="tool" className="w-3 h-3" /> Under Maintenance</>}
                                            </p>
                                        </div>
                                        <ToggleSwitch
                                            checked={isActive}
                                            onChange={() => handleToggle(item.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-warning/10 border border-warning/30 p-4 rounded-xl flex gap-3 text-warning-text max-w-2xl mt-8">
                <Icon name="alertTriangle" className="w-6 h-6 shrink-0 text-warning" />
                <div className="text-sm">
                    <p className="font-bold text-warning mb-1">Important Note</p>
                    <p className="opacity-90">Changes to maintenance mode take effect immediately for new requests. Connected users will see the changes within 5 minutes or on their next hard refresh.</p>
                </div>
            </div>
        </div>
    );
}
