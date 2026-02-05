const admin = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // If admin SDK failed to init (e.g. missing credentials), deny all
        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Server Auth Configuration Error' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
