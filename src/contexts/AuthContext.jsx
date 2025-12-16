import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { logActivity } from '../utils/activityLogger';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password).then(result => {
            logActivity('AUTH', 'New Account Created', `Email: ${email}`);
            return result;
        });
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password).then(result => {
            logActivity('AUTH', 'User Logged In', `Email: ${email}`);
            return result;
        });
    }

    function logout() {
        return signOut(auth).then(() => {
            logActivity('AUTH', 'User Logged Out', '');
        });
    }

    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider).then(result => {
            logActivity('AUTH', 'Logged in with Google', `Email: ${result.user.email}`);
            return result;
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
