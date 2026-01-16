import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function RotatePDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [stats, setStats] = useState(null);
    const [rotations, setRotations] = useState({}); // { pageIndex: degrees }
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
                setStats({ pageCount: pdf.getPageCount() });
                // Initialize rotations
                const initialRotations = {};
                for (let i = 0; i < pdf.getPageCount(); i++) initialRotations[i] = 0;
                setRotations(initialRotations);
            } catch (e) {
                setError('Invalid PDF file');
            }
        }
    };

    const rotateAll = (deg) => {
        setRotations(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                next[key] = (next[key] + deg) % 360;
            });
            return next;
        });
    };

    const rotatePage = (index, deg) => {
        setRotations(prev => ({
            ...prev,
            [index]: (prev[index] + deg) % 360
        }));
    };

    const handleSave = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                const rotation = rotations[index] || 0;
                if (rotation !== 0) {
                    page.setRotation(degrees(page.getRotation().angle + rotation));
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'rotated_document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError('Failed to rotate PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Rotate PDF"
            description="Rotate specific pages or the entire document permanently."
            icon="refreshCw"
            color="text-purple-500"
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
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {stats?.pageCount} Pages
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={() => rotateAll(-90)} className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors text-sm font-medium">
                                Rotate All Left
                            </button>
                            <button onClick={() => rotateAll(90)} className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors text-sm font-medium">
                                Rotate All Right
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: stats?.pageCount || 0 }).map((_, i) => (
                                <div key={i} className="bg-glass-panel-dark p-3 rounded-lg border border-glass-border text-center">
                                    <div className="aspect-[3/4] bg-white/5 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                                        <div
                                            className="w-full h-full flex items-center justify-center text-text-secondary text-2xl font-bold transition-transform duration-300"
                                            style={{ transform: `rotate(${rotations[i]}deg)` }}
                                        >
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => rotatePage(i, -90)} className="p-1 hover:bg-glass-panel rounded hover:text-accent transition-colors">
                                            <Icon name="rotateCcw" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => rotatePage(i, 90)} className="p-1 hover:bg-glass-panel rounded hover:text-accent transition-colors">
                                            <Icon name="rotateCw" className="w-4 h-4" />
                                        </button>
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
                                disabled={isProcessing}
                                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="save" className="w-5 h-5" />
                                        Save Rotated PDF
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
