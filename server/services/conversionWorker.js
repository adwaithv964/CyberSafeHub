const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const sharp = require('sharp');
const libre = require('libreoffice-convert');
libre.convertAsync = promisify(libre.convert);

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Result Directory
const outputDir = path.join(__dirname, '../uploads/converted');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

class ConversionWorker {

    async processJob(jobId) {
        let job = await Job.findById(jobId);
        if (!job) return;

        try {
            // 1. Update Status -> Processing
            job.status = 'processing';
            job.progress = 10;
            await job.save();

            const inputPath = job.sourceFile.path;
            const outputFilename = `converted-${jobId}-${Date.now()}.${job.targetFormat}`;
            const outputPath = path.join(outputDir, outputFilename);

            // 2. Select Engine based on detected category
            // We need to look up the Category from our Matrix based on input/output
            // Ideally we'd store category in Job, but for now we look it up.
            // Simplified dispatch:

            const videoFormats = ['mp4', 'mkv', 'mov', 'webm', 'avi', 'flv', 'wmv'];
            const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'aiff'];
            const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
            const docFormats = ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'md'];

            const target = job.targetFormat.toLowerCase();
            const sourceExt = path.extname(job.sourceFile.path).replace('.', '').toLowerCase();

            // Special Case: Image -> PDF (Use Sharp for simpler local support, or PDFKit)
            // LibreOffice can do it too, but Sharp is lightweight for single images.
            if (target === 'pdf' && imageFormats.includes(sourceExt)) {
                await this.runSharp(inputPath, outputPath, 'pdf');
            }
            else if (videoFormats.includes(target) || audioFormats.includes(target)) {
                await this.runFfmpeg(inputPath, outputPath, target, (p) => this.updateProgress(job, p));
            }
            else if (imageFormats.includes(target)) {
                await this.runSharp(inputPath, outputPath, target);
            }
            else if (docFormats.includes(target)) {
                await this.runLibreOffice(inputPath, outputPath, target);
            }
            else {
                throw new Error(`No engine found for target format: ${target}`);
            }

            // 3. Success
            const stats = fs.statSync(outputPath);
            job.status = 'completed';
            job.progress = 100;
            job.result = {
                path: outputPath,
                filename: outputFilename,
                size: stats.size,
                mime: this.getMimeType(target)
            };
            await job.save();

        } catch (err) {
            console.error(`Job ${jobId} Failed:`, err);
            job.status = 'failed';
            job.error = {
                message: err.message || 'Conversion failed',
                code: 'WORKER_ERROR'
            };
            await job.save();
        }
    }

    async updateProgress(job, percent) {
        if (percent > job.progress + 5) {
            job.progress = Math.min(percent, 99);
            await job.save().catch(e => console.error(e));
        }
    }

    // --- ENGINES ---

    async runFfmpeg(input, output, format, onProgress) {
        return new Promise((resolve, reject) => {
            const cmd = ffmpeg(input);
            cmd.output(output);

            // Quality Presets
            if (['mp3', 'aac', 'm4a'].includes(format)) cmd.audioBitrate('320k');

            cmd.on('progress', (p) => {
                if (p.percent) onProgress(Math.floor(p.percent));
            });
            cmd.on('end', resolve);
            cmd.on('error', reject);
            cmd.run();
        });
    }

    async runSharp(input, output, format) {
        const pipeline = sharp(input);

        // Quality Presets
        if (format === 'jpg' || format === 'jpeg') {
            pipeline.jpeg({ quality: 100, mozjpeg: true });
        } else if (format === 'png') {
            pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
        } else if (format === 'webp') {
            pipeline.webp({ quality: 100, lossless: true }); // Prefer lossless if possible or high quality
        } else if (format === 'pdf') {
            // Sharp doesn't allow direct .toFile('x.pdf') without .toFormat('pdf')
            // It wraps image in a PDF page.
            // Note: Use 'file' input if possible for meta preservation
            pipeline.toFormat('pdf');
        }

        await pipeline.toFile(output);
    }

    async runLibreOffice(input, output, format) {
        // LibreOffice Convert
        // Note: This requires 'libreoffice' installed on the system (e.g. apt-get install libreoffice)
        // It will fail on standard Render instances without Docker.
        const inputBuffer = fs.readFileSync(input);
        // format needs to be 'pdf', 'docx' etc.
        // libreoffice-convert expects .ext

        // Map common extensions if needed, but usually works directly
        const outputBuffer = await libre.convertAsync(inputBuffer, `.${format}`, undefined);
        fs.writeFileSync(output, outputBuffer);
    }

    getMimeType(ext) {
        const mimes = {
            'mp4': 'video/mp4', 'mkv': 'video/x-matroska', 'mov': 'video/quicktime',
            'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac',
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp',
            'pdf': 'application/pdf', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        return mimes[ext] || 'application/octet-stream';
    }
}

module.exports = new ConversionWorker();
