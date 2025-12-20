import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';

export default function CyberToolsPage({ onNavigate }) {

    const handleToolSelect = (toolId) => {
        // Update URL
        window.history.pushState({}, '', `/tools/${toolId}`);
        // Navigate via App.jsx
        if (onNavigate) {
            onNavigate(toolId);
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Cyber Tools</h1>
                <p className="text-text-secondary">Advanced utilities for secure communication and analysis.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-accent hover:shadow-glow-accent transition-all group"
                    onClick={() => handleToolSelect('dead-drop')}
                >
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                        <Icon name="skull" className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Dead Drop</h3>
                    <p className="text-text-secondary text-sm">
                        Share secrets securely. Create encrypted, self-destructing links that vanish after being viewed.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-purple-400 hover:shadow-glow-purple transition-all group"
                    onClick={() => handleToolSelect('metadata-washer')}
                >
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                        <Icon name="image" className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Metadata Washer</h3>
                    <p className="text-text-secondary text-sm">
                        Remove hidden GPS, Camera, and Date information from your photos before sharing.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-blue-400 hover:shadow-glow-blue transition-all group"
                    onClick={() => handleToolSelect('username-detective')}
                >
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                        <Icon name="search" className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Username Detective</h3>
                    <p className="text-text-secondary text-sm">
                        OSINT tool to investigate username presence across 50+ social networks and platforms to find digital footprints.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-cyan-400 hover:shadow-glow-cyan transition-all group"
                    onClick={() => handleToolSelect('wifi-radar')}
                >
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                        <Icon name="wifi" className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">WiFi Radar</h3>
                    <p className="text-text-secondary text-sm">
                        Scan local network for connected devices and detect potential "promiscuous mode" spying activity.
                    </p>
                </motion.div>


            </div>
        </div>
    );
}
