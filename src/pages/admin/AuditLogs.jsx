import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const ACTION_COLORS = {
    USER_DISABLED: 'text-danger',
    USER_ENABLED: 'text-success',
    USER_DELETED: 'text-danger',
    THREAT_DELETED: 'text-warning',
    ANNOUNCEMENT_CREATED: 'text-accent',
    ANNOUNCEMENT_DELETED: 'text-danger',
    ANNOUNCEMENT_ACTIVATED: 'text-success',
    ANNOUNCEMENT_DEACTIVATED: 'text-warning',
    ADMIN_LOGIN: 'text-text-secondary',
};

const ACTION_ICONS = {
    USER_DISABLED: 'userX',
    USER_ENABLED: 'userCheck',
    USER_DELETED: 'trash2',
    THREAT_DELETED: 'trash2',
    ANNOUNCEMENT_CREATED: 'plus',
    ANNOUNCEMENT_DELETED: 'trash2',
    ANNOUNCEMENT_ACTIVATED: 'eye',
    ANNOUNCEMENT_DEACTIVATED: 'eyeOff',
    ADMIN_LOGIN: 'logIn',
};

export default function AuditLogs() {
    const { currentAdmin } = useAdminAuth();
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = useCallback(async (p = 1) => {
        if (!currentAdmin) return;
        setLoading(true);
        try {
            const token = await currentAdmin.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs?page=${p}&limit=30`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch audit logs');
            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentAdmin]);

    useEffect(() => { fetchLogs(1); }, [fetchLogs]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Icon name="activity" className="w-8 h-8 text-accent" />
                    <div>
                        <h1 className="text-2xl font-bold">Admin Audit Logs</h1>
                        <p className="text-text-secondary text-sm">{total} total events recorded</p>
                    </div>
                </div>
                <button onClick={() => fetchLogs(page)} className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
                    <Icon name="refreshCw" className="w-4 h-4" /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
            ) : error ? (
                <div className="glass-panel p-6 text-danger">{error}</div>
            ) : logs.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center text-text-secondary opacity-60">
                    <Icon name="clipboardList" className="w-12 h-12 mb-3" />
                    <p>No audit events recorded yet.</p>
                    <p className="text-xs mt-1">Admin actions (logins, deletes, etc.) will appear here.</p>
                </div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-glass-border text-text-secondary">
                                    <th className="text-left px-4 py-3 font-medium">Action</th>
                                    <th className="text-left px-4 py-3 font-medium">Admin</th>
                                    <th className="text-left px-4 py-3 font-medium">Target / Details</th>
                                    <th className="text-left px-4 py-3 font-medium">IP</th>
                                    <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id} className="border-b border-glass-border/40 hover:bg-white/2 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className={`flex items-center gap-2 font-mono text-xs font-semibold ${ACTION_COLORS[log.action] || 'text-text-primary'}`}>
                                                <Icon name={ACTION_ICONS[log.action] || 'activity'} className="w-3.5 h-3.5" />
                                                {log.action}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">{log.adminEmail}</td>
                                        <td className="px-4 py-3">
                                            {log.details && <p className="text-text-primary text-xs">{log.details}</p>}
                                            {log.target && <p className="text-text-secondary font-mono text-[10px] mt-0.5 truncate max-w-[200px]">{log.target}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">{log.ip || '—'}</td>
                                        <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { const p = page - 1; setPage(p); fetchLogs(p); }} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-glass-border text-text-secondary text-xs disabled:opacity-40 hover:border-accent/50 transition-colors">← Prev</button>
                    <span className="text-text-secondary text-xs">Page {page} of {totalPages}</span>
                    <button onClick={() => { const p = page + 1; setPage(p); fetchLogs(p); }} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-glass-border text-text-secondary text-xs disabled:opacity-40 hover:border-accent/50 transition-colors">Next →</button>
                </div>
            )}
        </div>
    );
}
