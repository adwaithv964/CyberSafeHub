const admin = require('firebase-admin');
const path = require('path');
// Load .env from the project root regardless of where `node` is invoked from
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Check if credentials are provided via environment variables
let serviceAccount;

try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Normalize the private key to handle various formats from hosting platforms:
        // 1. Strip surrounding double-quotes (Render sometimes wraps the value in quotes)
        // 2. Replace literal \n sequences with actual newlines
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        // Strip surrounding double-quotes if present (e.g. Render dashboard adds them)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }

        // Replace both \\n (double-escaped) and \n (single-escaped) with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');

        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        };

        console.log("Firebase Private Key loaded, starts with:", privateKey.substring(0, 27));
    }
} catch (e) {
    console.error("Error parsing Firebase credentials from env:", e);
}

if (!admin.apps.length) {
    try {
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized with Environment Config");
        } else {
            console.error("CRITICAL: Missing Firebase credentials in environment variables.");
            console.error("Check Render dashboard and ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
            // Fallback: This expects GOOGLE_APPLICATION_CREDENTIALS env var or standard path
            admin.initializeApp();
            console.log("Firebase Admin Initialized with Default Credentials");
        }
    } catch (error) {
        console.error("Firebase Admin Initialization Failed:", error.message);
    }
}

module.exports = admin;
