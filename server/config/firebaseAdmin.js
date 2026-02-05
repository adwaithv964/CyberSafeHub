const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

// Check if credentials are provided via environment variables
let serviceAccount;

try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace \n with actual newlines if stored as a single string
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
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
            // Fallback: This expects GOOGLE_APPLICATION_CREDENTIALS env var or standard path
            admin.initializeApp();
            console.log("Firebase Admin Initialized with Default Credentials");
        }
    } catch (error) {
        console.error("Firebase Admin Initialization Failed:", error.message);
    }
}

module.exports = admin;
