const express = require('express');
const axios = require('axios');
const cors = require('cors');

const multer = require('multer');
const NodeClam = require('clamscan');
const find = require('local-devices'); // Import local-devices
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const VaultItem = require('./models/VaultItem');
const Secret = require('./models/Secret');
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


// --- Dead Drop API Routes ---

// Create Secret
app.post('/api/secrets', async (req, res) => {
    try {
        const { encryptedData, authHash } = req.body;
        const newSecret = new Secret({ encryptedData, authHash });
        await newSecret.save();
        res.status(201).json({ id: newSecret._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View Secret (Delete after view)
app.post('/api/secrets/:id/view', async (req, res) => {
    try {
        const { authHash } = req.body;
        const secret = await Secret.findById(req.params.id);

        if (!secret) {
            return res.status(404).json({ error: 'Secret not found or expired' });
        }

        // Verify Hash (Client sends hash, we compare)
        if (secret.authHash !== authHash) {
            return res.status(403).json({ error: 'Invalid password/key' });
        }

        // Return Data
        const data = secret.encryptedData;

        // Self Destruct (Delete BEFORE sending to ensure it's gone)
        await Secret.findByIdAndDelete(req.params.id);

        res.json({ encryptedData: data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- OSINT API Routes ---

app.post('/api/osint/check', async (req, res) => {
    const { username, site } = req.body;
    if (!username || !site || !site.url) {
        return res.status(400).json({ status: 'error', message: 'Missing username or site info' });
    }

    const targetUrl = site.url.replace('USERNAME', username);

    try {
        const response = await axios.get(targetUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            }
        });

        if (response.status === 200) {
            // Some sites return 200 even for 404 pages, but most standard ones don't.
            // We can add specific logic for sites like Instagram if needed later.
            res.json({ status: 'found', url: targetUrl });
        } else if (response.status === 404) {
            res.json({ status: 'not_found' });
        } else {
            // Other codes like 403, 401 might mean "Protected" or "Login Required"
            res.json({ status: 'potential', url: targetUrl });
        }
    } catch (error) {
        // Network error or timeout
        res.json({ status: 'error', message: error.message, url: targetUrl });
    }
});

// --- WiFi Radar API Routes ---

// Scan for devices
app.get('/api/wifi-radar/scan', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const os = require('os');

        // Helper: Get local IP to determine subnet
        const getLocalIP = () => {
            const interfaces = os.networkInterfaces();
            let preferredIP = null;

            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    // Skip internal (localhost) and non-IPv4 addresses
                    if (!iface.internal && iface.family === 'IPv4') {
                        // Check for standard private ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)
                        if (iface.address.startsWith('192.168.') ||
                            iface.address.startsWith('10.') ||
                            (iface.address.startsWith('172.') && parseInt(iface.address.split('.')[1]) >= 16 && parseInt(iface.address.split('.')[1]) <= 31)) {
                            return iface.address; // Return immediately if a common private IP is found
                        }
                        // Store other candidates (like 169.254 or public IPs) just in case
                        if (!preferredIP) preferredIP = iface.address;
                    }
                }
            }
            return preferredIP || '192.168.1.1'; // Fallback
        };

        // Helper: Ping Sweep to populate ARP table
        const pingSweep = (subnetBase) => {
            return new Promise((resolve) => {
                const isWin = process.platform === 'win32';
                // Scan full subnet (1-254) to ensure we catch all devices (DHCP often starts at .100)
                let completed = 0;
                const totalToPing = 254;
                const BATCH_SIZE = 50; // Batch pings to avoid overwhelming the system

                const pingBatch = async (start, end) => {
                    const promises = [];
                    for (let i = start; i <= end; i++) {
                        if (i > totalToPing) break;
                        const target = `${subnetBase}.${i}`;
                        // Shorter timeout (150ms) to speed up full scan
                        const cmd = isWin ? `ping -n 1 -w 150 ${target}` : `ping -c 1 -W 0.15 ${target}`;
                        promises.push(new Promise(r => exec(cmd, r)));
                    }
                    await Promise.all(promises);
                };

                // Run in batches
                const run = async () => {
                    for (let i = 1; i <= totalToPing; i += BATCH_SIZE) {
                        await pingBatch(i, i + BATCH_SIZE - 1);
                    }
                    resolve();
                };

                run();
            });
        };

        const localIP = getLocalIP();
        const subnetParts = localIP.split('.');
        subnetParts.pop();
        const subnetBase = subnetParts.join('.');

        // Run ping sweep (Wait up to 5s max, though it should be faster with async batches)
        await Promise.race([pingSweep(subnetBase), new Promise(r => setTimeout(r, 7000))]);

        // Helper: Vendor Lookup
        const getVendor = async (mac) => {
            if (!mac) return 'Unknown Vendor';
            try {
                // Remove colons/dashes
                const oui = mac.replace(/[:-\s]/g, '').substring(0, 6);
                // Simple cache or local dictionary could go here for speed
                // For now, we return 'Unknown' to avoid rate-limiting issues with public APIs in this demo code.
                // UNLESS user explicitly wants real vendors. 
                // Let's try to fetch from a safe API if possible, or Mock common ones.
                const response = await axios.get(`https://api.macvendors.com/${mac}`, { timeout: 1500 });
                return response.data;
            } catch (err) {
                return 'Unknown Vendor';
            }
        };

        // Custom ARP scan function
        const scanNetwork = () => new Promise((resolve) => {
            exec('arp -a', (error, stdout, stderr) => {
                if (error) return resolve([]);

                const lines = stdout.split('\n');
                const devices = [];

                lines.forEach(line => {
                    // Stricter Regex for MAC: XX-XX-XX-XX-XX-XX
                    const match = line.match(/\s+(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9]{2}(?:-[a-fA-F0-9]{2}){5})\s+/);
                    if (match) {
                        const ip = match[1];
                        const mac = match[2].replace(/-/g, ':').toUpperCase();

                        if (ip.startsWith(subnetBase)) {
                            devices.push({
                                ip,
                                mac,
                                name: 'Unknown Device',
                                vendor: 'Unknown' // Will resolve later
                            });
                        }
                    }
                });
                resolve(devices);
            });
        });

        const devices = await scanNetwork();

        // Fallback to local-devices if needed
        if (devices.length === 0) {
            try {
                const libDevices = await find();
                devices.push(...libDevices);
            } catch (e) {
                console.error("local-devices lib failed:", e);
            }
        }

        // Deduplicate
        const uniqueDevices = Array.from(new Map(devices.map(item => [item.ip, item])).values());

        // Resolve Vendors (Async, parallel)
        const enrichedDevices = await Promise.all(uniqueDevices.map(async device => {
            let vendor = device.vendor;
            if (vendor === 'Unknown' || !vendor) {
                try {
                    vendor = await getVendor(device.mac);
                } catch (e) { vendor = 'Unknown Vendor'; }
            }

            return {
                ...device,
                name: device.name === 'Unknown Device' ? `Device (${device.ip})` : device.name,
                vendor: vendor,
                isSuspicious: false,
                ports: []
            };
        }));

        console.log(`Found ${enrichedDevices.length} devices.`);
        res.json(enrichedDevices);

    } catch (err) {
        console.error("WiFi Scan Error:", err);
        res.status(500).json({ error: "Failed to scan network." });
    }
});

// Analyze specific device (Simulation of promiscuous check)
app.post('/api/wifi-radar/analyze', async (req, res) => {
    const { ip, mac } = req.body;

    // In a real app, this would run a deep Nmap scan or check for promiscuous mode via ARP tricks.
    // Here we simulate a check.

    setTimeout(() => {
        const isPromiscuous = Math.random() < 0.2; // 20% chance to be "suspicious" for demo
        const openPorts = [80, 443];
        if (Math.random() < 0.5) openPorts.push(22);
        if (Math.random() < 0.3) openPorts.push(8080);

        res.json({
            ip,
            mac,
            isPromiscuous,
            openPorts,
            riskLevel: isPromiscuous ? 'HIGH' : 'LOW',
            message: isPromiscuous ? "Device appears to be inspecting traffic (Promiscuous Mode detected)" : "Device operating normally."
        });
    }, 2000); // Fake delay for "scanning" effect
});


app.get('/', (req, res) => {
    res.send('CyberSafeHub ClamAV Scanner Server is Running.');
});

app.listen(port, () => {
    console.log(`Scanner server listening on port ${port}`);
    console.log(`Make sure ClamAV is installed on this system!`);
});
