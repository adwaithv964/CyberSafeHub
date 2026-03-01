import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import axios from 'axios';

const AdminAuthContext = createContext();

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [adminRole, setAdminRole] = useState(null); // 'super_admin', 'analyst', 'content_manager', 'support'
    const [loading, setLoading] = useState(true);

    async function loginAdmin(email, password) {
        // Sign in with Firebase Auth
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Verify this user is an admin by checking the backend API attached to MongoDB
        try {
            const token = await result.user.getIdToken();
            const response = await axios.get('http://localhost:3001/api/admin/verify', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.role) {
                setAdminRole(response.data.role);
                setCurrentAdmin(result.user);
                return result;
            } else {
                throw new Error("Invalid admin response");
            }
        } catch (error) {
            console.error("Admin verification error:", error);
            // If they are a normal user who tried to log in here, immediately sign them out
            await signOut(auth);
            throw new Error("Unauthorized access. Admin privileges required.");
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
                    const token = await user.getIdToken();
                    const response = await axios.get('http://localhost:3001/api/admin/verify', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (isMounted) {
                        setAdminRole(response.data.role);
                        setCurrentAdmin(user);
                        setLoading(false);
                    }
                } catch (error) {
                    // console.error("Error fetching admin role stream:", error);
                    // If it fails (e.g., unauthorized)
                    if (isMounted) {
                        setCurrentAdmin(null);
                        setAdminRole(null);
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
    }, []);

    const value = {
        currentAdmin,
        adminRole,
        loading,
        loginAdmin,
        logoutAdmin
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}
