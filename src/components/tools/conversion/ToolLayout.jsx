import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../Icon';

export function ToolLayout({ title, description, icon, color, onBack, children }) {
    return (
        <div className="max-w-5xl mx-auto p-6 min-h-[80vh] flex flex-col">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-secondary hover:text-accent mb-6 transition-colors self-start"
            >
                <Icon name="arrowLeft" className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <div className={`p-4 rounded-xl bg-glass-panel-dark ${color}`}>
                    <Icon name={icon} className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
                    <p className="text-text-secondary">{description}</p>
                </div>
            </motion.div>

            <div className="flex-grow bg-glass-panel border border-glass-border rounded-2xl p-8 relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}

export function FileUploader({ onFileSelect, accept = ".pdf", multiple = false, label = "Select PDF file" }) {
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className="border-2 border-dashed border-glass-border rounded-xl p-12 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer flex flex-col items-center justify-center h-full min-h-[300px]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={(e) => onFileSelect(e.target.files)}
            />
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6 text-accent">
                <Icon name="uploadCloud" className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">{label}</h3>
            <p className="text-text-secondary">or drop files here</p>
        </div>
    );
}
