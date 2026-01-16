import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../Icon';

const tools = [
    { id: 'universal', name: 'Universal Converter', icon: 'refreshCw', color: 'text-emerald-500', group: 'Universal' },
    { id: 'merge-pdf', name: 'Merge PDF', icon: 'filePlus', color: 'text-red-500', group: 'Organize' },
    { id: 'split-pdf', name: 'Split PDF', icon: 'scissors', color: 'text-red-500', group: 'Organize' },
    { id: 'remove-pages', name: 'Remove Pages', icon: 'trash', color: 'text-red-500', group: 'Organize' },
    { id: 'extract-pages', name: 'Extract Pages', icon: 'copy', color: 'text-red-500', group: 'Organize' },
    { id: 'organize-pdf', name: 'Organize PDF', icon: 'layers', color: 'text-red-500', group: 'Organize' },
    { id: 'scan-pdf', name: 'Scan to PDF', icon: 'camera', color: 'text-red-500', group: 'Organize' },

    { id: 'compress-pdf', name: 'Compress PDF', icon: 'minimize', color: 'text-green-500', group: 'Optimize' },
    { id: 'repair-pdf', name: 'Repair PDF', icon: 'tool', color: 'text-green-500', group: 'Optimize' },
    { id: 'ocr-pdf', name: 'OCR PDF', icon: 'scanLine', color: 'text-green-500', group: 'Optimize' },

    { id: 'jpg-to-pdf', name: 'JPG to PDF', icon: 'image', color: 'text-yellow-500', group: 'Convert To PDF' },
    { id: 'word-to-pdf', name: 'WORD to PDF', icon: 'fileText', color: 'text-blue-500', group: 'Convert To PDF' },
    { id: 'powerpoint-to-pdf', name: 'PPT to PDF', icon: 'monitor', color: 'text-orange-500', group: 'Convert To PDF' },
    { id: 'excel-to-pdf', name: 'EXCEL to PDF', icon: 'grid', color: 'text-green-600', group: 'Convert To PDF' },
    { id: 'html-to-pdf', name: 'HTML to PDF', icon: 'code', color: 'text-gray-500', group: 'Convert To PDF' },

    { id: 'pdf-to-jpg', name: 'PDF to JPG', icon: 'image', color: 'text-yellow-500', group: 'Convert From PDF' },
    { id: 'pdf-to-word', name: 'PDF to WORD', icon: 'fileText', color: 'text-blue-500', group: 'Convert From PDF' },
    { id: 'pdf-to-powerpoint', name: 'PDF to PPT', icon: 'monitor', color: 'text-orange-500', group: 'Convert From PDF' },
    { id: 'pdf-to-excel', name: 'PDF to EXCEL', icon: 'grid', color: 'text-green-600', group: 'Convert From PDF' },
    { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', icon: 'file', color: 'text-red-800', group: 'Convert From PDF' },

    { id: 'rotate-pdf', name: 'Rotate PDF', icon: 'refreshCw', color: 'text-purple-500', group: 'Edit' },
    { id: 'add-page-numbers', name: 'Page Numbers', icon: 'hash', color: 'text-purple-500', group: 'Edit' },
    { id: 'add-watermark', name: 'Add Watermark', icon: 'droplet', color: 'text-purple-500', group: 'Edit' },
    { id: 'edit-pdf', name: 'Edit PDF', icon: 'edit', color: 'text-purple-500', group: 'Edit' },

    { id: 'unlock-pdf', name: 'Unlock PDF', icon: 'unlock', color: 'text-gray-400', group: 'Security' },
    { id: 'protect-pdf', name: 'Protect PDF', icon: 'lock', color: 'text-gray-400', group: 'Security' },
    { id: 'sign-pdf', name: 'Sign PDF', icon: 'penTool', color: 'text-gray-400', group: 'Security' },
    { id: 'redact-pdf', name: 'Redact PDF', icon: 'eyeOff', color: 'text-gray-400', group: 'Security' },
    { id: 'compare-pdf', name: 'Compare PDF', icon: 'copy', color: 'text-gray-400', group: 'Security' },
];

export function ConversionDashboard({ onSelectTool, onBack }) {
    // Group tools by their group property
    const groupedTools = tools.reduce((acc, tool) => {
        if (!acc[tool.group]) acc[tool.group] = [];
        acc[tool.group].push(tool);
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto p-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-secondary hover:text-accent mb-6 transition-colors"
            >
                <Icon name="arrowLeft" className="w-5 h-5" />
                <span>Back to Tools</span>
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">All-in-One Converter</h1>
                <p className="text-text-secondary">Comprehensive tools for your documents.</p>
            </div>

            <div className="space-y-10">
                {Object.entries(groupedTools).map(([groupName, groupTools]) => (
                    <div key={groupName}>
                        <h2 className="text-xl font-semibold text-text-primary mb-4 border-b border-glass-border pb-2 uppercase tracking-wider text-sm opacity-80">{groupName}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {groupTools.map(tool => (
                                <motion.div
                                    key={tool.id}
                                    whileHover={{ scale: 1.05, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelectTool(tool.id)}
                                    className="bg-glass-panel p-4 rounded-xl border border-glass-border hover:border-accent/50 cursor-pointer transition-all flex items-center gap-4 group"
                                >
                                    <div className={`p-3 rounded-lg bg-glass-panel-dark group-hover:bg-accent/10 transition-colors ${tool.color}`}>
                                        <Icon name={tool.icon} className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-text-primary">{tool.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
