const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const sharp = require('sharp');
const libre = require('libreoffice-convert');
libre.convertAsync = promisify(libre.convert);
const heicConvert = require('heic-convert');
const PDFDocument = require('pdfkit');

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Output Directory
const outputDir = path.join(__dirname, '../uploads/converted');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// --- Windows LibreOffice Path Fix ---
if (process.platform === 'win32') {
    const commonPaths = [
        'C:\\Program Files\\LibreOffice\\program',
        'C:\\Program Files (x86)\\LibreOffice\\program'
    ];
    const currentPath = process.env.PATH || '';
    const additionalPaths = commonPaths.filter(p => fs.existsSync(p) && !currentPath.includes(p));
    if (additionalPaths.length > 0) {
        process.env.PATH = `${currentPath};${additionalPaths.join(';')}`;
        console.log('Augmented PATH with LibreOffice:', additionalPaths);
    }
}

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
            const docFormats = ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'md', 'pptx', 'ppt', 'xlsx', 'xls', 'csv'];

            const target = job.targetFormat.toLowerCase();
            const sourceExt = path.extname(job.sourceFile.path).replace('.', '').toLowerCase();

            // Special Case: Image -> PDF (Use PDFKit for pure JS stability)
            if (target === 'pdf' && (imageFormats.includes(sourceExt) || sourceExt === 'heic')) {
                await this.runPdfKit(inputPath, outputPath, sourceExt);
            }
            // HEIC -> Image (Use heic-convert)
            else if (sourceExt === 'heic' && imageFormats.includes(target)) {
                await this.runHeicConvert(inputPath, outputPath, target);
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

    async runHeicConvert(input, output, format) {
        const inputBuffer = fs.readFileSync(input);
        const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: (format === 'png') ? 'PNG' : 'JPEG',
            quality: 1
        });
        fs.writeFileSync(output, outputBuffer);
    }

    async runPdfKit(input, output, sourceExt) {
        return new Promise(async (resolve, reject) => {
            let imageToEmbed = input;
            let tempFile = null;

            try {
                // If HEIC, convert to JPG first using heic-convert
                if (sourceExt === 'heic') {
                    tempFile = path.join(path.dirname(output), `tmp-${Date.now()}.jpg`);

                    const inputBuffer = fs.readFileSync(input);
                    const outputBuffer = await heicConvert({
                        buffer: inputBuffer,
                        format: 'JPEG',
                        quality: 0.9
                    });
                    fs.writeFileSync(tempFile, outputBuffer);

                    imageToEmbed = tempFile;
                }

                const doc = new PDFDocument({ autoFirstPage: false });
                const stream = fs.createWriteStream(output);

                doc.pipe(stream);

                // Load image to get dimensions
                const img = doc.openImage(imageToEmbed);
                doc.addPage({ size: [img.width, img.height] });
                doc.image(img, 0, 0);

                doc.end();

                stream.on('finish', () => {
                    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    resolve();
                });
                stream.on('error', (err) => {
                    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    reject(err);
                });
            } catch (err) {
                if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                reject(err);
            }
        });
    }

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
        }

        await pipeline.toFile(output);
    }

    async runLibreOffice(input, output, format) {
        // Special Handling for PDF to Office
        if (path.extname(input).toLowerCase() === '.pdf') {
            // PDF -> Word (Use specific import filter to open in Writer)
            if (['docx', 'doc', 'odt'].includes(format)) {
                return this.runLibreOfficeDirect(input, output, format, 'writer_pdf_import');
            }

            // PDF -> PPT/PPTX (Direct with specific filter)
            // We force LibreOffice to open PDF in Impress (Presentation mode) instead of Draw
            if (['pptx', 'ppt'].includes(format)) {
                return this.runLibreOfficeDirect(input, output, format, 'impress_pdf_import');
            }

            // PDF -> Excel (Chain via HTML: PDF -> HTML -> Excel)
            if (['xlsx', 'xls', 'csv'].includes(format)) {
                const tempHtml = path.join(path.dirname(output), `intermediate-${Date.now()}.html`);
                try {
                    console.log(`[Worker] Chaining Conversion: PDF -> HTML -> ${format}`);
                    // Step 1: PDF -> HTML (using Writer import)
                    await this.runLibreOfficeDirect(input, tempHtml, 'html', 'writer_pdf_import');

                    // Step 2: HTML -> Excel (Force Calc)
                    await this.runLibreOfficeDirect(tempHtml, output, format, 'HTML (StarCalc)');

                    // Cleanup
                    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
                    return;
                } catch (err) {
                    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
                    throw err;
                }
            }
        }

        // Standard LibreOffice Convert via Library (or fallback)
        try {
            const inputBuffer = fs.readFileSync(input);
            const outputBuffer = await libre.convertAsync(inputBuffer, `.${format}`, undefined);
            fs.writeFileSync(output, outputBuffer);
        } catch (err) {
            console.error("LibreOffice Lib Error:", err.message);
            console.log("Falling back to direct soffice spawn...");
            return this.runLibreOfficeDirect(input, output, format);
        }
    }

    async runLibreOfficeDirect(input, output, format, inFilter) {
        return new Promise((resolve, reject) => {
            const outDir = path.dirname(output);
            const args = ['--headless', '--convert-to', format];
            if (inFilter) args.push(`--infilter=${inFilter}`);
            args.push('--outdir', outDir);
            args.push(input);

            console.log(`[Worker] Spawning: soffice ${args.join(' ')}`);

            const proc = spawn('soffice', args);

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (d) => stdout += d.toString());
            proc.stderr.on('data', (d) => stderr += d.toString());

            proc.on('close', (code) => {
                if (code !== 0) {
                    // Check for common errors
                    if (stderr.toLowerCase().includes('not found') || stdout.toLowerCase().includes('not found')) {
                        return reject(new Error("LibreOffice binary not found. Please install it."));
                    }
                    return reject(new Error(`LibreOffice exited with code ${code}: ${stderr || stdout}`));
                }

                // Rename the result to expected output filename
                // LibreOffice saves as <source_basename>.<format>
                const sourceName = path.basename(input, path.extname(input));
                const expectedName = `${sourceName}.${format}`;
                const generatedPath = path.join(outDir, expectedName);

                if (fs.existsSync(generatedPath)) {
                    // Rename to request output path
                    try {
                        // If output paths are different, rename. 
                        // In our logic: 
                        // input: source-123.pdf -> generated: source-123.docx
                        // target: converted-timestamp.docx
                        fs.renameSync(generatedPath, output);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error("Conversion reportedly succeeded but output file is missing."));
                }
            });

            proc.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    reject(new Error("LibreOffice binary ('soffice') not found in PATH."));
                } else {
                    reject(err);
                }
            });
        });
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
