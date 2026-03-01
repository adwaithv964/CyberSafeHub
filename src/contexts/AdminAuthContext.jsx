import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AdminAuthContext = createContext();

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [adminRole, setAdminRole] = useState(null);
    const [loading, setLoading] = useState(true);

    async function verifyWithBackend(user) {
        // Always force-refresh the token before verifying to avoid stale-token 403
        const token = await user.getIdToken(/* forceRefresh= */ true);
        const response = await axios.get(`${API_BASE_URL}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // { role, email }
    }

    async function loginAdmin(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        try {
            const data = await verifyWithBackend(result.user);
            if (data && data.role) {
                setAdminRole(data.role);
                setCurrentAdmin(result.user);
                return result;
            }
            throw new Error('Invalid admin response');
        } catch (error) {
            console.error('Admin verification error:', error);
            await signOut(auth);
            const msg = error?.response?.status === 403
                ? 'Unauthorized access. Admin privileges required.'
                : 'Login failed: ' + (error?.response?.data?.error || error.message);
            throw new Error(msg);
        }
    }

    async function logoutAdmin() {
        setAdminRole(null);
        setCurrentAdmin(null);
        return signOut(auth);
    }

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const data = await verifyWithBackend(user);
                    if (isMounted) {
                        setAdminRole(data.role || null);
                        setCurrentAdmin(user);
                        setLoading(false);
                    }
                } catch (error) {
                    // If verify fails during token refresh (transient 401/403), keep existing session.
                    // Only clear state on initial load (i.e., when no admin was set yet).
                    if (isMounted) {
                        // Preserve the session if we already have a valid admin role loaded
                        if (!adminRole) {
                            setCurrentAdmin(null);
                            setAdminRole(null);
                        }
                        setLoading(false);
                    }
                }
            } else {
                if (isMounted) {
                    setCurrentAdmin(null);
                    setAdminRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = { currentAdmin, adminRole, loading, loginAdmin, logoutAdmin };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}
