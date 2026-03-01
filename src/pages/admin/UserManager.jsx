import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const BADGE_COLORS = {
    super_admin: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    analyst: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    content_manager: 'text-green-400 bg-green-400/10 border-green-400/30',
    support: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

export default function UserManager() {
    const { currentAdmin } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null); // uid being processed
    const [nextPageToken, setNextPageToken] = useState(null);

    const fetchUsers = useCallback(async (pageToken = null) => {
        if (!currentAdmin) return;
        setLoading(true);
        try {
            const token = await currentAdmin.getIdToken();
            const url = pageToken
                ? `${API_BASE_URL}/api/admin/users?pageToken=${pageToken}`
                : `${API_BASE_URL}/api/admin/users`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(prev => pageToken ? [...prev, ...data.users] : data.users);
            setNextPageToken(data.nextPageToken || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentAdmin]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const toggleDisabled = async (uid, currentlyDisabled) => {
        if (!currentAdmin) return;
        setActionLoading(uid);
        try {
            const token = await currentAdmin.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${uid}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ disabled: !currentlyDisabled })
            });
            if (!res.ok) throw new Error('Action failed');
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, disabled: !currentlyDisabled } : u));
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Icon name="users" className="w-8 h-8 text-accent" />
                    <div>
                        <h1 className="text-2xl font-bold">User Manager</h1>
                        <p className="text-text-secondary text-sm">{users.length} Firebase users loaded</p>
                    </div>
                </div>
                <button onClick={() => fetchUsers()} className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
                    <Icon name="refreshCw" className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Search */}
            <div className="glass-panel p-3 flex items-center gap-3">
                <Icon name="search" className="w-4 h-4 text-text-secondary" />
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
                />
                {search && <button onClick={() => setSearch('')} className="text-text-secondary hover:text-text-primary"><Icon name="x" className="w-4 h-4" /></button>}
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                {loading && users.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-danger">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-glass-border text-text-secondary">
                                    <th className="text-left px-4 py-3 font-medium">User</th>
                                    <th className="text-left px-4 py-3 font-medium">Provider</th>
                                    <th className="text-left px-4 py-3 font-medium">Verified</th>
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                    <th className="text-left px-4 py-3 font-medium">Joined</th>
                                    <th className="text-left px-4 py-3 font-medium">Last Sign-in</th>
                                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">No users found.</td></tr>
                                ) : filteredUsers.map(user => (
                                    <tr key={user.uid} className={`border-b border-glass-border/40 hover:bg-white/2 transition-colors ${user.disabled ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL
                                                    ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    : <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                                                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                                                    </div>
                                                }
                                                <div>
                                                    <p className="font-medium text-text-primary">{user.displayName || '—'}</p>
                                                    <p className="text-text-secondary text-xs font-mono">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.providerData || []).map(p => (
                                                    <span key={p} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-text-secondary">{p}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.emailVerified
                                                ? <span className="text-success flex items-center gap-1"><Icon name="checkCircle" className="w-3 h-3" /> Yes</span>
                                                : <span className="text-warning flex items-center gap-1"><Icon name="alertCircle" className="w-3 h-3" /> No</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user.disabled ? 'text-danger bg-danger/10 border-danger/30' : 'text-success bg-success/10 border-success/30'}`}>
                                                {user.disabled ? 'Disabled' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">
                                            {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleDisabled(user.uid, user.disabled)}
                                                disabled={actionLoading === user.uid}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${user.disabled
                                                    ? 'text-success border-success/30 hover:bg-success/10'
                                                    : 'text-danger border-danger/30 hover:bg-danger/10'
                                                    } disabled:opacity-50`}
                                            >
                                                {actionLoading === user.uid ? '...' : user.disabled ? 'Enable' : 'Disable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {nextPageToken && (
                <button
                    onClick={() => fetchUsers(nextPageToken)}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-glass-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors text-sm"
                >
                    {loading ? 'Loading...' : 'Load More Users'}
                </button>
            )}
        </div>
    );
}
