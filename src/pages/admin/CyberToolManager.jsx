import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const COLORS = ['cyan', 'purple', 'blue', 'green', 'orange', 'pink', 'emerald', 'red', 'yellow', 'indigo'];
const ICONS = ['tool', 'shield', 'search', 'wifi', 'lock', 'code', 'fileText', 'image', 'share2', 'database', 'book', 'scan', 'terminal', 'skull', 'activity', 'bot', 'globe', 'server', 'monitor', 'hash', 'penTool', 'camera', 'eye', 'droplet', 'unlock'];
const CATEGORIES = ['utility', 'scanner', 'osint', 'privacy', 'converter', 'ai', 'crypto'];

const COLOR_MAP = {
    cyan: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-400/30 text-purple-400',
    blue: 'bg-blue-500/10 border-blue-400/30 text-blue-400',
    green: 'bg-green-500/10 border-green-400/30 text-green-400',
    orange: 'bg-orange-500/10 border-orange-400/30 text-orange-400',
    pink: 'bg-pink-500/10 border-pink-400/30 text-pink-400',
    emerald: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400',
    red: 'bg-red-500/10 border-red-400/30 text-red-400',
    yellow: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-400',
    indigo: 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400',
};

const EMPTY_FORM = { name: '', description: '', icon: 'tool', emoji: '', color: 'cyan', route: '', isExternal: false, category: 'utility', badge: '', order: '' };

// ─── Tool Card Preview ────────────────────────────────────────────────────────
function ToolPreview({ form }) {
    const cls = COLOR_MAP[form.color] || COLOR_MAP.cyan;
    return (
        <div className="glass-panel p-5 rounded-xl border border-glass-border relative overflow-hidden">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-3 opacity-60">Live Preview</p>
            <div className={`w-12 h-12 rounded-xl ${cls} flex items-center justify-center mb-3 border text-2xl`}>
                {form.emoji ? form.emoji : <Icon name={form.icon || 'tool'} className="w-6 h-6" />}
            </div>
            <h3 className="font-semibold text-text-primary">{form.name || 'Tool Name'}</h3>
            <p className="text-text-secondary text-xs mt-1 line-clamp-3">{form.description || 'Short description of what this tool does...'}</p>
            {form.badge && (
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>{form.badge}</span>
            )}
        </div>
    );
}

// ─── Tool Form (Add / Edit) ───────────────────────────────────────────────────
function ToolForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Fields */}
            <div className="lg:col-span-2 glass-panel p-6 border-l-4 border-l-accent space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="text-xs text-text-secondary mb-1 block">Tool Name *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Password Analyzer" className="input-field w-full" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-text-secondary mb-1 block">Description *</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Short description shown on the card..." className="input-field w-full resize-none text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Route / URL *</label>
                        <input value={form.route} onChange={e => set('route', e.target.value)} placeholder="/tools/my-tool  or  https://..." className="input-field w-full text-sm font-mono" />
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Badge Text</label>
                        <input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. NEW, AI, PRO..." className="input-field w-full text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Colour</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => set('color', c)}
                                    className={`w-7 h-7 rounded-full border-2 capitalize text-xs font-bold transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                                    style={{ background: `var(--tw-${c}-400, ${c})` }}
                                    title={c}>
                                    <span className={`block w-full h-full rounded-full bg-${c}-500`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Category</label>
                        <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field w-full text-sm capitalize">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Icon (from Icon.jsx)</label>
                        <select value={form.icon} onChange={e => { set('icon', e.target.value); set('emoji', ''); }} className="input-field w-full text-sm">
                            {ICONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">— OR — Emoji Icon</label>
                        <input value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🔍  (overrides icon above)" className="input-field w-full text-center text-xl" maxLength={2} />
                    </div>
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Display Order</label>
                        <input type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="1, 2, 3..." className="input-field w-full text-sm" min="1" />
                    </div>
                    <div className="flex items-center gap-2 self-end pb-2">
                        <input type="checkbox" id="isExt" checked={form.isExternal} onChange={e => set('isExternal', e.target.checked)} className="rounded" />
                        <label htmlFor="isExt" className="text-text-secondary text-sm cursor-pointer">Open in new tab (external URL)</label>
                    </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-glass-border">
                    <button onClick={() => onSave(form)} disabled={saving} className="btn-primary text-sm">
                        {saving ? 'Saving...' : initial ? '✓ Save Changes' : '+ Add Tool'}
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-glass-border text-text-secondary text-sm hover:text-text-primary transition-colors">
                        Cancel
                    </button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col gap-3">
                <ToolPreview form={form} />
                <div className="glass-panel p-3 text-xs text-text-secondary space-y-1">
                    <p>💡 <strong>Colour circles</strong> — click a dot to change the card colour</p>
                    <p>💡 <strong>Emoji</strong> overrides the icon if filled</p>
                    <p>💡 <strong>Order</strong> determines position on the public page</p>
                    <p>💡 Built-in tools can be <em>hidden</em> but not deleted</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main CyberToolManager ────────────────────────────────────────────────────
export default function CyberToolManager() {
    const { currentAdmin } = useAdminAuth();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
    const [editTarget, setEditTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const getToken = useCallback(async () => currentAdmin?.getIdToken(), [currentAdmin]);

    const fetchTools = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/cyber-tools`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setTools(data.tools || []);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    }, [getToken]);

    useEffect(() => { fetchTools(); }, [fetchTools]);

    const saveNew = async (form) => {
        if (!form.name || !form.description || !form.route) return alert('Name, description and route are required');
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/cyber-tools`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            const data = await res.json();
            setTools(prev => [...prev, data.tool].sort((a, b) => a.order - b.order));
            setMode('list');
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const saveEdit = async (form) => {
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/cyber-tools/${editTarget._id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            const data = await res.json();
            setTools(prev => prev.map(t => t._id === editTarget._id ? data.tool : t));
            setMode('list'); setEditTarget(null);
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const toggleActive = async (tool) => {
        setTogglingId(tool._id);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/cyber-tools/${tool._id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !tool.isActive })
            });
            const data = await res.json();
            setTools(prev => prev.map(t => t._id === tool._id ? data.tool : t));
        } catch (e) { alert('Error: ' + e.message); } finally { setTogglingId(null); }
    };

    const deleteTool = async (tool) => {
        if (tool.isBuiltIn) return alert('Built-in tools cannot be deleted. Use the toggle to hide them from users.');
        if (!window.confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
        setDeletingId(tool._id);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/cyber-tools/${tool._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setTools(prev => prev.filter(t => t._id !== tool._id));
        } catch (e) { alert('Error: ' + e.message); } finally { setDeletingId(null); }
    };

    const openEdit = (tool) => {
        setEditTarget(tool);
        setMode('edit');
    };

    const filtered = tools.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(search.toLowerCase()));

    const activeCount = tools.filter(t => t.isActive).length;
    const customCount = tools.filter(t => !t.isBuiltIn).length;

    // ─── Edit / Add view ─────────────────────────────────────────────────────
    if (mode === 'edit' && editTarget) {
        return (
            <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3">
                    <button onClick={() => { setMode('list'); setEditTarget(null); }} className="text-text-secondary hover:text-text-primary text-sm">← Back</button>
                    <h2 className="text-lg font-semibold">Edit: {editTarget.name}</h2>
                    {editTarget.isBuiltIn && <span className="px-2 py-0.5 rounded-full text-xs bg-accent/10 border border-accent/30 text-accent">Built-in</span>}
                </div>
                <ToolForm
                    initial={{ name: editTarget.name, description: editTarget.description, icon: editTarget.icon, emoji: editTarget.emoji || '', color: editTarget.color, route: editTarget.route, isExternal: editTarget.isExternal, category: editTarget.category, badge: editTarget.badge || '', order: editTarget.order }}
                    onSave={saveEdit} onCancel={() => { setMode('list'); setEditTarget(null); }} saving={saving}
                />
            </div>
        );
    }
    if (mode === 'add') {
        return (
            <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMode('list')} className="text-text-secondary hover:text-text-primary text-sm">← Back</button>
                    <h2 className="text-lg font-semibold">Add New Cyber Tool</h2>
                </div>
                <ToolForm initial={null} onSave={saveNew} onCancel={() => setMode('list')} saving={saving} />
            </div>
        );
    }

    // ─── List view ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Icon name="tool" className="w-8 h-8 text-accent" />
                    <div>
                        <h1 className="text-2xl font-bold">Cyber Tool Manager</h1>
                        <p className="text-text-secondary text-sm">Add, edit, hide, and reorder tools shown on the Cyber Tools page</p>
                    </div>
                </div>
                <button onClick={() => setMode('add')} className="btn-primary text-sm flex items-center gap-2 shrink-0">
                    <Icon name="plus" className="w-4 h-4" /> Add Tool
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-accent">{tools.length}</p><p className="text-text-secondary text-xs mt-1">Total Tools</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-success">{activeCount}</p><p className="text-text-secondary text-xs mt-1">Active (Public)</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-warning">{customCount}</p><p className="text-text-secondary text-xs mt-1">Custom Tools</p></div>
            </div>

            {/* Search */}
            <div className="glass-panel p-3 flex items-center gap-3">
                <Icon name="search" className="w-4 h-4 text-text-secondary shrink-0" />
                <input type="text" placeholder="Search tools by name or category..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none" />
                {search && <button onClick={() => setSearch('')} className="text-text-secondary hover:text-text-primary"><Icon name="x" className="w-4 h-4" /></button>}
            </div>

            {/* Info */}
            <div className="glass-panel p-3 border-l-4 border-l-warning">
                <p className="text-warning text-xs font-medium">⚠️ <strong>Built-in tools</strong> (🔒 badge) cannot be deleted — toggle them off to hide from users. Changes take effect immediately for all visitors.</p>
            </div>

            {error && <div className="glass-panel p-4 text-danger text-sm">{error}</div>}

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-glass-border text-text-secondary text-xs">
                                <th className="text-left px-4 py-3 font-medium w-8">#</th>
                                <th className="text-left px-4 py-3 font-medium">Tool</th>
                                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Route</th>
                                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Category</th>
                                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Uses</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(tool => {
                                const cls = COLOR_MAP[tool.color] || COLOR_MAP.cyan;
                                return (
                                    <tr key={tool._id} className={`border-b border-glass-border/40 hover:bg-white/2 ${!tool.isActive ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-3 text-text-secondary text-xs">{tool.order}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border shrink-0 ${cls}`}>
                                                    {tool.emoji ? tool.emoji : <Icon name={tool.icon || 'tool'} className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-text-primary">{tool.name}</span>
                                                        {tool.isBuiltIn && <span className="text-[9px] bg-white/10 border border-glass-border text-text-secondary px-1.5 py-0.5 rounded-full">🔒 Built-in</span>}
                                                        {tool.badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${cls}`}>{tool.badge}</span>}
                                                    </div>
                                                    <p className="text-text-secondary text-xs truncate max-w-[200px]">{tool.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary font-mono text-xs hidden md:table-cell truncate max-w-[160px]">
                                            {tool.route}
                                            {tool.isExternal && <span className="ml-1 text-[10px] opacity-60">↗</span>}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="px-2 py-0.5 rounded-full text-xs border border-glass-border text-text-secondary capitalize">{tool.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs hidden lg:table-cell font-mono">{tool.usageCount || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tool.isActive ? 'text-success bg-success/10 border-success/30' : 'text-text-secondary bg-white/5 border-glass-border'}`}>
                                                {tool.isActive ? 'Live' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 items-center">
                                                <button onClick={() => openEdit(tool)} className="icon-btn" title="Edit"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => toggleActive(tool)} disabled={togglingId === tool._id} title={tool.isActive ? 'Hide from users' : 'Show to users'}
                                                    className={`icon-btn ${tool.isActive ? 'text-warning' : 'text-success'}`}>
                                                    <Icon name={tool.isActive ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteTool(tool)} disabled={deletingId === tool._id || tool.isBuiltIn}
                                                    title={tool.isBuiltIn ? 'Built-in tools cannot be deleted' : 'Delete'}
                                                    className={`icon-btn ${!tool.isBuiltIn ? 'text-danger' : 'opacity-20 cursor-not-allowed'}`}>
                                                    <Icon name="trash2" className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-10 text-center text-text-secondary opacity-60">
                            <Icon name="tool" className="w-10 h-10 mx-auto mb-2" />
                            <p>No tools found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
