import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { useMaintenance } from '../contexts/MaintenanceContext';

// Helper to provide context-aware text and icons for maintenance screens
const getFeatureDetails = (key) => {
    if (!key) {
        return { title: 'Platform Features', coming: "Enhanced security, faster performance, and improved threat detection algorithms.", icon: "shieldCheck" };
    }
    
    if (key.startsWith('scanners')) {
        return {
            title: "Security Scanners",
            coming: "Enhanced AI-driven malware detection, broader breach database coverage, and faster scan times.",
            icon: "shieldCheck"
        };
    } else if (key.startsWith('tools')) {
        return {
            title: "Cyber Tools",
            coming: "More comprehensive analysis options, support for larger files, and new utility additions.",
            icon: "wrench"
        };
    } else if (key.startsWith('academy')) {
        return {
            title: "Cyber Academy",
            coming: "New interactive labs, advanced learning paths, and detailed progress tracking.",
            icon: "graduationCap"
        };
    } else if (key === 'vault') {
        return {
            title: "Password Vault",
            coming: "Cloud synchronization, automated password rotation, and enhanced biometric un-locking.",
            icon: "lock"
        };
    } else if (key === 'assistant') {
        return {
            title: "Cyber Assistant",
            coming: "Upgraded AI model for smarter responses, deep context awareness, and faster processing.",
            icon: "bot"
        };
    } else if (key === 'network') {
        return {
            title: "Network Tools",
            coming: "Advanced port scanning, deeper ISP packet inspection, and continuous node monitoring.",
            icon: "activity"
        };
    } else if (key === 'healthcheck') {
        return {
            title: "Health Check",
            coming: "Automated scheduled checks and deeper integration with system security APIs.",
            icon: "heartPulse"
        };
    } else if (key === 'privacy') {
        return {
            title: "Digital Privacy",
            coming: "More in-depth privacy analysis algorithms and automated tracker opt-out requests.",
            icon: "eyeOff"
        };
    } else if (key === 'news') {
        return {
            title: "Cyber News",
            coming: "Real-time threat intelligence feeds, customizable alerts, and deeper analysis articles.",
            icon: "fileText"
        };
    } else {
        return {
            title: "Platform Features",
            coming: "Enhanced security, faster performance, and improved architectural algorithms.",
            icon: "shieldCheck"
        };
    }
};

export default function MaintenanceGuard({ featureKey, children, isPage = true }) {
    const { isAvailable, loading } = useMaintenance();

    if (loading) return children;

    if (isAvailable(featureKey)) {
        return children;
    }

    const details = getFeatureDetails(featureKey);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`flex flex-col items-center justify-center p-6 sm:p-8 text-center w-full mx-auto ${isPage ? 'max-w-3xl min-h-[70vh]' : 'max-w-2xl min-h-[400px] glass-panel rounded-2xl'}`}
        >
            {/* Icons Container */}
            <div className="relative mb-10 mt-6 pt-6">
                {/* Main jumpy shield/barricade icon */}
                <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        ease: "easeInOut" 
                    }}
                    className="w-32 h-32 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)] relative z-10"
                >
                    <Icon name="shieldAlert" className="w-16 h-16 text-orange-500" />
                </motion.div>

                {/* Small floating spanner, spaced out (right-8, top-0) */}
                <motion.div
                    animate={{ 
                        y: [-5, -20, -5],
                        rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360]
                    }}
                    transition={{ 
                        y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                        rotate: { repeat: Infinity, duration: 4, ease: "linear" }
                    }}
                    className="absolute -right-8 top-0 w-12 h-12 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20"
                >
                    <Icon name="tool" className="w-5 h-5 text-gray-300" />
                </motion.div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-3 tracking-tight">
                Under Maintenance
            </h1>
            
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                We're currently upgrading our <span className="text-gray-200 font-semibold">{details.title}</span> section to serve you better!
            </p>

            {/* Expected Return Box */}
            <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full glass-panel border-t-4 border-t-orange-500 rounded-2xl p-6 sm:p-8 shadow-xl mb-6 flex flex-col items-center relative overflow-hidden"
            >
                <div className="flex items-center justify-center gap-2 mb-4 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
                    <Icon name="clock" className="w-4 h-4 text-orange-500" />
                    <h2 className="text-[13px] font-bold text-orange-300 tracking-wider uppercase">Expected Return</h2>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-3 tracking-tight">
                    Soon
                </h3>
                
                <p className="text-gray-400 text-sm">
                    Our team is working hard to enhance your experience
                </p>
            </motion.div>

            {/* What's Coming Box */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-blue-900/10 border border-blue-500/20 rounded-xl p-5 mb-6 flex items-start text-left gap-4 hover:border-blue-500/40 transition-colors"
            >
                <div className="bg-blue-600 rounded-lg p-2.5 flex-shrink-0 mt-0.5 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    <Icon name={details.icon} className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-200 text-[15px] mb-1">What's Coming?</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {details.coming}
                    </p>
                </div>
            </motion.div>

            {/* Stay Connected Box */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full bg-purple-900/10 border border-purple-500/20 rounded-xl p-5 flex items-start text-left gap-4 hover:border-purple-500/40 transition-colors"
            >
                <div className="bg-purple-600 rounded-lg p-2.5 flex-shrink-0 mt-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <Icon name="rss" className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-200 text-[15px] mb-1">Stay Connected</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Follow us on social media for real-time updates and announcements.
                    </p>
                </div>
            </motion.div>

            {isPage && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.history.back()}
                    className="mt-10 px-10 py-3 bg-gray-800 border border-gray-600 rounded-xl font-semibold text-gray-300 hover:text-white transition-all shadow-md"
                >
                    Go Back
                </motion.button>
            )}
        </motion.div>
    );
}
