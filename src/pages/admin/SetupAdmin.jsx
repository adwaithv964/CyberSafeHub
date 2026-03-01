import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function SetupAdmin() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleCreateAdmin = async () => {
        setLoading(true);
        setMessage('');
        try {
            const email = 'admin@cybersafehub.com';
            const password = 'admin123';
            let user = null;

            try {
                // Try logging in first to see if they exist
                const userCredential = await import('firebase/auth').then(({ signInWithEmailAndPassword }) => signInWithEmailAndPassword(auth, email, password));
                user = userCredential.user;
                setMessage(`Admin account already exists. Verifying permissions...`);
            } catch (loginError) {
                if (loginError.code === 'auth/invalid-credential' || loginError.code === 'auth/user-not-found' || loginError.code === 'auth/wrong-password') {
                    // Try to create 
                    try {
                        const createCredential = await createUserWithEmailAndPassword(auth, email, password);
                        user = createCredential.user;
                        setMessage(`Successfully created admin account: ${email}`);
                    } catch (createError) {
                        if (createError.code === 'auth/email-already-in-use') {
                            setMessage('Admin account already exists, but login failed. Please reset password.');
                            return;
                        }
                        throw createError;
                    }
                } else {
                    throw loginError; // some other error
                }
            }

            if (user) {
                // Add specifically to the 'admins' collection
                await setDoc(doc(db, 'admins', user.uid), {
                    email: user.email,
                    role: 'super_admin',
                    createdAt: serverTimestamp()
                }, { merge: true }); // Important: use merge so we don't overwrite if it exists

                setMessage(`Admin permissions verified. Redirecting...`);
                setTimeout(() => navigate('/admin/login'), 2000);
            }

        } catch (error) {
            console.error('Setup error:', error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
            <div className="glass-panel max-w-md w-full p-8 z-10 relative border-danger/30 text-center">
                <h1 className="text-2xl font-bold mb-4">Initial Admin Setup</h1>
                <p className="text-text-secondary mb-6 text-sm">
                    This is a temporary setup route. Click the button below to generate the default
                    Super Administrator account (admin@cybersafehub.com).
                </p>

                <button
                    onClick={handleCreateAdmin}
                    disabled={loading}
                    className="w-full bg-danger text-white rounded-lg py-2 font-semibold hover:bg-danger/90 transition-colors shadow-glow-danger disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Seed Default Admin'}
                </button>

                {message && (
                    <div className="mt-4 p-3 bg-background/50 border border-glass-border rounded text-sm break-words">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
