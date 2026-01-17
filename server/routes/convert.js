const multiline = require('multer'); // existing
const sharp = require('sharp');
const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const archiver = require('archiver');
const PDFDocument = require('pdfkit');
const { validateConversion, FORMATS, TIERS, CATEGORIES } = require('../config/conversionMatrix');

// Set ffmpeg path
console.log('FFmpeg Path configured as:', ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);


const libConvert = promisify(libre.convert);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, 'upload-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB Limit
});

// Helper for cleanup
const cleanFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
        console.error('Cleanup error:', e);
    }
};

// Helper to send file and cleanup
const sendFile = (res, outputPath, inputPath) => {
    res.download(outputPath, (err) => {
        if (err && !res.headersSent) {
            console.error("Download Error:", err);
            // If headers weren't sent, we can try to send an error. 
            // Often if download fails mid-stream, it's too late.
        }
        cleanFile(inputPath);
        cleanFile(outputPath);
    });
};

// --- Config Endpoint ---
router.get('/config', (req, res) => {
    res.json({
        formats: FORMATS,
        tiers: TIERS,
        categories: CATEGORIES
    });
});

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    let targetFormat = req.body.format ? req.body.format.toLowerCase() : null;
    const confirm = req.body.confirm === 'true'; // Explicit confirmation for warnings

    // Detect Source Format from extension
    const sourceExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();

    // --- 0. Pre-Validation ---
    if (!targetFormat) {
        cleanFile(inputPath);
        return res.status(400).json({ error: 'Target format not specified' });
    }

    // --- 1. Matrix Validation ---
    const validation = validateConversion(sourceExt, targetFormat);

    if (!validation.allowed) {
        cleanFile(inputPath);
        return res.status(400).json({
            error: 'Conversion Blocked',
            reason: validation.reason,
            code: 'BLOCKED_CONVERSION'
        });
    }

    if (validation.warning && !confirm) {
        cleanFile(inputPath);
        return res.status(409).json({
            error: 'Confirmation Required',
            warning: validation.warning,
            requiresConfirm: true,
            code: 'WARNING_CONFIRMATION_NEEDED'
        });
    }

    const outputFilename = `converted-${Date.now()}.${targetFormat}`;
    const outputPath = path.join(uploadDir, outputFilename);

    try {
        console.log(`Starting Validated Conversion: ${sourceExt} -> ${targetFormat}`);

        // --- 2. Conversion Execution ---

        // 2a. SPECIAL: HEIC -> Image (FFmpeg)
        // Sharp failed due to missing codecs, so we use FFmpeg for HEIC decoding.
        if (sourceExt === 'heic' && ['jpg', 'jpeg', 'png', 'webp'].includes(targetFormat)) {
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .toFormat(targetFormat === 'jpg' ? 'jpeg' : targetFormat) // ffmpeg uses 'jpeg' muxer
                    .on('end', resolve)
                    .on('error', (err) => reject(new Error('FFmpeg HEIC error: ' + err.message)))
                    .save(outputPath);
            });
            return sendFile(res, outputPath, inputPath);
        }

        // 2b. SPECIAL: Image -> PDF (PDFKit)
        // Avoids using LibreOffice for simple image embedding
        if (targetFormat === 'pdf' && FORMATS[sourceExt]?.category === CATEGORIES.IMAGE) {
            const doc = new PDFDocument({ autoFirstPage: false });
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            let imagePathToEmbed = inputPath;
            let tempJpgPath = null;

            try {
                // Pre-convert HEIC to JPG if needed
                if (sourceExt === 'heic') {
                    tempJpgPath = path.join(uploadDir, `temp-${Date.now()}.jpg`);
                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .toFormat('mjpeg') // Force MJPEG for simple image extraction
                            .outputOptions('-vframes 1')
                            .on('end', resolve)
                            .on('error', (err) => reject(new Error('FFmpeg HEIC conversion error: ' + err.message)))
                            .save(tempJpgPath);
                    });
                    imagePathToEmbed = tempJpgPath;
                }

                // Embed image
                // doc.openImage is available in newer pdfkit versions (>=0.12)
                const img = doc.openImage(imagePathToEmbed);
                doc.addPage({ size: [img.width, img.height] });
                doc.image(img, 0, 0);
                doc.end();

                await new Promise((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                if (tempJpgPath) cleanFile(tempJpgPath);
                return sendFile(res, outputPath, inputPath);

            } catch (e) {
                if (tempJpgPath) cleanFile(tempJpgPath);
                throw e;
            }
        }

        // 2a. Audio/Video (FFmpeg)
        const avFormats = ['mp3', 'mp4', 'wav', 'avi', 'mov', 'flv', 'webm', 'ogg', 'mkv', 'wmv', 'm4a', 'aac', 'wma', 'gif'];
        // Check if either source OR target is AV (e.g. Extract Audio from Video)
        const isSourceAV = FORMATS[sourceExt]?.category === CATEGORIES.VIDEO || FORMATS[sourceExt]?.category === CATEGORIES.AUDIO;
        const isTargetAV = avFormats.includes(targetFormat);

        if (isSourceAV || isTargetAV) {
            // FFmpeg Logic
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .toFormat(targetFormat)
                    .on('end', resolve)
                    .on('error', (err) => reject(new Error('FFmpeg error: ' + err.message)))
                    .save(outputPath);
            });
            return sendFile(res, outputPath, inputPath);
        }

        // 2b. Archive Creation (Archiver)
        if (['zip', 'tar', '7z', 'rar'].includes(targetFormat)) {
            // Only ZIP/TAR supported for creation by archiver usually
            if (!['zip', 'tar'].includes(targetFormat)) {
                throw new Error("Only ZIP and TAR archives can be created currently.");
            }

            const output = fs.createWriteStream(outputPath);
            const archive = archiver(targetFormat, { zlib: { level: 9 } });

            output.on('close', function () {
                sendFile(res, outputPath, inputPath);
            });

            archive.on('error', function (err) {
                throw err;
            });

            archive.pipe(output);
            archive.file(inputPath, { name: req.file.originalname });
            await archive.finalize();
            return;
        }

        // 2c. Image Conversion (Sharp)
        // Removed 'heic' from here as it is handled by FFmpeg above
        const sharpFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'tiff', 'tif', 'svg'];
        if (sharpFormats.includes(targetFormat)) {
            const sharpInput = sharp(inputPath, { density: 300, animated: true });

            // Handle JPEG quality if target is lossy
            if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
                sharpInput.jpeg({ quality: 90 });
            }

            await sharpInput
                .toFormat(targetFormat === 'jpg' ? 'jpeg' : targetFormat)
                .toFile(outputPath);

            return sendFile(res, outputPath, inputPath);
        }

        // 2d. Documents (LibreOffice)
        if (targetFormat === 'pdf' || ['docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'epub'].includes(targetFormat)) {
            const inputBuffer = fs.readFileSync(inputPath);
            const buffer = await libConvert(inputBuffer, `.${targetFormat}`, undefined);
            fs.writeFileSync(outputPath, buffer);
            return sendFile(res, outputPath, inputPath);
        }

        throw new Error(`Execution pipeline for ${sourceExt} to ${targetFormat} not found.`);

    } catch (err) {
        console.error('SERVER CONVERSION ERROR:', err);
        cleanFile(inputPath);
        cleanFile(outputPath);

        let statusCode = 500;
        let errorMsg = 'Conversion failed';

        if (err.message && err.message.includes('LibreOffice')) {
            statusCode = 503;
            errorMsg = 'LibreOffice service unavailable';
        }

        return res.status(statusCode).json({
            error: errorMsg,
            details: err.message
        });
    }
});

module.exports = router;
