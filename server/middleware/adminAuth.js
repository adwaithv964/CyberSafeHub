const admin = require('../config/firebaseAdmin');
const Admin = require('../models/Admin');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // If admin SDK failed to init (e.g. missing credentials), deny all
        if (!admin.apps.length) {
            console.error('[adminAuth] Firebase Admin SDK not initialized — check FIREBASE_PRIVATE_KEY & FIREBASE_CLIENT_EMAIL in .env');
            return res.status(503).json({ error: 'Server Auth Configuration Error: Firebase Admin not initialized.' });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Look up admin role from MongoDB — attach to req for requireRole middleware
        const adminDoc = await Admin.findOne({ email: decodedToken.email }).lean();
        if (!adminDoc) {
            return res.status(403).json({ error: 'Unauthorized: No admin privileges found for this account.' });
        }

        req.adminRole = adminDoc.role; // e.g. 'super_admin', 'analyst', 'content_manager', 'support'
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid token', details: error.message });
    }
};

module.exports = adminAuthMiddleware;
