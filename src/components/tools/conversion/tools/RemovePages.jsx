import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function RemovePages({ onBack }) {
    const [file, setFile] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [pagesToRemove, setPagesToRemove] = useState(new Set()); // Set of 0-based indices
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (files) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            setError('');
            setPagesToRemove(new Set());
            try {
                const arrayBuffer = await f.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
            } catch (e) {
                setError('Invalid PDF file');
            }
        }
    };

    const togglePage = (index) => {
        setPagesToRemove(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleRemove = async () => {
        if (!file) return;
        if (pagesToRemove.size === 0) {
            setError('Please select at least one page to remove.');
            return;
        }
        if (pagesToRemove.size === pageCount) {
            setError('You cannot remove all pages.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Create a new PDF
            const newPdf = await PDFDocument.create();

            // Identify pages to KEEP
            const pagesToKeep = [];
            for (let i = 0; i < pageCount; i++) {
                if (!pagesToRemove.has(i)) {
                    pagesToKeep.push(i);
                }
            }

            // Copy pages to keep
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `removed_pages_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError('Failed to process PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Remove Pages"
            description="Select and delete specific pages from your PDF document."
            icon="trash"
            color="text-red-500"
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
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-glass-panel border border-glass-border rounded-xl text-center">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Click on pages to remove them</h3>
                            <p className="text-text-secondary text-sm">{pagesToRemove.size} pages selected for deletion</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array.from({ length: pageCount }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => togglePage(i)}
                                    className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${pagesToRemove.has(i) ? 'border-red-500 opacity-50' : 'border-glass-border hover:border-accent'}`}
                                >
                                    <div className="aspect-[3/4] bg-white/5 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-text-secondary">{i + 1}</span>
                                    </div>
                                    {pagesToRemove.has(i) && (
                                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                            <Icon name="trash" className="w-8 h-8 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleRemove}
                                disabled={isProcessing || pagesToRemove.size === 0}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="trash" className="w-5 h-5" />
                                        Remove pages
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
