import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

// Default prompts for tools if Firestore has no data yet
const DEFAULT_PROMPTS = {
    'cyber-assistant': { tool: 'cyber-assistant', description: 'Main AI cybersecurity assistant', systemPrompt: 'You are CyberSafe AI, an expert cybersecurity assistant embedded in CyberSafeHub. You help users understand threats, improve their security posture, and explain security concepts clearly. Never recommend illegal activities. Always prioritize privacy and security best practices.' },
    'code-auditor': { tool: 'code-auditor', description: 'Code Security Auditor', systemPrompt: 'You are a code security auditor. Analyze code for vulnerabilities such as SQL injection, XSS, CSRF, insecure dependencies, and bad cryptographic practices. Provide clear, actionable remediation advice. Do not execute code.' },
    'policy-decoder': { tool: 'policy-decoder', description: 'Privacy Policy Decoder', systemPrompt: 'You analyze privacy policies and terms of service documents. Summarize key data collection practices, third-party sharing, user rights, and any concerning clauses in plain English. Be concise and objective.' },
};

export default function AIGovernance() {
    const { currentAdmin } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingPrompts, setLoadingPrompts] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null); // { tool, systemPrompt, description }
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const getToken = useCallback(async () => {
        if (!currentAdmin) return null;
        return currentAdmin.getIdToken();
    }, [currentAdmin]);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/ai/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            setStats(await res.json());
        } catch (e) { setError(e.message); } finally { setLoadingStats(false); }
    }, [getToken]);

    const fetchPrompts = useCallback(async () => {
        setLoadingPrompts(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/ai/prompts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            // Merge defaults with Firestore data
            const merged = Object.values(DEFAULT_PROMPTS).map(def => {
                const found = (data.prompts || []).find(p => p.id === def.tool || p.tool === def.tool);
                return found ? { ...def, ...found, id: def.tool } : { ...def, id: def.tool };
            });
            setPrompts(merged);
        } catch (e) { console.error(e); setPrompts(Object.values(DEFAULT_PROMPTS)); }
        finally { setLoadingPrompts(false); }
    }, [getToken]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (activeTab === 'prompts') fetchPrompts();
    }, [activeTab, fetchPrompts]);

    const savePrompt = async () => {
        if (!editingPrompt?.systemPrompt.trim()) return;
        setSaving(true);
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/api/admin/ai/prompts/${editingPrompt.tool}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemPrompt: editingPrompt.systemPrompt, description: editingPrompt.description })
            });
            setPrompts(prev => prev.map(p => p.tool === editingPrompt.tool ? { ...p, ...editingPrompt } : p));
            setEditingPrompt(null);
            alert('Prompt saved! Restart the AI service to apply changes.');
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const StatCard = ({ label, value, sub, icon, color }) => (
        <div className="glass-panel p-5 flex flex-col gap-2">
            <div className={`flex items-center gap-2 ${color}`}>
                <Icon name={icon} className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
            </div>
            <p className={`text-4xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-text-secondary text-xs">{sub}</p>}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Icon name="bot" className="w-8 h-8 text-accent" />
                    <div>
                        <h1 className="text-2xl font-bold">AI & Assistant Governance</h1>
                        <p className="text-text-secondary text-sm">Usage analytics · System prompt management</p>
                    </div>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
                    <Icon name="refreshCw" className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 border-b border-glass-border pb-2">
                {[{ id: 'stats', label: 'Usage Analytics', icon: 'trendingUp' }, { id: 'prompts', label: 'Prompt Manager', icon: 'edit' }].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        <Icon name={t.icon} className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="space-y-6">
                    {loadingStats ? <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
                        : error ? <div className="glass-panel p-6 text-danger">{error}</div>
                            : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <StatCard label="Total Queries" value={stats?.totalQueries ?? 0} sub="All-time" icon="messageSquare" color="text-accent" />
                                        <StatCard label="Today" value={stats?.queriesToday ?? 0} sub={new Date().toLocaleDateString()} icon="calendar" color="text-success" />
                                        <StatCard label="This Week" value={stats?.queriesThisWeek ?? 0} sub="Last 7 days" icon="trendingUp" color="text-warning" />
                                    </div>
                                    <div className="glass-panel p-6">
                                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                            <Icon name="list" className="w-4 h-4 text-accent" /> Top Prompts
                                        </h3>
                                        {stats?.topPrompts?.length > 0 ? stats.topPrompts.map((p, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-lg border border-glass-border/40 mb-2">
                                                <span className="text-accent font-bold text-sm w-5 text-center">#{i + 1}</span>
                                                <span className="text-text-primary text-sm flex-1">{p.prompt || p}</span>
                                                {p.count && <span className="text-text-secondary text-xs">{p.count}×</span>}
                                            </div>
                                        )) : (
                                            <p className="text-text-secondary text-sm py-6 text-center opacity-60">No query data yet. Populate when users interact with the AI.</p>
                                        )}
                                    </div>
                                </>
                            )}
                </div>
            )}

            {/* Prompt Manager Tab */}
            {activeTab === 'prompts' && (
                <div className="space-y-4">
                    <div className="glass-panel p-4 border-l-4 border-l-warning">
                        <p className="text-warning text-xs font-semibold">⚠️ Changes are saved to Firestore. Restart the AI service or redeploy for prompts to take effect in production.</p>
                    </div>

                    {editingPrompt ? (
                        <div className="glass-panel p-6 space-y-4 border-l-4 border-l-accent">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold">Editing: <span className="text-accent font-mono">{editingPrompt.tool}</span></h3>
                                <button onClick={() => setEditingPrompt(null)} className="text-text-secondary hover:text-text-primary text-sm">← Cancel</button>
                            </div>
                            <input
                                value={editingPrompt.description}
                                onChange={e => setEditingPrompt(p => ({ ...p, description: e.target.value }))}
                                placeholder="Short description of this tool..."
                                className="input-field w-full text-sm"
                            />
                            <textarea
                                value={editingPrompt.systemPrompt}
                                onChange={e => setEditingPrompt(p => ({ ...p, systemPrompt: e.target.value }))}
                                rows={12}
                                className="input-field w-full text-sm font-mono resize-none"
                                placeholder="System prompt instructions for the AI..."
                            />
                            <div className="flex gap-3">
                                <button onClick={savePrompt} disabled={saving} className="btn-primary text-sm">
                                    {saving ? 'Saving to Firestore...' : '✓ Save Prompt'}
                                </button>
                                <button onClick={() => setEditingPrompt(null)} className="px-4 py-2 rounded-lg border border-glass-border text-text-secondary text-sm hover:text-text-primary transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        loadingPrompts ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                            : prompts.map(p => (
                                <div key={p.tool} className="glass-panel p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                        <Icon name="bot" className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold font-mono text-sm text-text-primary">{p.tool}</span>
                                            {p.updatedBy && <span className="text-[10px] text-text-secondary border border-glass-border px-1.5 py-0.5 rounded-full">Updated by {p.updatedBy}</span>}
                                        </div>
                                        <p className="text-text-secondary text-xs mt-0.5">{p.description}</p>
                                        <p className="text-text-secondary text-xs mt-2 line-clamp-2 font-mono bg-white/3 p-2 rounded border border-glass-border/40">{p.systemPrompt}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditingPrompt({ tool: p.tool, systemPrompt: p.systemPrompt, description: p.description || '' })}
                                        className="shrink-0 px-3 py-1.5 rounded-lg border border-accent/30 text-accent text-xs hover:bg-accent/10 transition-colors flex items-center gap-1.5"
                                    >
                                        <Icon name="edit" className="w-3.5 h-3.5" /> Edit
                                    </button>
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    );
}
