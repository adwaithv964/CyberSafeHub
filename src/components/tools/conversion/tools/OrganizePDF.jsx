import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function OrganizePDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [pageOrder, setPageOrder] = useState([]); // Array of original 0-based indices
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (files) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            setError('');
            try {
                const arrayBuffer = await f.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                // Initialize order: [0, 1, 2, ..., n-1]
                setPageOrder(Array.from({ length: pdf.getPageCount() }, (_, i) => i));
            } catch (e) {
                setError('Invalid PDF file');
            }
        }
    };

    const movePage = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === pageOrder.length - 1)) return;

        const newOrder = [...pageOrder];
        const temp = newOrder[index];
        newOrder[index] = newOrder[index + direction];
        newOrder[index + direction] = temp;
        setPageOrder(newOrder);
    };

    const removePage = (index) => {
        const newOrder = pageOrder.filter((_, i) => i !== index);
        setPageOrder(newOrder);
    };

    const handleSave = async () => {
        if (!file) return;
        if (pageOrder.length === 0) {
            setError('You cannot save an empty PDF.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const newPdf = await PDFDocument.create();

            // Copy pages in the new order
            const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `organized_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError('Failed to organize PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Organize PDF"
            description="Sort, add and delete PDF pages. Drag and drop the pages to reorder them."
            icon="layers"
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
                    <div className="space-y-6 max-w-6xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {pageOrder.length} Pages Remaining
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPageOrder(Array.from({ length: pageOrder.length }, (_, i) => i).reverse())}
                                    className="px-3 py-2 text-sm bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors"
                                >
                                    Reverse Order
                                </button>
                                <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                    <Icon name="x" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {pageOrder.map((originalIndex, currentIndex) => (
                                <div
                                    key={`${originalIndex}-${currentIndex}`}
                                    className="relative group rounded-lg overflow-hidden border-2 border-glass-border hover:border-accent bg-glass-panel-dark p-2"
                                >
                                    <div className="aspect-[3/4] bg-white/5 flex items-center justify-center mb-2 rounded relative">
                                        <span className="text-2xl font-bold text-text-secondary">{originalIndex + 1}</span>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <div className="flex gap-2">
                                                <button onClick={() => movePage(currentIndex, -1)} disabled={currentIndex === 0} className="p-1 bg-glass-panel rounded hover:text-accent disabled:opacity-30">
                                                    <Icon name="arrowLeft" className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => movePage(currentIndex, 1)} disabled={currentIndex === pageOrder.length - 1} className="p-1 bg-glass-panel rounded hover:text-accent disabled:opacity-30">
                                                    <Icon name="arrowRight" className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => removePage(currentIndex)} className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white">
                                                <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-text-secondary">
                                        Page {currentIndex + 1}
                                    </div>
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
                                onClick={handleSave}
                                disabled={isProcessing || pageOrder.length === 0}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="layers" className="w-5 h-5" />
                                        Organize PDF
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
