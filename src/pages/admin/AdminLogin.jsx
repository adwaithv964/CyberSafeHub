import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginAdmin(email.trim(), password.trim());
            navigate('/admin');
        } catch (err) {
            console.error(err);
            setError('Failed to log in as Admin. Check credentials or permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-danger/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-danger/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel max-w-md w-full p-8 z-10 relative border-danger/30"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4 border border-danger/30">
                        <Icon name="shieldAlert" className="w-8 h-8 text-danger drop-shadow-glow-danger" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary text-center">Restricted Area</h2>
                    <p className="text-text-secondary text-center mt-2 text-sm">
                        CyberSafeHub Administration Login. Authorized personnel only.
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-danger/20 text-danger border border-danger/30 rounded p-3 mb-6 text-sm flex items-center gap-2"
                    >
                        <Icon name="alertCircle" className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Admin Email</label>
                        <div className="relative">
                            <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background/50 border border-glass-border rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-colors"
                                placeholder="commander@cybersafehub.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Passphrase</label>
                        <div className="relative">
                            <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background/50 border border-glass-border rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-danger text-white rounded-lg py-2 mt-4 font-semibold hover:bg-danger/90 transition-colors shadow-glow-danger disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Icon name="loader" className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Icon name="logIn" className="w-5 h-5" />
                                Authenticate
                            </>
                        )}
                    </button>

                    <div className="mt-4 text-center">
                        <a href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1">
                            <Icon name="arrowLeft" className="w-4 h-4" /> Return to Public Portal
                        </a>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
