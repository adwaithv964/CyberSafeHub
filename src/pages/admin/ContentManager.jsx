import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { API_BASE_URL } from '../../config';

const TABS = [
    { id: 'announcements', label: 'Announcements', icon: 'bell' },
    { id: 'articles', label: 'Articles & News', icon: 'newspaper' },
    { id: 'guides', label: 'Emergency Guides', icon: 'book' },
];

const TYPE_CONFIG = {
    info: { label: 'Info', cls: 'text-accent bg-accent/10 border-accent/30', icon: 'info' },
    warning: { label: 'Warning', cls: 'text-warning bg-warning/10 border-warning/30', icon: 'alertTriangle' },
    critical: { label: 'Critical', cls: 'text-danger bg-danger/10 border-danger/30', icon: 'alertOctagon' },
    success: { label: 'Success', cls: 'text-success bg-success/10 border-success/30', icon: 'checkCircle' },
};

// ─── Announcements Tab ────────────────────────────────────────────────────────
function AnnouncementsTab({ getToken }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('info');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setItems(data.announcements || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [getToken]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const create = async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setSubmitting(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, type })
            });
            const data = await res.json();
            setItems(prev => [data.announcement, ...prev]);
            setTitle(''); setBody('');
        } catch (e) { alert('Error: ' + e.message); } finally { setSubmitting(false); }
    };

    const toggle = async (id, cur) => {
        setTogglingId(id);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${id}`, {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !cur })
            });
            const data = await res.json();
            setItems(prev => prev.map(a => a._id === id ? data.announcement : a));
        } catch (e) { alert('Error: ' + e.message); } finally { setTogglingId(null); }
    };

    const del = async (id) => {
        if (!window.confirm('Delete?')) return;
        setDeletingId(id);
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/api/admin/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => prev.filter(a => a._id !== id));
        } catch (e) { alert('Error: ' + e.message); } finally { setDeletingId(null); }
    };

    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

    return (
        <div className="space-y-5">
            {/* Create Form */}
            <div className="glass-panel p-5 border-l-4 border-l-accent">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Icon name="plus" className="w-4 h-4 text-accent" /> New Announcement</h3>
                <form onSubmit={create} className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className="col-span-2 input-field" />
                        <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                            <option value="info">ℹ️ Info</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="critical">🚨 Critical</option>
                            <option value="success">✅ Success</option>
                        </select>
                    </div>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} placeholder="Body..." className="input-field resize-none w-full" />
                    {(title || body) && (
                        <div className={`p-3 rounded-lg border text-sm ${cfg.cls}`}>
                            <p className="font-semibold">{title || 'Title'}</p>
                            <p className="text-xs opacity-80 mt-0.5">{body}</p>
                        </div>
                    )}
                    <button type="submit" disabled={submitting} className="btn-primary text-sm">
                        {submitting ? 'Publishing...' : 'Publish'}
                    </button>
                </form>
            </div>

            {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                : items.map(ann => {
                    const c = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
                    return (
                        <div key={ann._id} className={`glass-panel p-4 flex items-start gap-3 ${!ann.active ? 'opacity-50' : ''}`}>
                            <div className={`mt-0.5 p-1.5 rounded-lg border ${c.cls}`}><Icon name={c.icon} className="w-4 h-4" /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-text-primary text-sm">{ann.title}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${c.cls}`}>{c.label}</span>
                                    {!ann.active && <span className="text-[10px] text-text-secondary border border-glass-border rounded-full px-1.5">Hidden</span>}
                                </div>
                                <p className="text-text-secondary text-xs mt-0.5">{ann.body}</p>
                                <p className="text-text-secondary text-[10px] mt-1">by {ann.createdBy} · {new Date(ann.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => toggle(ann._id, ann.active)} disabled={togglingId === ann._id} className="icon-btn" title={ann.active ? 'Hide' : 'Show'}><Icon name={ann.active ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" /></button>
                                <button onClick={() => del(ann._id)} disabled={deletingId === ann._id} className="icon-btn text-danger" title="Delete"><Icon name="trash2" className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

// ─── Articles Tab ─────────────────────────────────────────────────────────────
function ArticlesTab({ getToken, category }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | 'new' | article object
    const [form, setForm] = useState({ title: '', excerpt: '', body: '', tags: '', status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/articles?category=${category}&limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setArticles(data.articles || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [getToken, category]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const openNew = () => { setForm({ title: '', excerpt: '', body: '', tags: '', status: 'draft' }); setEditing('new'); };
    const openEdit = (a) => { setForm({ title: a.title, excerpt: a.excerpt || '', body: a.body, tags: (a.tags || []).join(', '), status: a.status }); setEditing(a); };

    const save = async () => {
        if (!form.title.trim() || !form.body.trim()) return alert('Title and body are required');
        setSaving(true);
        try {
            const token = await getToken();
            const payload = { ...form, category, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
            let res;
            if (editing === 'new') {
                res = await fetch(`${API_BASE_URL}/api/admin/articles`, {
                    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                setArticles(prev => [data.article, ...prev]);
            } else {
                res = await fetch(`${API_BASE_URL}/api/admin/articles/${editing._id}`, {
                    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                setArticles(prev => prev.map(a => a._id === editing._id ? data.article : a));
            }
            setEditing(null);
        } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this article?')) return;
        setDeletingId(id);
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/api/admin/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setArticles(prev => prev.filter(a => a._id !== id));
        } catch (e) { alert('Error: ' + e.message); } finally { setDeletingId(null); }
    };

    const togglePublish = async (a) => {
        const newStatus = a.status === 'published' ? 'draft' : 'published';
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/articles/${a._id}`, {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            setArticles(prev => prev.map(ar => ar._id === a._id ? data.article : ar));
        } catch (e) { alert('Error: ' + e.message); }
    };

    if (editing !== null) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{editing === 'new' ? 'New Article' : `Editing: ${editing.title}`}</h3>
                    <button onClick={() => setEditing(null)} className="text-text-secondary hover:text-text-primary text-sm">← Back</button>
                </div>
                <div className="glass-panel p-6 space-y-4">
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Article title..." className="input-field w-full text-lg font-semibold" />
                    <input value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short excerpt (shown in listings)..." className="input-field w-full text-sm" />
                    <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={14} placeholder="Full article body (Markdown supported)..." className="input-field w-full text-sm resize-none font-mono" />
                    <div className="flex gap-3 items-center flex-wrap">
                        <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Tags: security, news, breach..." className="input-field flex-1 text-sm" />
                        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field text-sm">
                            <option value="draft">📝 Draft</option>
                            <option value="published">✅ Published</option>
                        </select>
                        <button onClick={save} disabled={saving} className="btn-primary text-sm">
                            {saving ? 'Saving...' : 'Save Article'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-text-secondary text-sm">{articles.length} articles in this category</p>
                <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2"><Icon name="plus" className="w-4 h-4" /> New Article</button>
            </div>
            {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                : articles.length === 0 ? (
                    <div className="glass-panel p-10 text-center text-text-secondary opacity-60">
                        <Icon name="fileText" className="w-10 h-10 mx-auto mb-2" />
                        <p>No articles yet. Create your first one.</p>
                    </div>
                ) : (
                    <div className="glass-panel overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-glass-border text-text-secondary text-xs">
                                <th className="text-left px-4 py-3 font-medium">Title</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Author</th>
                                <th className="text-left px-4 py-3 font-medium">Updated</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr></thead>
                            <tbody>
                                {articles.map(a => (
                                    <tr key={a._id} className="border-b border-glass-border/40 hover:bg-white/2">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text-primary">{a.title}</p>
                                            {a.excerpt && <p className="text-text-secondary text-xs truncate max-w-xs">{a.excerpt}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${a.status === 'published' ? 'text-success bg-success/10 border-success/30' : 'text-text-secondary bg-white/5 border-glass-border'}`}>
                                                {a.status === 'published' ? '✅ Live' : '📝 Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">{a.author}</td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">
                                            {new Date(a.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(a)} className="icon-btn" title="Edit"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => togglePublish(a)} className={`icon-btn ${a.status === 'published' ? 'text-warning' : 'text-success'}`} title={a.status === 'published' ? 'Unpublish' : 'Publish'}>
                                                    <Icon name={a.status === 'published' ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => del(a._id)} disabled={deletingId === a._id} className="icon-btn text-danger" title="Delete"><Icon name="trash2" className="w-3.5 h-3.5" /></button>
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

// ─── Main: ContentManager ─────────────────────────────────────────────────────
export default function ContentManager() {
    const { currentAdmin } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('announcements');

    const getToken = useCallback(async () => {
        if (!currentAdmin) return null;
        return currentAdmin.getIdToken();
    }, [currentAdmin]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <Icon name="newspaper" className="w-8 h-8 text-accent" />
                <div>
                    <h1 className="text-2xl font-bold">Content Management System</h1>
                    <p className="text-text-secondary text-sm">Announcements · Cyber News · Emergency Guides · Privacy Tips</p>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 border-b border-glass-border pb-2 flex-wrap">
                {[
                    { id: 'announcements', label: 'Announcements', icon: 'bell' },
                    { id: 'news', label: 'Cyber News', icon: 'newspaper' },
                    { id: 'guide', label: 'Emergency Guides', icon: 'book' },
                    { id: 'privacy', label: 'Privacy Tips', icon: 'lock' },
                ].map(t => (
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

            {/* Tab Content */}
            <div>
                {activeTab === 'announcements' && <AnnouncementsTab getToken={getToken} />}
                {activeTab === 'news' && <ArticlesTab getToken={getToken} category="news" />}
                {activeTab === 'guide' && <ArticlesTab getToken={getToken} category="guide" />}
                {activeTab === 'privacy' && <ArticlesTab getToken={getToken} category="privacy" />}
            </div>
        </div>
    );
}
