const express = require('express');
const cors = require('cors');
const multer = require('multer');
const NodeClam = require('clamscan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const VaultItem = require('./models/VaultItem');
require('dotenv').config({ path: '../.env' }); // Load from root .env if running from server dir

const app = express();
const port = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json()); // Enable JSON body parsing for Vault API

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize ClamScan config
const clamscanConfig = {
    removeInfected: true,
    quarantineInfected: false,
    debugMode: true,
    scanRecursively: true,
    clamscan: {
        path: path.join(__dirname, 'clamav', 'clamscan.exe'),
        db: path.join(__dirname, 'clamav', 'database'),
        scanArchives: true,
        active: true
    },
    clamdscan: {
        active: false,
    },
    preference: 'clamscan'
};

// Global instance
let clamscan = null;

// Initialize once
new NodeClam().init(clamscanConfig).then(instance => {
    clamscan = instance;
    console.log("ClamAV Initialized successfully.");
}).catch(err => {
    console.error("Failed to initialize ClamAV:", err);
});

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.error('Hint: Check your MongoDB Atlas Network Access settings. Ensure your current IP is whitelisted.');
        }
    }
};

connectDB();

// --- Vault API Routes ---

// Get all items for a user
app.get('/api/vault/:userId', async (req, res) => {
    try {
        const items = await VaultItem.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        // In a real app, decrypt data here before sending
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new item
app.post('/api/vault', async (req, res) => {
    try {
        const { userId, type, name, data } = req.body;
        // In a real app, encrypt 'data' here before saving
        const newItem = new VaultItem({ userId, type, name, data });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an item
app.put('/api/vault/:id', async (req, res) => {
    try {
        const { name, data } = req.body;
        const updatedItem = await VaultItem.findByIdAndUpdate(
            req.params.id,
            { name, data, updatedAt: Date.now() },
            { new: true }
        );
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an item
app.delete('/api/vault/:id', async (req, res) => {
    try {
        await VaultItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to scan file
app.post('/scan', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!clamscan) {
        return res.status(500).json({ error: 'Scanner not ready yet. Please wait.' });
    }

    // Use absolute path for the file to ensure ClamAV can find it
    const filePath = path.resolve(req.file.path);

    try {
        const { isInfected, viruses } = await clamscan.scanFile(filePath);

        // Cleanup: Delete the uploaded file after scan
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        if (isInfected) {
            return res.json({
                status: 'infected',
                viruses: viruses,
                message: "Malware detected!"
            });
        } else {
            return res.json({
                status: 'clean',
                message: "File appears clean."
            });
        }

    } catch (err) {
        console.error("ClamAV Scan Error:", err);
        // Attempt cleanup even on error
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file during error cleanup:", unlinkErr);
        });

        return res.status(500).json({
            error: 'Scan failed. Ensure ClamAV is installed and configured.',
            details: err.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('CyberSafeHub ClamAV Scanner Server is Running.');
});

app.listen(port, () => {
    console.log(`Scanner server listening on port ${port}`);
    console.log(`Make sure ClamAV is installed on this system!`);
});
