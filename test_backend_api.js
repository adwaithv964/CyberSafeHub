import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Client Config
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

async function testBackend() {
    try {
        console.log("Signing in...");
        // This relies on the verify_admin_client.js created earlier having setup the admin
        const result = await signInWithEmailAndPassword(auth, "admin@cybersafehub.com", "admin123");
        console.log("Signed in successfully. Getting token...");
        const token = await result.user.getIdToken();
        console.log("Token retrieved. Sending to backend...");

        const response = await axios.get('http://localhost:3001/api/admin/verify', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Backend response:", response.data);
    } catch (e) {
        if (e.response) {
            console.error("Backend Error Response:", e.response.status, e.response.data);
        } else {
            console.error("Client Error:", e);
        }
    }
}

testBackend();
