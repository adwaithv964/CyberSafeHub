import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function verifyAdmin() {
    const email = 'admin@cybersafehub.com';
    const password = 'admin123';

    try {
        let user;
        try {
            console.log('Attempting to create user...');
            const createCredential = await createUserWithEmailAndPassword(auth, email, password);
            user = createCredential.user;
            console.log('User created:', user.uid);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                console.log('User already exists. Attempting to sign in to verify password...');
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    user = userCredential.user;
                    console.log('Sign in successful:', user.uid);
                } catch (signInErr) {
                    console.error('Sign in failed! Password might be wrong or account disabled:', signInErr.code);
                    return;
                }
            } else {
                throw err;
            }
        }

        if (user) {
            console.log('Setting admin permissions in Firestore...');
            await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                role: 'super_admin',
                updatedAt: new Date()
            }, { merge: true });
            console.log('Admin permissions set successfully.');
        }
    } catch (err) {
        console.error('Error during setup:', err);
    }
    process.exit(0);
}

verifyAdmin();
