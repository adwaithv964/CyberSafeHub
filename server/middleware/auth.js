const admin = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // If admin SDK failed to init (e.g. bad/missing credentials), return 500
        if (!admin.apps.length) {
            console.error("AUTH MIDDLEWARE: Firebase Admin SDK is NOT initialized. Check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID env vars on Render.");
            return res.status(500).json({ error: 'Server Auth Configuration Error' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.code || error.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
