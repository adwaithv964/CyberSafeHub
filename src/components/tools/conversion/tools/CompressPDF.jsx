import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function CompressPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [compressionLevel, setCompressionLevel] = useState('medium');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setOriginalSize(files[0].size);
            setError('');
            setSuccess(false);
            setCompressedSize(0);
        }
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Client-side compression is limited. We can:
            // 1. Remove optional content / metadata
            // 2. Clear AcroForm fields
            // 3. Re-save (sometimes pdf-lib optimizes the structure)

            // Note: Actual image re-encoding is very heavy for browser and complex with pdf-lib.
            // This implementation focuses on structural optimization.

            // Remove metadata
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');

            const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); // Sometimes false is smaller for simple docs, true for complex.

            // Simple logic to simulate "levels" - often minimal client side difference without image re-encoding
            // But we can try to re-save with object streams for 'high' compression
            let finalBytes = pdfBytes;
            if (compressionLevel === 'high') {
                finalBytes = await pdfDoc.save({ useObjectStreams: true });
            }

            const blob = new Blob([finalBytes], { type: 'application/pdf' });
            setCompressedSize(blob.size);

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `compressed_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to compress PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ToolLayout
            title="Compress PDF"
            description="Reduce file size while optimizing for maximal PDF quality."
            icon="minimize"
            color="text-green-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF file"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        Original: {formatBytes(originalSize)}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text-primary">Compression Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['low', 'medium', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setCompressionLevel(level)}
                                        className={`p-3 rounded-lg border capitalized transition-all text-sm font-medium
                                            ${compressionLevel === level
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-glass-panel border-glass-border text-text-secondary hover:border-green-500/50'}`}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-text-secondary">
                                Note: Client-side compression mainly optimizes document structure and metadata. For significant image compression, server-side tools are typically required.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && !error && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <Icon name="checkCircle" className="w-5 h-5" />
                                    Compressed Successfully!
                                </div>
                                <div className="text-xs opacity-80">
                                    {formatBytes(originalSize)} → {formatBytes(compressedSize)}
                                    ({Math.round(((originalSize - compressedSize) / originalSize) * 100)}% reduction)
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleCompress}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Optimizing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="minimize" className="w-5 h-5" />
                                        Compress PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
