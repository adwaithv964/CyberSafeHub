import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const DIFFICULTY_COLORS = {
    beginner: 'text-success bg-success/10 border-success/30',
    intermediate: 'text-warning bg-warning/10 border-warning/30',
    advanced: 'text-danger bg-danger/10 border-danger/30',
};

const TABS = [
    { id: 'modules', label: 'Course Modules', icon: 'graduationCap' },
    { id: 'campaigns', label: 'Phishing Campaigns', icon: 'mail' },
];

// ─── Course Modules Tab ───────────────────────────────────────────────────────
function ModulesTab() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null); // null | 'new' | module object
    const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'beginner', icon: '📚', published: false });
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');

    const fetchModules = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const snap = await getDocs(collection(db, 'academy_modules'));
            setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            setError('Failed to load modules: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchModules(); }, [fetchModules]);

    const openNew = () => {
        setForm({ title: '', description: '', category: '', difficulty: 'beginner', icon: '📚', published: false });
        setEditing('new');
    };
    const openEdit = (m) => {
        setForm({ title: m.title || '', description: m.description || '', category: m.category || '', difficulty: m.difficulty || 'beginner', icon: m.icon || '📚', published: m.published !== false });
        setEditing(m);
    };

    const save = async () => {
        if (!form.title.trim()) return alert('Title is required');
        setSaving(true);
        try {
            if (editing === 'new') {
                const ref = await addDoc(collection(db, 'academy_modules'), { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                setModules(prev => [{ id: ref.id, ...form }, ...prev]);
            } else {
                await updateDoc(doc(db, 'academy_modules', editing.id), { ...form, updatedAt: serverTimestamp() });
                setModules(prev => prev.map(m => m.id === editing.id ? { ...m, ...form } : m));
            }
            setEditing(null);
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const togglePublished = async (m) => {
        setTogglingId(m.id);
        try {
            await updateDoc(doc(db, 'academy_modules', m.id), { published: m.published === false });
            setModules(prev => prev.map(mod => mod.id === m.id ? { ...mod, published: mod.published === false } : mod));
        } catch (e) { alert('Error: ' + e.message); } finally { setTogglingId(null); }
    };

    const deleteModule = async (id) => {
        if (!window.confirm('Delete this module? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, 'academy_modules', id));
            setModules(prev => prev.filter(m => m.id !== id));
        } catch (e) { alert('Error: ' + e.message); } finally { setDeletingId(null); }
    };

    const filtered = modules.filter(m =>
        (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.category || '').toLowerCase().includes(search.toLowerCase())
    );

    if (editing !== null) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{editing === 'new' ? 'New Course Module' : `Editing: ${editing.title}`}</h3>
                    <button onClick={() => setEditing(null)} className="text-text-secondary hover:text-text-primary text-sm">← Back to list</button>
                </div>
                <div className="glass-panel p-6 space-y-4">
                    <div className="grid grid-cols-6 gap-3">
                        <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon (emoji)" className="input-field col-span-1 text-center text-2xl" />
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Module title..." className="input-field col-span-5 font-semibold" />
                    </div>
                    <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (e.g. Fundamentals, Cryptography, OSINT)..." className="input-field w-full text-sm" />
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Short description of this module..." className="input-field w-full text-sm resize-none" />
                    <div className="flex gap-3 items-center flex-wrap">
                        <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input-field text-sm">
                            <option value="beginner">🟢 Beginner</option>
                            <option value="intermediate">🟡 Intermediate</option>
                            <option value="advanced">🔴 Advanced</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="rounded" />
                            Publish immediately
                        </label>
                        <button onClick={save} disabled={saving} className="btn-primary text-sm ml-auto">
                            {saving ? 'Saving...' : editing === 'new' ? 'Create Module' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-accent">{modules.length}</p><p className="text-text-secondary text-xs mt-1">Total Modules</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-success">{modules.filter(m => m.published !== false).length}</p><p className="text-text-secondary text-xs mt-1">Published</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-warning">{modules.filter(m => m.published === false).length}</p><p className="text-text-secondary text-xs mt-1">Draft</p></div>
            </div>

            <div className="flex gap-3">
                <div className="glass-panel p-3 flex items-center gap-3 flex-1">
                    <Icon name="search" className="w-4 h-4 text-text-secondary" />
                    <input type="text" placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none" />
                </div>
                <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2 shrink-0"><Icon name="plus" className="w-4 h-4" /> New Module</button>
            </div>

            {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                : error ? <div className="glass-panel p-6 text-danger border-l-4 border-l-danger text-sm">{error}</div>
                    : filtered.length === 0 ? (
                        <div className="glass-panel p-10 text-center text-text-secondary opacity-60">
                            <Icon name="bookOpen" className="w-10 h-10 mx-auto mb-2" />
                            <p>No modules found. Create your first course module.</p>
                        </div>
                    ) : (
                        <div className="glass-panel overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-glass-border text-text-secondary text-xs">
                                    <th className="text-left px-4 py-3 font-medium">Module</th>
                                    <th className="text-left px-4 py-3 font-medium">Category</th>
                                    <th className="text-left px-4 py-3 font-medium">Level</th>
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {filtered.map(m => (
                                        <tr key={m.id} className={`border-b border-glass-border/40 hover:bg-white/2 ${m.published === false ? 'opacity-60' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{m.icon || '📚'}</span>
                                                    <div><p className="font-semibold text-text-primary">{m.title}</p><p className="text-text-secondary text-xs truncate max-w-[180px]">{m.description}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">{m.category || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${DIFFICULTY_COLORS[m.difficulty] || 'text-text-secondary border-glass-border'}`}>
                                                    {m.difficulty || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${m.published !== false ? 'text-success bg-success/10 border-success/30' : 'text-text-secondary bg-white/5 border-glass-border'}`}>
                                                    {m.published !== false ? 'Live' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEdit(m)} className="icon-btn" title="Edit"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => togglePublished(m)} disabled={togglingId === m.id} title={m.published !== false ? 'Unpublish' : 'Publish'}
                                                        className={`icon-btn ${m.published !== false ? 'text-warning' : 'text-success'}`}>
                                                        <Icon name={m.published !== false ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => deleteModule(m.id)} disabled={deletingId === m.id} className="icon-btn text-danger" title="Delete">
                                                        <Icon name="trash2" className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
        </div>
    );
}

// ─── Phishing Campaigns Tab ───────────────────────────────────────────────────
function CampaignsTab() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', subject: '', previewText: '', bodyHtml: '', targetGroup: 'all', scheduledAt: '' });

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'phishing_campaigns'));
            setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const create = async (e) => {
        e.preventDefault();
        if (!form.name || !form.subject) return alert('Name and subject are required');
        try {
            const ref = await addDoc(collection(db, 'phishing_campaigns'), {
                ...form,
                status: 'scheduled',
                opens: 0, clicks: 0,
                createdAt: serverTimestamp(),
            });
            setCampaigns(prev => [{ id: ref.id, ...form, status: 'scheduled', opens: 0, clicks: 0 }, ...prev]);
            setCreating(false);
            setForm({ name: '', subject: '', previewText: '', bodyHtml: '', targetGroup: 'all', scheduledAt: '' });
        } catch (e) { alert('Error: ' + e.message); }
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <p className="text-text-secondary text-sm">{campaigns.length} phishing simulation campaigns</p>
                <button onClick={() => setCreating(!creating)} className="btn-primary text-sm flex items-center gap-2">
                    <Icon name={creating ? 'x' : 'plus'} className="w-4 h-4" /> {creating ? 'Cancel' : 'New Campaign'}
                </button>
            </div>

            {creating && (
                <div className="glass-panel p-6 border-l-4 border-l-warning space-y-4">
                    <h3 className="text-sm font-semibold text-warning flex items-center gap-2">⚠️ New Phishing Simulation Campaign</h3>
                    <form onSubmit={create} className="space-y-3">
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Campaign name..." className="input-field w-full" />
                        <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject line..." className="input-field w-full" />
                        <input value={form.previewText} onChange={e => setForm(p => ({ ...p, previewText: e.target.value }))} placeholder="Email preview text..." className="input-field w-full text-sm" />
                        <textarea value={form.bodyHtml} onChange={e => setForm(p => ({ ...p, bodyHtml: e.target.value }))} rows={4} placeholder="Email body HTML..." className="input-field w-full text-sm font-mono resize-none" />
                        <div className="flex gap-3 items-center">
                            <select value={form.targetGroup} onChange={e => setForm(p => ({ ...p, targetGroup: e.target.value }))} className="input-field text-sm">
                                <option value="all">All Users</option>
                                <option value="free">Free Tier</option>
                                <option value="premium">Premium Tier</option>
                            </select>
                            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className="input-field text-sm flex-1" />
                            <button type="submit" className="btn-primary text-sm">Schedule</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                : campaigns.length === 0 ? (
                    <div className="glass-panel p-10 text-center text-text-secondary opacity-60">
                        <Icon name="mail" className="w-10 h-10 mx-auto mb-2" />
                        <p>No phishing campaigns created yet.</p>
                        <p className="text-xs mt-1">Create a simulated phishing campaign to train users.</p>
                    </div>
                ) : campaigns.map(c => (
                    <div key={c.id} className="glass-panel p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                            <Icon name="mail" className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                            <p className="text-text-secondary text-xs">Subject: {c.subject}</p>
                            {c.scheduledAt && <p className="text-text-secondary text-xs">Scheduled: {c.scheduledAt}</p>}
                        </div>
                        <div className="flex gap-4 text-center shrink-0">
                            <div><p className="font-bold text-accent">{c.opens || 0}</p><p className="text-[10px] text-text-secondary">Opens</p></div>
                            <div><p className="font-bold text-danger">{c.clicks || 0}</p><p className="text-[10px] text-text-secondary">Clicks</p></div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 capitalize ${c.status === 'sent' ? 'text-success bg-success/10 border-success/30' : 'text-warning bg-warning/10 border-warning/30'}`}>
                            {c.status}
                        </span>
                    </div>
                ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AcademyLMS() {
    const [activeTab, setActiveTab] = useState('modules');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <Icon name="graduationCap" className="w-8 h-8 text-accent" />
                <div>
                    <h1 className="text-2xl font-bold">Cyber Academy LMS</h1>
                    <p className="text-text-secondary text-sm">Course modules · Phishing campaigns · All stored in Firestore</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-glass-border pb-2">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary hover:text-text-primary'}`}>
                        <Icon name={t.icon} className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'modules' && <ModulesTab />}
            {activeTab === 'campaigns' && <CampaignsTab />}
        </div>
    );
}
