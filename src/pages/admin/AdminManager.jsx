import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const ROLES = ['super_admin', 'analyst', 'content_manager', 'support'];
const ROLE_CONFIG = {
    super_admin: { label: 'Super Admin', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', desc: 'Full platform access' },
    analyst: { label: 'Analyst', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', desc: 'Threats & scanners only' },
    content_manager: { label: 'Content Manager', color: 'text-green-400 bg-green-400/10 border-green-400/30', desc: 'Academy & CMS only' },
    support: { label: 'Support', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', desc: 'User accounts only' },
};

export default function AdminManager() {
    const { currentAdmin, adminRole } = useAdminAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('analyst');
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const getToken = useCallback(async () => {
        if (!currentAdmin) return null;
        return currentAdmin.getIdToken();
    }, [currentAdmin]);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch admins');
            const data = await res.json();
            setAdmins(data.admins || []);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    }, [getToken]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const addAdmin = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) return;
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/admins`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail.trim(), role: newRole })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            const data = await res.json();
            setAdmins(prev => [...prev, data.admin]);
            setNewEmail(''); setAdding(false);
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const changeRole = async (email, role) => {
        setActionId(email);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/admins/${encodeURIComponent(email)}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });
            if (!res.ok) throw new Error('Failed to update role');
            const data = await res.json();
            setAdmins(prev => prev.map(a => a.email === email ? data.admin : a));
        } catch (e) { alert('Error: ' + e.message); } finally { setActionId(null); }
    };

    const removeAdmin = async (email) => {
        if (!window.confirm(`Remove admin privileges from ${email}?`)) return;
        setActionId(email + '_del');
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/admins/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setAdmins(prev => prev.filter(a => a.email !== email));
        } catch (e) { alert('Error: ' + e.message); } finally { setActionId(null); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Icon name="shieldAlert" className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-2xl font-bold">Admin Role Manager</h1>
                        <p className="text-text-secondary text-sm">Manage admin accounts and role assignments · <span className="text-purple-400">Super Admin only</span></p>
                    </div>
                </div>
                <button onClick={() => setAdding(!adding)} className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
                    <Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'Add Admin'}
                </button>
            </div>

            {/* Role Reference */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ROLES.map(r => {
                    const cfg = ROLE_CONFIG[r];
                    return (
                        <div key={r} className={`glass-panel p-4 border border-[currentColor]/10`}>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>{cfg.label}</span>
                            <p className="text-text-secondary text-xs mt-2">{cfg.desc}</p>
                            <p className="font-bold text-text-primary mt-1">{admins.filter(a => a.role === r).length}</p>
                        </div>
                    );
                })}
            </div>

            {/* Add Form */}
            {adding && (
                <div className="glass-panel p-5 border-l-4 border-l-accent">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Grant Admin Access</h3>
                    <form onSubmit={addAdmin} className="flex gap-3 flex-wrap">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder="Firebase user email..."
                            className="input-field flex-1 min-w-[200px]"
                            required
                        />
                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field">
                            {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                        </select>
                        <button type="submit" disabled={saving} className="btn-primary text-sm">
                            {saving ? 'Adding...' : 'Grant Access'}
                        </button>
                    </form>
                    <p className="text-text-secondary text-xs mt-3">
                        ⚠️ The user must already exist in Firebase Auth. Their email must match exactly.
                    </p>
                </div>
            )}

            {/* Admin Table */}
            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
            ) : error ? (
                <div className="glass-panel p-6 text-danger text-sm">{error}</div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-glass-border text-text-secondary text-xs">
                                <th className="text-left px-4 py-3 font-medium">Email</th>
                                <th className="text-left px-4 py-3 font-medium">Current Role</th>
                                <th className="text-left px-4 py-3 font-medium">Change Role</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(a => {
                                const cfg = ROLE_CONFIG[a.role] || ROLE_CONFIG.support;
                                const isSelf = a.email === currentAdmin?.email;
                                return (
                                    <tr key={a.email} className="border-b border-glass-border/40 hover:bg-white/2">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                                                    {a.email[0].toUpperCase()}
                                                </div>
                                                <span className="font-mono text-xs text-text-primary">{a.email}</span>
                                                {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">You</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>{cfg.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {!isSelf && (
                                                <select
                                                    value={a.role}
                                                    onChange={e => changeRole(a.email, e.target.value)}
                                                    disabled={actionId === a.email}
                                                    className="input-field text-xs py-1"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {!isSelf && (
                                                <button
                                                    onClick={() => removeAdmin(a.email)}
                                                    disabled={actionId === a.email + '_del'}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium border text-danger border-danger/30 hover:bg-danger/10 transition-colors disabled:opacity-50"
                                                >
                                                    {actionId === a.email + '_del' ? '...' : 'Revoke'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
