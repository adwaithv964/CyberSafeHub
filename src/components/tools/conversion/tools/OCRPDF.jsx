import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
// Standard workers are tricky in bundling. We'll use CDN for worker if possible or dynamic import.
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function OCRPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setExtractedText('');
            setProgress(0);
            setStatus('');
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');
        setExtractedText('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const pageCount = pdf.numPages;

            let fullText = '';

            for (let i = 1; i <= pageCount; i++) {
                setStatus(`Processing page ${i} of ${pageCount}...`);

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

                // Recognize text
                const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                });

                fullText += `--- Page ${i} ---\n${text}\n\n`;
            }

            setExtractedText(fullText);
            setStatus('Completed!');

        } catch (err) {
            console.error(err);
            setError('Failed to perform OCR. Browser memory might be insufficient for large files.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ocr_result_${file.name}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout
            title="OCR PDF"
            description="Extract text from scanned PDF documents using Client-Side AI."
            icon="scan"
            color="text-indigo-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF for OCR"
                    />
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {!extractedText && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleOCR}
                                    disabled={isProcessing}
                                    className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Icon name="loader" className="w-5 h-5 animate-spin" />
                                            {status || 'Scanning...'} ({progress}%)
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="scan" className="w-5 h-5" />
                                            Start OCR Scan
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {extractedText && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-glass-panel border border-glass-border p-4 rounded-t-xl">
                                    <h3 className="font-semibold text-text-primary">Extracted Text</h3>
                                    <button
                                        onClick={handleDownload}
                                        className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-lg hover:bg-accent/30 transition-colors"
                                    >
                                        Download .txt
                                    </button>
                                </div>
                                <textarea
                                    readOnly
                                    value={extractedText}
                                    className="w-full h-96 bg-glass-panel-dark text-text-primary p-4 rounded-b-xl border border-t-0 border-glass-border font-mono text-sm focus:outline-none resize-y"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
