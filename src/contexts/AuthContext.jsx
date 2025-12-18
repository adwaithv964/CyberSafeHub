import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    updateEmail,
    updatePassword,
    multiFactor,
    TotpMultiFactorGenerator,
    TotpSecret,
    getMultiFactorResolver,
    deleteUser
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

    function updateUserProfile(user, profileData) {
        return updateProfile(user, profileData).then(() => {
            logActivity('AUTH', 'Profile Updated', 'User updated profile details');
        });
    }

    function updateUserEmail(user, email) {
        return updateEmail(user, email).then(() => {
            logActivity('AUTH', 'Email Updated', `New Email: ${email}`);
        });
    }

    function updateUserPassword(user, password) {
        return updatePassword(user, password).then(() => {
            logActivity('AUTH', 'Password Changed', 'User changed password');
        });
    }

    // MFA: Step 1 - Generate Secret for Enrollment
    async function mfaGenerateSecret(user) {
        const session = await multiFactor(user).getSession();
        const secret = await TotpMultiFactorGenerator.generateSecret(session);
        return secret; // Contains secretKey, generateQrCodeUrl, etc.
    }

    // MFA: Step 2 - Verify Code and Enable MFA
    async function mfaEnable(user, secret, code) {
        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code);
        await multiFactor(user).enroll(multiFactorAssertion, "Authenticator App");
        logActivity('AUTH', 'MFA Enabled', 'User enabled TOTP MFA');
    }

    // MFA: Step 3 - Resolve Login Challenge
    async function mfaResolveSignIn(resolver, verificationId, code) {
        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(verificationId, code);
        const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
        logActivity('AUTH', 'MFA Login', 'User passed MFA challenge');
        return userCredential;
    }

    function deleteAccount(user) {
        return deleteUser(user).then(() => {
            logActivity('AUTH', 'Account Deleted', 'User permanently deleted their account');
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
        googleSignIn,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        mfaGenerateSecret,
        mfaEnable,
        mfaResolveSignIn,
        getMultiFactorResolver,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
