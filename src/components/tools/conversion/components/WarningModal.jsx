import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../Icon';

export function WarningModal({ isOpen, warning, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-[#1a1d21] border border-yellow-500/30 rounded-xl shadow-2xl p-6 max-w-md w-full"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
                            <Icon name="alertTriangle" className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Quality Warning</h3>
                            <p className="text-text-secondary leading-relaxed">
                                {warning || "This conversion may result in quality loss."}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg hover:bg-[#2b2f36] text-text-secondary transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Icon name="check" className="w-4 h-4" />
                            Proceed Anyway
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
