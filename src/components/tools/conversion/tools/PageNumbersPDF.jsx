import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function PageNumbersPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [position, setPosition] = useState('bottom-center');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
        }
    };

    const handleApply = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont('Helvetica');

            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            pages.forEach((page, idx) => {
                const { width, height } = page.getSize();
                const text = `${idx + 1} / ${totalPages}`;
                const size = 12;
                const textWidth = font.widthOfTextAtSize(text, size);

                let x, y;
                const margin = 20;

                switch (position) {
                    case 'bottom-center':
                        x = width / 2 - textWidth / 2;
                        y = margin;
                        break;
                    case 'bottom-right':
                        x = width - textWidth - margin;
                        y = margin;
                        break;
                    case 'top-right':
                        x = width - textWidth - margin;
                        y = height - margin;
                        break;
                    case 'top-center':
                        x = width / 2 - textWidth / 2;
                        y = height - margin;
                        break;
                    default:
                        x = width / 2 - textWidth / 2;
                        y = margin;
                }

                page.drawText(text, {
                    x,
                    y,
                    size,
                    font,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `numbered_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to add page numbers.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Page Numbers"
            description="Add page numbers to your PDF document."
            icon="hash"
            color="text-blue-500"
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
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
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
                            <label className="block text-sm font-medium text-text-secondary">Position</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['bottom-center', 'bottom-right', 'top-center', 'top-right'].map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setPosition(pos)}
                                        className={`p-3 rounded-lg border capitalized transition-all text-sm font-medium
                                            ${position === pos
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-glass-panel border-glass-border text-text-secondary hover:border-blue-500/50'}`}
                                    >
                                        {pos.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && !error && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2">
                                <Icon name="checkCircle" className="w-4 h-4" />
                                Page Numbers Added and Downloaded!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleApply}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="hash" className="w-5 h-5" />
                                        Add Numbers
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
