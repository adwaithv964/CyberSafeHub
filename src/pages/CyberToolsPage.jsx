import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { API_BASE_URL } from '../config';

// Colour mapping from the admin tool color field → Tailwind classes
const COLOR_MAP = {
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', hover: 'hover:border-cyan-400', shadow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', hover: 'hover:border-purple-400', shadow: 'hover:shadow-[0_0_20px_rgba(167,139,250,0.15)]' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', hover: 'hover:border-blue-400', shadow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', hover: 'hover:border-green-400', shadow: 'hover:shadow-[0_0_20px_rgba(74,222,128,0.15)]' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', hover: 'hover:border-orange-400', shadow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', hover: 'hover:border-pink-400', shadow: 'hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', hover: 'hover:border-emerald-400', shadow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', hover: 'hover:border-red-400', shadow: 'hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', hover: 'hover:border-yellow-400', shadow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', hover: 'hover:border-indigo-400', shadow: 'hover:shadow-[0_0_20px_rgba(129,140,248,0.15)]' },
};
const DEFAULT_COLOR = COLOR_MAP.cyan;

const CATEGORY_LABELS = {
    scanner: '🔍 Scanner',
    osint: '🕵️ OSINT',
    privacy: '🔒 Privacy',
    converter: '🔄 Converter',
    ai: '🤖 AI',
    crypto: '🔐 Crypto',
    utility: '🛠️ Utility',
};

export default function CyberToolsPage() {
    const navigate = useNavigate();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/cyber-tools`)
            .then(r => r.json())
            .then(data => setTools(data.tools || []))
            .catch(() => setTools([]))
            .finally(() => setLoading(false));
    }, []);

    const handleToolSelect = (tool) => {
        // Fire-and-forget usage track
        fetch(`${API_BASE_URL}/api/cyber-tools/${tool._id}/use`, { method: 'POST' }).catch(() => { });

        if (tool.isExternal) {
            window.open(tool.route, '_blank', 'noopener,noreferrer');
        } else {
            navigate(tool.route);
        }
    };

    const categories = ['all', ...new Set(tools.map(t => t.category).filter(Boolean))];
    const filtered = tools.filter(t => {
        const matchCat = activeCategory === 'all' || t.category === activeCategory;
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Cyber Tools</h1>
                <p className="text-text-secondary">Advanced utilities for secure communication and analysis.</p>
            </div>

            {/* Search + Category Filter */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-glass-panel border border-glass-border rounded-lg px-3 py-2">
                    <Icon name="search" className="w-4 h-4 text-text-secondary shrink-0" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? 'bg-accent/10 border-accent/40 text-accent' : 'border-glass-border text-text-secondary hover:text-text-primary'}`}
                        >
                            {cat === 'all' ? '🔢 All' : (CATEGORY_LABELS[cat] || cat)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-text-secondary opacity-60">
                    <Icon name="tool" className="w-12 h-12 mx-auto mb-3" />
                    <p>No tools match your search.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((tool, i) => {
                        const colors = COLOR_MAP[tool.color] || DEFAULT_COLOR;
                        return (
                            <motion.div
                                key={tool._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ scale: 1.02, translateY: -5 }}
                                className={`bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer ${colors.hover} ${colors.shadow} transition-all group relative overflow-hidden`}
                                onClick={() => handleToolSelect(tool)}
                            >
                                {/* Badge */}
                                {tool.badge && (
                                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border border-current/30`}>
                                        {tool.badge}
                                    </span>
                                )}
                                {/* External link indicator */}
                                {tool.isExternal && (
                                    <span className="absolute top-3 right-3 text-text-secondary opacity-40 text-xs">↗</span>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl`}>
                                    {tool.emoji
                                        ? <span>{tool.emoji}</span>
                                        : <Icon name={tool.icon || 'tool'} className={`w-6 h-6 ${colors.text}`} />
                                    }
                                </div>

                                <h3 className="text-xl font-semibold text-text-primary mb-2">{tool.name}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{tool.description}</p>

                                <div className={`mt-3 text-xs font-medium capitalize opacity-0 group-hover:opacity-100 transition-opacity ${colors.text}`}>
                                    {CATEGORY_LABELS[tool.category] || tool.category} →
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
