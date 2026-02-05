import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

export default function CyberToolsPage() {
    const navigate = useNavigate();

    const handleToolSelect = (toolId) => {
        navigate(`/tools/${toolId}`);
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

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-green-400 hover:shadow-glow-green transition-all group"
                    onClick={() => handleToolSelect('secure-share')}
                >
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                        <Icon name="share2" className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Secure Share</h3>
                    <p className="text-text-secondary text-sm">
                        P2P Encrypted File Transfer directly between devices. No server storage.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-orange-400 hover:shadow-glow-orange transition-all group"
                    onClick={() => handleToolSelect('conversion-system')}
                >
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                        <Icon name="fileText" className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">All-in-One Converter</h3>
                    <p className="text-text-secondary text-sm">
                        Merge, Split, Compress, and Convert PDFs and Images. 20+ Tools in one place.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-emerald-400 hover:shadow-glow-emerald transition-all group"
                    onClick={() => handleToolSelect('code-auditor')}
                >
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                        <Icon name="code" className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Code Security Auditor</h3>
                    <p className="text-text-secondary text-sm">
                        AI-powered static analysis to identify vulnerabilities in your code snippets instantly.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-glass-panel p-6 rounded-xl border border-glass-border cursor-pointer hover:border-pink-400 hover:shadow-glow-pink transition-all group"
                    onClick={() => handleToolSelect('privacy-decoder')}
                >
                    <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                        <Icon name="book" className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Policy Decoder</h3>
                    <p className="text-text-secondary text-sm">
                        Paste legal jargon (Terms of Service, Privacy Policies) and get an instant AI summary of red flags.
                    </p>
                </motion.div>


            </div>
        </div>
    );
}
