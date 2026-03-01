import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const TYPE_COLORS = {
    malware: 'text-danger bg-danger/10 border-danger/30',
    phishing: 'text-warning bg-warning/10 border-warning/30',
};

function SimpleBarChart({ labels, malware, phishing }) {
    const max = Math.max(...malware, ...phishing, 1);
    return (
        <div className="space-y-2">
            <div className="flex items-end gap-1.5 h-24">
                {labels.map((label, i) => (
                    <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '80px' }}>
                            <div
                                className="w-full bg-danger/60 rounded-t-sm transition-all duration-500"
                                style={{ height: `${(malware[i] / max) * 76}px`, minHeight: malware[i] > 0 ? '2px' : '0' }}
                                title={`Malware: ${malware[i]}`}
                            />
                            <div
                                className="w-full bg-warning/60 rounded-t-sm transition-all duration-500"
                                style={{ height: `${(phishing[i] / max) * 76}px`, minHeight: phishing[i] > 0 ? '2px' : '0' }}
                                title={`Phishing: ${phishing[i]}`}
                            />
                        </div>
                        <span className="text-[9px] text-text-secondary">{label.slice(5)}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-danger/60 inline-block" />Malware</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning/60 inline-block" />Phishing</span>
            </div>
        </div>
    );
}

export default function ThreatIntelligence() {
    const { currentAdmin } = useAdminAuth();
    const [threats, setThreats] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ labels: [], malware: [], phishing: [] });
    const [deletingId, setDeletingId] = useState(null);

    const getToken = useCallback(async () => {
        if (!currentAdmin) return null;
        return currentAdmin.getIdToken();
    }, [currentAdmin]);

    const fetchThreats = useCallback(async (p = 1, f = '') => {
        setLoading(true);
        try {
            const token = await getToken();
            const params = new URLSearchParams({ page: p, limit: 20 });
            if (f) params.set('type', f);
            const res = await fetch(`${API_BASE_URL}/api/admin/threats?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setThreats(data.threats || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const fetchStats = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/threats/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    }, [getToken]);

    useEffect(() => {
        fetchThreats(1, filter);
        fetchStats();
    }, [fetchThreats, fetchStats, filter]);

    const deleteThreat = async (id) => {
        if (!window.confirm('Delete this threat record?')) return;
        setDeletingId(id);
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/api/admin/threats/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreats(prev => prev.filter(t => t._id !== id));
            setTotal(prev => prev - 1);
            fetchStats();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Icon name="alertTriangle" className="w-8 h-8 text-danger" />
                <div>
                    <h1 className="text-2xl font-bold">Threat Intelligence</h1>
                    <p className="text-text-secondary text-sm">{total} total threat records</p>
                </div>
            </div>

            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="glass-panel p-5 col-span-2">
                    <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">7-Day Threat Activity</h3>
                    {stats.labels?.length > 0
                        ? <SimpleBarChart {...stats} />
                        : <p className="text-text-secondary text-sm py-6 text-center">No threat data in the last 7 days.</p>
                    }
                </div>
                <div className="grid grid-rows-2 gap-4">
                    <div className="glass-panel p-5 flex flex-col justify-between border-l-4 border-l-danger">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">Total Malware</span>
                        <span className="text-4xl font-bold text-danger">{stats.malware?.reduce((a, b) => a + b, 0) || 0}</span>
                        <span className="text-text-secondary text-xs">Last 7 days</span>
                    </div>
                    <div className="glass-panel p-5 flex flex-col justify-between border-l-4 border-l-warning">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">Total Phishing</span>
                        <span className="text-4xl font-bold text-warning">{stats.phishing?.reduce((a, b) => a + b, 0) || 0}</span>
                        <span className="text-text-secondary text-xs">Last 7 days</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {['', 'malware', 'phishing'].map(f => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-accent text-bg-primary border-accent' : 'border-glass-border text-text-secondary hover:border-accent/50 hover:text-text-primary'}`}
                    >
                        {f === '' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
                <button onClick={() => fetchThreats(page, filter)} className="ml-auto text-text-secondary hover:text-accent transition-colors">
                    <Icon name="refreshCw" className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-glass-border text-text-secondary">
                                    <th className="text-left px-4 py-3 font-medium">Type</th>
                                    <th className="text-left px-4 py-3 font-medium">Target</th>
                                    <th className="text-left px-4 py-3 font-medium">Details</th>
                                    <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {threats.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-10 text-center text-text-secondary">
                                        <Icon name="shieldCheck" className="w-10 h-10 mx-auto mb-2 text-success" />
                                        No threat records found.
                                    </td></tr>
                                ) : threats.map(t => (
                                    <tr key={t._id} className="border-b border-glass-border/40 hover:bg-white/2">
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${TYPE_COLORS[t.type] || 'text-text-secondary'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-text-primary max-w-[200px] truncate" title={t.target}>{t.target}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {(t.details || []).slice(0, 3).map((d, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-text-secondary">{d}</span>
                                                ))}
                                                {(t.details || []).length > 3 && <span className="text-[10px] text-text-secondary">+{t.details.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                                            {new Date(t.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => deleteThreat(t._id)}
                                                disabled={deletingId === t._id}
                                                className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                                            >
                                                <Icon name="trash2" className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { const p = page - 1; setPage(p); fetchThreats(p, filter); }} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-glass-border text-text-secondary text-xs disabled:opacity-40 hover:border-accent/50 transition-colors">← Prev</button>
                    <span className="text-text-secondary text-xs">Page {page} of {totalPages}</span>
                    <button onClick={() => { const p = page + 1; setPage(p); fetchThreats(p, filter); }} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-glass-border text-text-secondary text-xs disabled:opacity-40 hover:border-accent/50 transition-colors">Next →</button>
                </div>
            )}
        </div>
    );
}
