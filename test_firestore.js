import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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

async function testFirestore() {
    const email = 'admin@cybersafehub.com';
    const password = 'admin123';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Signed in as:', user.uid);

        console.log('Attempting to read admin doc...');
        const adminRef = doc(db, 'admins', user.uid);
        const docSnap = await getDoc(adminRef);
        if (docSnap.exists()) {
            console.log('Admin document data:', docSnap.data());
        } else {
            console.log('No such document!');
            console.log('Attempting to create it without merge...');
            await setDoc(adminRef, {
                email: user.email,
                role: 'super_admin'
            });
            console.log('Created admin document successfully.');
        }
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

testFirestore();
