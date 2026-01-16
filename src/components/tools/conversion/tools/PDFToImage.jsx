import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PDFToImage({ onBack }) {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [imageType, setImageType] = useState('jpeg'); // 'jpeg' or 'png'
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setProgress(0);
            setStatus('');
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const pageCount = pdf.numPages;
            const zip = new JSZip();

            for (let i = 1; i <= pageCount; i++) {
                setStatus(`Converting page ${i} of ${pageCount}...`);

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                const blob = await new Promise(resolve => canvas.toBlob(resolve, `image/${imageType}`, 0.9));
                zip.file(`page_${i}.${imageType}`, blob);

                setProgress(Math.round((i / pageCount) * 100));
            }

            setStatus('Zipping files...');
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `converted_images_${file.name}.zip`);

            setStatus('Completed!');

        } catch (err) {
            console.error(err);
            setError('Failed to convert PDF. Browser memory might be insufficient.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF to JPG/PNG"
            description="Convert PDF pages into high-quality images."
            icon="image"
            color="text-pink-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF to convert"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500 font-bold">
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

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-text-secondary">Output Format</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setImageType('jpeg')}
                                    className={`p-4 rounded-xl border text-center transition-all ${imageType === 'jpeg' ? 'bg-pink-500 text-white border-pink-500' : 'bg-glass-panel border-glass-border hover:border-pink-500/50'}`}
                                >
                                    <span className="block font-bold text-lg">JPG</span>
                                    <span className="text-xs opacity-80">Smaller size</span>
                                </button>
                                <button
                                    onClick={() => setImageType('png')}
                                    className={`p-4 rounded-xl border text-center transition-all ${imageType === 'png' ? 'bg-pink-500 text-white border-pink-500' : 'bg-glass-panel border-glass-border hover:border-pink-500/50'}`}
                                >
                                    <span className="block font-bold text-lg">PNG</span>
                                    <span className="text-xs opacity-80">Higher quality</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        {status || 'Converting...'} ({progress}%)
                                    </>
                                ) : (
                                    <>
                                        <Icon name="image" className="w-5 h-5" />
                                        Convert to {imageType.toUpperCase()}
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
