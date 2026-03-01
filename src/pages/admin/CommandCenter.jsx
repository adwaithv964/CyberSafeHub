import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

function MiniBarChart({ data, color }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1 h-10">
            {data.map((v, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${color}`}
                    style={{ height: `${Math.max((v / max) * 38, v > 0 ? 2 : 0)}px` }}
                    title={v}
                />
            ))}
        </div>
    );
}

export default function CommandCenter() {
    const { currentAdmin, adminRole } = useAdminAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentAdmin) return;
            try {
                const token = await currentAdmin.getIdToken();
                const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch dashboard data');
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [currentAdmin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-danger/10 text-danger rounded-xl border border-danger/30">
                <Icon name="alertTriangle" className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-bold">Error loading dashboard</h3>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    const totalThreats7d = (dashboardData?.threatTrend || []).reduce((a, b) => a + (b.count || 0), 0);
    const chartLabels = (dashboardData?.threatTrend || []).map(t => t._id?.slice(5) || '');
    const chartData = (dashboardData?.threatTrend || []).map(t => t.count || 0);

    // Build full 7-day series (fill missing days with 0)
    const last7Days = [];
    const last7Labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toISOString().split('T')[0];
        last7Labels.push(label.slice(5));
        const found = dashboardData?.threatTrend?.find(t => t._id === label);
        last7Days.push(found ? found.count : 0);
    }

    const statusColor = (s) =>
        s === 'operational' ? 'text-success' : s === 'degraded' ? 'text-warning' : 'text-danger';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon name="layoutDashboard" className="w-8 h-8 text-accent" />
                    <div>
                        <h1 className="text-2xl font-bold">Command Center</h1>
                        <p className="text-text-secondary text-sm">
                            Logged in as <span className="text-accent font-mono">{currentAdmin?.email}</span>
                            {adminRole && <span className="ml-2 px-2 py-0.5 rounded-full text-xs border border-accent/30 bg-accent/10 text-accent">{adminRole.replace('_', ' ')}</span>}
                        </p>
                    </div>
                </div>
                <p className="text-text-secondary text-xs hidden sm:block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 border-l-4 border-l-accent">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total Users</p>
                    <p className="text-4xl font-bold text-accent">{dashboardData?.totalUsers ?? '—'}</p>
                    <p className="text-text-secondary text-xs mt-1">Firebase Auth accounts</p>
                </div>
                <div className="glass-panel p-5 border-l-4 border-l-danger">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total Threats</p>
                    <p className="text-4xl font-bold text-danger">{dashboardData?.totalThreats ?? 0}</p>
                    <p className="text-text-secondary text-xs mt-1">All-time detections</p>
                </div>
                <div className="glass-panel p-5 border-l-4 border-l-success">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Files Cleaned</p>
                    <p className="text-4xl font-bold text-success">{dashboardData?.usageStats?.filesCleaned ?? 0}</p>
                    <p className="text-text-secondary text-xs mt-1">Today (metadata washes)</p>
                </div>
                <div className="glass-panel p-5 border-l-4 border-l-warning">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">PDF Conversions</p>
                    <p className="text-4xl font-bold text-warning">{dashboardData?.usageStats?.pdfsConverted ?? 0}</p>
                    <p className="text-text-secondary text-xs mt-1">Today</p>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* System Metrics */}
                <div className="glass-panel p-6 border-l-4 border-l-success">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="server" className="w-5 h-5 text-text-secondary" />
                        <h3 className="text-base font-semibold">System Status</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'ClamAV Scanner', key: 'clamav' },
                            { label: 'Database (MongoDB)', key: 'database' },
                            { label: 'API Gateway', key: 'apiGateway' },
                        ].map(({ label, key }) => {
                            const s = dashboardData?.systemMetrics?.[key] || 'operational';
                            return (
                                <div key={key} className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary">{label}</span>
                                    <span className={`flex items-center gap-1.5 font-medium capitalize ${statusColor(s)}`}>
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${s === 'operational' ? 'bg-success' : s === 'degraded' ? 'bg-warning' : 'bg-danger'}`} />
                                        {s}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 7-Day Threat Trend Chart */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Icon name="trendingUp" className="w-5 h-5 text-text-secondary" />
                            <h3 className="text-base font-semibold">Threat Trend</h3>
                        </div>
                        <span className="text-text-secondary text-xs">7-day</span>
                    </div>
                    {last7Days.every(v => v === 0) ? (
                        <div className="py-6 text-center text-text-secondary opacity-60">
                            <Icon name="shieldCheck" className="w-8 h-8 mx-auto mb-1 text-success" />
                            <p className="text-xs">No threats in the last 7 days</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <MiniBarChart data={last7Days} color="bg-danger/60" />
                            <div className="flex gap-1">
                                {last7Labels.map((l, i) => (
                                    <span key={i} className="flex-1 text-center text-[9px] text-text-secondary">{l}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-glass-border flex justify-between text-xs text-text-secondary">
                        <span>Last 7 days: <strong className="text-danger">{last7Days.reduce((a, b) => a + b, 0)}</strong> detections</span>
                    </div>
                </div>

                {/* Recent Threats */}
                <div className="glass-panel p-6 border-l-4 border-l-danger md:col-span-2 lg:col-span-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="shieldAlert" className="w-5 h-5 text-danger" />
                        <h3 className="text-base font-semibold">Recent Threats</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                        {dashboardData?.threats?.length > 0 ? (
                            dashboardData.threats.map(threat => (
                                <div key={threat._id} className="p-2.5 bg-danger/5 border border-danger/20 rounded-lg text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-danger capitalize text-xs">{threat.type} Detected</span>
                                        <span className="text-[10px] text-text-secondary">
                                            {new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-text-primary font-mono text-[11px] truncate">{threat.target}</p>
                                    {threat.details?.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {threat.details.slice(0, 2).map((d, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-danger/10 text-danger rounded text-[9px]">{d}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-text-secondary opacity-50">
                                <Icon name="shieldCheck" className="w-10 h-10 mb-2 text-success" />
                                <p className="text-sm">No recent threats.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
