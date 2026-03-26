import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { useMaintenance } from '../contexts/MaintenanceContext';

export default function MaintenanceGuard({ featureKey, children, isPage = true }) {
    const { isAvailable, loading } = useMaintenance();

    if (loading) return children;

    if (isAvailable(featureKey)) {
        return children;
    }

    if (isPage) {
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] text-center animate-fade-in glass-panel m-4 rounded-xl">
                <div className="w-24 h-24 mb-6 rounded-full bg-warning/10 flex items-center justify-center border border-warning/30">
                    <Icon name="tool" className="w-12 h-12 text-warning" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-3">Under Maintenance</h1>
                <p className="text-text-secondary max-w-md mx-auto">
                    This feature is currently undergoing scheduled maintenance or being upgraded to serve you better. 
                    Please check back later.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-8 px-6 py-2 bg-secondary hover:bg-glass-panel border border-border-color rounded-lg text-sm text-text-secondary hover:text-text-primary transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-warning/5 border border-warning/20 rounded-xl w-full h-full min-h-[200px]">
            <Icon name="tool" className="w-8 h-8 text-warning mb-2" />
            <h3 className="text-lg font-semibold text-text-primary mb-1">Tool Unavailable</h3>
            <p className="text-sm text-text-secondary max-w-xs mx-auto">This tool is currently undergoing maintenance.</p>
        </div>
    );
}
