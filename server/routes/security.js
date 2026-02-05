const express = require('express');
const router = express.Router();
const axios = require('axios');
const rateLimit = require('express-rate-limit');

// Rate limiting for security routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

const verifyToken = require('../middleware/auth');

router.use(apiLimiter);
router.use(verifyToken);


// Gemini API Proxy
router.post('/gemini', async (req, res) => {
    try {
        const { contents, systemInstruction } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const model = "gemini-2.5-flash"; // Or make this configurable
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Construct payload
        const payload = { contents };
        if (systemInstruction) {
            payload.systemInstruction = systemInstruction;
        }

        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Gemini API Proxy Error:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || error.message;
        res.status(status).json({ error: message });
    }
});

// Google Safe Browsing API Proxy
router.post('/safebrowsing', async (req, res) => {
    try {
        const { threatInfo } = req.body; // Expecting the threatInfo part of the body
        const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

        if (!apiKey) {
            console.error("GOOGLE_SAFE_BROWSING_API_KEY is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

        const requestBody = {
            client: {
                clientId: "cyber-safe-hub",
                clientVersion: "1.0.0"
            },
            threatInfo: threatInfo
        };

        console.log("Safe Browsing Payload:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiUrl, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Safe Browsing API Proxy Error:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        // Send more details to the client for debugging
        res.status(status).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

module.exports = router;
