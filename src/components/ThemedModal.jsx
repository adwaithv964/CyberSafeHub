import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemedModal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    className="glass-panel w-full max-w-md m-4 relative overflow-hidden"
                >
                    <div className="p-6 border-b border-glass-border flex justify-between items-center">
                        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                        <button onClick={onClose} className="text-text-secondary hover:text-accent text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ThemedModal;
