import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { API_BASE_URL } from '../config';

const TYPE_STYLE = {
    info: { bg: 'bg-sky-500/15 border-sky-500/30', text: 'text-sky-300', icon: 'info', bar: 'bg-sky-400' },
    warning: { bg: 'bg-yellow-500/15 border-yellow-500/30', text: 'text-yellow-300', icon: 'alertTriangle', bar: 'bg-yellow-400' },
    critical: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-300', icon: 'alertOctagon', bar: 'bg-red-500' },
    success: { bg: 'bg-green-500/15 border-green-500/30', text: 'text-green-300', icon: 'checkCircle', bar: 'bg-green-400' },
};

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState([]);
    const [current, setCurrent] = useState(0);
    const [dismissed, setDismissed] = useState(new Set());
    const [hidden, setHidden] = useState(false);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/announcements`);
            if (!res.ok) return;
            const data = await res.json();
            setAnnouncements(data.announcements || []);
        } catch {
            // Silently ignore — non-critical
        }
    }, []);

    // Initial load + poll every 30s for new announcements
    useEffect(() => {
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 30000);
        return () => clearInterval(interval);
    }, [fetchAnnouncements]);

    // Filter out dismissed
    const visible = announcements.filter(a => !dismissed.has(a._id));

    if (hidden || visible.length === 0) return null;

    const idx = Math.min(current, visible.length - 1);
    const ann = visible[idx];
    if (!ann) return null;

    const style = TYPE_STYLE[ann.type] || TYPE_STYLE.info;

    const dismiss = (id) => {
        setDismissed(prev => new Set([...prev, id]));
        setCurrent(0);
    };

    const dismissAll = () => setHidden(true);

    return (
        <AnimatePresence>
            <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className={`relative flex items-center gap-3 px-4 py-2.5 border-b ${style.bg} ${style.text} text-sm overflow-hidden z-50`}
            >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

                {/* Icon */}
                <Icon name={style.icon} className="w-4 h-4 shrink-0 ml-2" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <span className="font-semibold">{ann.title}</span>
                    {ann.body && <span className="ml-2 opacity-80">{ann.body}</span>}
                </div>

                {/* Multiple announcements pagination */}
                {visible.length > 1 && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setCurrent(Math.max(0, idx - 1))}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-xs opacity-70">{idx + 1}/{visible.length}</span>
                        <button
                            onClick={() => setCurrent(Math.min(visible.length - 1, idx + 1))}
                            disabled={idx === visible.length - 1}
                            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}

                {/* Dismiss this one */}
                <button
                    onClick={() => dismiss(ann._id)}
                    className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                    title="Dismiss this announcement"
                >
                    <Icon name="x" className="w-3.5 h-3.5" />
                </button>

                {/* Dismiss all */}
                {visible.length > 1 && (
                    <button
                        onClick={dismissAll}
                        className="shrink-0 text-xs opacity-50 hover:opacity-80 transition-opacity whitespace-nowrap"
                        title="Dismiss all"
                    >
                        Clear all
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
