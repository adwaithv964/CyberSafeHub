import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const DIFFICULTY_COLORS = {
    beginner: 'text-success bg-success/10 border-success/30',
    intermediate: 'text-warning bg-warning/10 border-warning/30',
    advanced: 'text-danger bg-danger/10 border-danger/30',
};

const CATEGORIES = ['Fundamentals', 'Phishing', 'Cryptography', 'OSINT', 'Incident Response', 'Privacy', 'Malware', 'Network'];

// ─── Module Form ──────────────────────────────────────────────────────────────
function ModuleForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || {
        title: '', description: '', icon: '📚',
        category: 'Fundamentals', difficulty: 'beginner',
        route: '', published: true, order: ''
    });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="glass-panel p-5 border-l-4 border-l-accent space-y-3 animate-fade-in">
            <h3 className="font-semibold text-text-primary">{initial ? 'Edit Module' : 'New Module'}</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="text-xs text-text-secondary mb-1 block">Title *</label>
                    <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Module title..." className="input-field w-full" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs text-text-secondary mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="input-field w-full resize-none text-sm" />
                </div>
                <div>
                    <label className="text-xs text-text-secondary mb-1 block">Icon (emoji)</label>
                    <input value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={2} className="input-field w-full text-center text-2xl" />
                </div>
                <div>
                    <label className="text-xs text-text-secondary mb-1 block">Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field w-full text-sm">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-text-secondary mb-1 block">Difficulty</label>
                    <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className="input-field w-full text-sm">
                        <option value="beginner">🟢 Beginner</option>
                        <option value="intermediate">🟡 Intermediate</option>
                        <option value="advanced">🔴 Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-text-secondary mb-1 block">Route ID</label>
                    <input value={form.route} onChange={e => set('route', e.target.value)} placeholder="e.g. phishing, cracker..." className="input-field w-full text-sm font-mono" />
                    <p className="text-[10px] text-text-secondary mt-0.5">Must match an interactive component route</p>
                </div>
                <div>
                    <label className="text-xs text-text-secondary mb-1 block">Order</label>
                    <input type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="1, 2, 3..." className="input-field w-full text-sm" min="1" />
                </div>
                <div className="flex items-center gap-2 self-end pb-2">
                    <input type="checkbox" id="pub" checked={form.published} onChange={e => set('published', e.target.checked)} className="rounded" />
                    <label htmlFor="pub" className="text-text-secondary text-sm cursor-pointer">Publish (visible to users)</label>
                </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-glass-border">
                <button onClick={() => onSave(form)} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : '✓ Save Module'}</button>
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-glass-border text-text-secondary text-sm hover:text-text-primary">Cancel</button>
            </div>
        </div>
    );
}

// ─── Modules Tab ──────────────────────────────────────────────────────────────
function ModulesTab({ getToken }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');

    const fetchModules = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/academy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed: ' + res.status);
            const data = await res.json();
            setModules(data.modules || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchModules(); }, [fetchModules]);

    const save = async (form) => {
        if (!form.title.trim()) return alert('Title is required');
        setSaving(true);
        try {
            const token = await getToken();
            const isNew = editing === 'new';
            const url = isNew
                ? `${API_BASE_URL}/api/admin/academy`
                : `${API_BASE_URL}/api/admin/academy/${editing._id}`;
            const res = await fetch(url, {
                method: isNew ? 'POST' : 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    order: form.order ? Number(form.order) : 99
                })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            const data = await res.json();
            if (isNew) {
                setModules(prev => [...prev, data.module].sort((a, b) => a.order - b.order));
            } else {
                setModules(prev => prev.map(m => m._id === editing._id ? data.module : m));
            }
            setEditing(null);
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const togglePublished = async (mod) => {
        setTogglingId(mod._id);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/academy/${mod._id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !mod.published })
            });
            const data = await res.json();
            setModules(prev => prev.map(m => m._id === mod._id ? data.module : m));
        } catch (e) { alert('Error: ' + e.message); } finally { setTogglingId(null); }
    };

    const deleteModule = async (mod) => {
        if (mod.isBuiltIn) return alert('Built-in modules cannot be deleted. Unpublish to hide them.');
        if (!window.confirm(`Delete "${mod.title}"? Cannot be undone.`)) return;
        setDeletingId(mod._id);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/academy/${mod._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setModules(prev => prev.filter(m => m._id !== mod._id));
        } catch (e) { alert('Error: ' + e.message); } finally { setDeletingId(null); }
    };

    const filtered = modules.filter(m =>
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (editing) {
        const isNew = editing === 'new';
        return (
            <div className="space-y-4">
                <button onClick={() => setEditing(null)} className="text-text-secondary hover:text-text-primary text-sm">← Back to list</button>
                <ModuleForm
                    initial={isNew ? null : {
                        title: editing.title || '', description: editing.description || '',
                        icon: editing.icon || '📚', category: editing.category || 'Fundamentals',
                        difficulty: editing.difficulty || 'beginner', route: editing.route || '',
                        published: editing.published !== false, order: editing.order || ''
                    }}
                    onSave={save} onCancel={() => setEditing(null)} saving={saving}
                />
            </div>
        );
    }

    const total = modules.length;
    const published = modules.filter(m => m.published).length;
    const draft = modules.filter(m => !m.published).length;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-accent">{total}</p><p className="text-text-secondary text-xs mt-1">Total Modules</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-success">{published}</p><p className="text-text-secondary text-xs mt-1">Published</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-warning">{draft}</p><p className="text-text-secondary text-xs mt-1">Draft</p></div>
            </div>

            <div className="flex gap-3">
                <div className="flex-1 glass-panel flex items-center gap-2 px-3 py-2">
                    <Icon name="search" className="w-4 h-4 text-text-secondary shrink-0" />
                    <input type="text" placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-secondary" />
                </div>
                <button onClick={() => setEditing('new')} className="btn-primary text-sm flex items-center gap-2 shrink-0">
                    <Icon name="plus" className="w-4 h-4" /> New Module
                </button>
            </div>

            <div className="glass-panel p-3 border-l-4 border-l-accent text-xs text-text-secondary">
                ℹ️ <strong>Built-in modules</strong> (🔒) are auto-seeded from the 5 interactive components. They cannot be deleted — only unpublished to hide from users.
            </div>

            {error && <div className="glass-panel p-4 text-danger text-sm">⚠ {error}</div>}

            {loading ? (
                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-glass-border text-text-secondary text-xs">
                                <th className="text-left px-4 py-3 font-medium w-6">#</th>
                                <th className="text-left px-4 py-3 font-medium">Module</th>
                                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Difficulty</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m._id} className={`border-b border-glass-border/40 hover:bg-white/2 ${!m.published ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3 text-text-secondary text-xs">{m.order}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{m.icon || '📚'}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-text-primary">{m.title}</span>
                                                    {m.isBuiltIn && <span className="text-[9px] bg-white/10 border border-glass-border text-text-secondary px-1.5 py-0.5 rounded-full">🔒 Built-in</span>}
                                                </div>
                                                <p className="text-text-secondary text-xs truncate max-w-[220px]">{m.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="px-2 py-0.5 rounded-full text-xs border border-glass-border text-text-secondary">{m.category}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${DIFFICULTY_COLORS[m.difficulty] || ''}`}>{m.difficulty}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${m.published ? 'text-success bg-success/10 border-success/30' : 'text-text-secondary bg-white/5 border-glass-border'}`}>
                                            {m.published ? 'Live' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => setEditing(m)} className="icon-btn" title="Edit"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => togglePublished(m)} disabled={togglingId === m._id}
                                                className={`icon-btn ${m.published ? 'text-warning' : 'text-success'}`} title={m.published ? 'Unpublish' : 'Publish'}>
                                                <Icon name={m.published ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => deleteModule(m)} disabled={deletingId === m._id || m.isBuiltIn}
                                                className={`icon-btn ${!m.isBuiltIn ? 'text-danger' : 'opacity-20 cursor-not-allowed'}`} title={m.isBuiltIn ? 'Built-in — cannot delete' : 'Delete'}>
                                                <Icon name="trash2" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-10 text-center text-text-secondary opacity-60">
                            <Icon name="book" className="w-10 h-10 mx-auto mb-2" />
                            <p>{modules.length === 0 ? 'Loading modules from server...' : 'No modules match your search.'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Phishing Campaigns Tab ───────────────────────────────────────────────────
function CampaignsTab() {
    return (
        <div className="glass-panel p-10 text-center text-text-secondary opacity-60">
            <Icon name="mail" className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold">Phishing Campaigns</p>
            <p className="text-xs mt-1">Campaign management coming soon — configure simulated phishing emails for users.</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'modules', label: 'Course Modules', icon: 'graduationCap' },
    { id: 'campaigns', label: 'Phishing Campaigns', icon: 'mail' },
];

export default function AcademyLMS() {
    const { currentAdmin } = useAdminAuth();
    const [tab, setTab] = useState('modules');
    const getToken = useCallback(async () => currentAdmin?.getIdToken(), [currentAdmin]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <Icon name="academicCap" className="w-8 h-8 text-accent" />
                <div>
                    <h1 className="text-2xl font-bold">Cyber Academy LMS</h1>
                    <p className="text-text-secondary text-sm">Course modules · Phishing campaigns · Stored in MongoDB</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-glass-border pb-px">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${tab === t.id ? 'bg-accent/10 border border-b-transparent border-glass-border text-accent -mb-px' : 'text-text-secondary hover:text-text-primary'}`}>
                        <Icon name={t.icon} className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'modules' ? <ModulesTab getToken={getToken} /> : <CampaignsTab />}
        </div>
    );
}
