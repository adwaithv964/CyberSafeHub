import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../Icon';
import { useConversionConfig } from '../hooks/useConversionConfig';

export function FormatSelector({ label, value, onChange, isOpen, onToggle, onClose, availableFormats = null }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const { config, loading } = useConversionConfig();

    // Group available formats by category
    const groupedFormats = React.useMemo(() => {
        if (!config || !config.formats) return {};

        const groups = {};

        // If availableFormats (allow-list) is provided, iterate THAT.
        // Otherwise iterate ALL formats.
        const pool = availableFormats
            ? Array.from(availableFormats).map(f => f.toLowerCase())
            : Object.keys(config.formats);

        pool.forEach(ext => {
            const fmt = config.formats[ext];
            if (!fmt) return;

            // Search Filter
            if (search && !ext.includes(search.toLowerCase()) && !fmt.label.toLowerCase().includes(search.toLowerCase())) {
                return;
            }

            // Create Category Group
            // Helper to Capitalize
            const catName = fmt.category.charAt(0).toUpperCase() + fmt.category.slice(1);

            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(ext.toUpperCase());
        });

        return groups;
    }, [config, availableFormats, search]);

    // Set initial active category
    useEffect(() => {
        if (isOpen && !activeCategory && Object.keys(groupedFormats).length > 0) {
            setActiveCategory(Object.keys(groupedFormats)[0]);
        }
    }, [isOpen, groupedFormats]);

    if (loading) return <div className="text-text-secondary">Loading formats...</div>;

    return (
        <div className="relative">
            {/* Trigger Button */}
            <div className="flex items-center gap-2">
                <span className="text-xl text-text-secondary font-light">{label}</span>
                <button
                    onClick={onToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-glass-panel-dark border border-glass-border hover:border-accent rounded-lg transition-all min-w-[120px] justify-between group"
                >
                    <span className="font-bold text-lg text-text-primary">{value || '...'}</span>
                    <Icon name="chevronDown" className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={onClose} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[600px] bg-[#1a1d21] border border-glass-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[600px]"
                        >
                            {/* Search Bar */}
                            <div className="p-3 border-b border-glass-border">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="Search Format"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-glass-panel border-none rounded-lg pl-9 pr-4 py-2 text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex flex-grow overflow-hidden">
                                {/* Categories Sidebar */}
                                <div className="w-1/3 border-r border-glass-border overflow-y-auto bg-[#151719]">
                                    {Object.keys(groupedFormats).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium flex justify-between items-center transition-colors ${activeCategory === cat
                                                ? 'bg-[#2b2f36] text-white border-l-2 border-accent'
                                                : 'text-text-secondary hover:bg-[#1f2226] hover:text-text-primary'
                                                }`}
                                        >
                                            {cat}
                                            <Icon name="chevronRight" className="w-3 h-3 opacity-50" />
                                        </button>
                                    ))}
                                    {Object.keys(groupedFormats).length === 0 && (
                                        <div className="p-4 text-text-secondary text-sm">
                                            No categories
                                        </div>
                                    )}
                                </div>

                                {/* Formats Grid */}
                                <div className="w-2/3 p-4 overflow-y-auto bg-[#1a1d21]">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {activeCategory && groupedFormats[activeCategory] && groupedFormats[activeCategory].map(fmt => (
                                            <button
                                                key={fmt}
                                                onClick={() => { onChange(fmt); onClose(); }}
                                                className={`px-3 py-2 rounded text-sm font-medium text-center transition-all ${value === fmt
                                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                                    : 'bg-[#2b2f36] text-text-secondary hover:bg-[#363b44] hover:text-white'
                                                    }`}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                        {(!activeCategory || !groupedFormats[activeCategory]) && (
                                            <div className="col-span-3 text-center text-text-secondary py-10 opacity-50">
                                                No formats available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

