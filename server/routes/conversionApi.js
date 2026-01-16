const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const { validateConversion, FORMATS, TIERS, CATEGORIES } = require('../config/conversionMatrix');
// Worker stub - will be implemented in next step
const conversionWorker = require('../services/conversionWorker');

// Upload Config
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `source-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// --- Endpoints ---

// 1. Get Config (Legacy & New)
router.get('/config', (req, res) => {
    res.json({ formats: FORMATS, tiers: TIERS, categories: CATEGORIES });
});

// 2. Detect Format & Get Targets
router.post('/detect', upload.single('file'), async (req, res) => {
    // In a real scenario, use 'file-type' or 'mmmagic' to detect by magic numbers.
    // For now, trust extension but strictly mapping to our matrix.
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Cleanup immediately as this is just detection
    // fs.unlinkSync(req.file.path); 
    // ACTUALLY: Frontend usually asks for targets BEFORE upload. 
    // So this endpoint might be "Upload for inspection". 
    // Re-reading requirements: "format-detection" valid-targets

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const format = FORMATS[ext];

    fs.unlinkSync(req.file.path); // Cleanup detection upload

    if (!format) return res.status(400).json({ error: 'Unsupported format' });

    res.json({
        format: ext,
        details: format
    });
});

// 3. Get Valid Targets (Query)
router.get('/targets', (req, res) => {
    const { source } = req.query;
    if (!source || !FORMATS[source]) return res.status(400).json({ error: 'Invalid source format' });

    const srcFormat = FORMATS[source];
    const validTargets = [];

    // Replicate validateConversion logic or cycle through all
    Object.keys(FORMATS).forEach(target => {
        if (target === source) return;
        const result = validateConversion(source, target);
        if (result.allowed) {
            validTargets.push({ format: target, warning: result.warning });
        }
    });

    res.json(validTargets);
});

// 4. Create Job (The Big One)
router.post('/job', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const targetFormat = req.body.format;
        const confirm = req.body.confirm === 'true';

        // Validate
        const sourceExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();
        console.log(`[DEBUG] Converting: ${sourceExt} -> ${targetFormat}`);
        const validation = validateConversion(sourceExt, targetFormat);
        console.log(`[DEBUG] Validation Result:`, validation);

        if (!validation.allowed) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Conversion blocked', reason: validation.reason });
        }

        if (validation.warning && !confirm) {
            fs.unlinkSync(req.file.path);
            return res.status(409).json({ error: 'Confirmation required', warning: validation.warning });
        }

        // Create Job
        const job = new Job({
            sourceFile: {
                path: req.file.path,
                originalName: req.file.originalname,
                size: req.file.size,
                mime: req.file.mimetype
            },
            targetFormat: targetFormat.toLowerCase(),
            status: 'queued',
            options: {
                preserveMetadata: true, // Default strict
                quality: 'lossless'
            }
        });

        await job.save();

        // Trigger Worker (Async)
        conversionWorker.processJob(job.id).catch(err => console.error("Worker Trigger Error:", err));

        res.status(201).json({
            jobId: job.id,
            status: 'queued',
            message: 'Job created successfully'
        });

    } catch (err) {
        console.error("Job Creation Error:", err);
        console.error(err.stack); // Log full stack trace
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ error: 'Failed to create job', details: err.message });
    }
});

// 5. Check Job Status
router.get('/job/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        res.json({
            id: job.id,
            status: job.status,
            progress: job.progress,
            result: job.result ? { filename: job.result.filename, size: job.result.size } : null,
            error: job.error,
            createdAt: job.createdAt
        });
    } catch (err) {
        res.status(500).json({ error: 'Status check failed' });
    }
});

// 6. Download Result
router.get('/download/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.status !== 'completed' || !job.result.path) {
            return res.status(404).json({ error: 'File not available' });
        }

        res.download(job.result.path, job.result.filename);
    } catch (err) {
        res.status(500).json({ error: 'Download failed' });
    }
});

module.exports = router;
