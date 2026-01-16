import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function SplitPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState('all'); // 'all' or 'ranges'
    const [ranges, setRanges] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
        }
    };

    const parseRanges = (rangeStr, totalPages) => {
        const result = [];
        const parts = rangeStr.split(',').map(p => p.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!start || !end || start > end || start < 1 || end > totalPages) {
                    throw new Error(`Invalid range: ${part}`);
                }
                // Convert to 0-based indices
                const indices = [];
                for (let i = start; i <= end; i++) indices.push(i - 1);
                result.push({ name: `pages_${start}-${end}`, indices });
            } else {
                const page = Number(part);
                if (!page || page < 1 || page > totalPages) {
                    throw new Error(`Invalid page number: ${part}`);
                }
                result.push({ name: `page_${page}`, indices: [page - 1] });
            }
        }
        return result;
    };

    const handleSplit = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();
            const zip = new JSZip();

            if (mode === 'all') {
                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                    newPdf.addPage(copiedPage);
                    const pdfBytes = await newPdf.save();
                    zip.file(`page_${i + 1}.pdf`, pdfBytes);
                }
            } else {
                const splitConfigs = parseRanges(ranges, totalPages);
                for (const config of splitConfigs) {
                    const newPdf = await PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(pdfDoc, config.indices);
                    copiedPages.forEach(page => newPdf.addPage(page));
                    const pdfBytes = await newPdf.save();
                    zip.file(`${config.name}.pdf`, pdfBytes);
                }
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'split_documents.zip');

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to split PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Split PDF"
            description="Separate one page or a whole set for easy conversion into independent PDF files."
            icon="scissors"
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
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 font-bold">
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

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('all')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${mode === 'all' ? 'border-red-500 bg-red-500/10' : 'border-glass-border hover:border-glass-border-hover'}`}
                            >
                                <Icon name="copy" className={`w-6 h-6 mb-2 ${mode === 'all' ? 'text-red-500' : 'text-text-secondary'}`} />
                                <h3 className="font-semibold text-text-primary">Extract All Pages</h3>
                                <p className="text-sm text-text-secondary mt-1">Save every page as a separate PDF file.</p>
                            </button>
                            <button
                                onClick={() => setMode('ranges')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${mode === 'ranges' ? 'border-red-500 bg-red-500/10' : 'border-glass-border hover:border-glass-border-hover'}`}
                            >
                                <Icon name="list" className={`w-6 h-6 mb-2 ${mode === 'ranges' ? 'text-red-500' : 'text-text-secondary'}`} />
                                <h3 className="font-semibold text-text-primary">Split by Range</h3>
                                <p className="text-sm text-text-secondary mt-1">Extract custom page ranges (e.g. 1-5, 8, 11-13).</p>
                            </button>
                        </div>

                        {mode === 'ranges' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Page Ranges
                                </label>
                                <input
                                    type="text"
                                    value={ranges}
                                    onChange={(e) => setRanges(e.target.value)}
                                    placeholder="e.g. 1-5, 8, 11-13"
                                    className="w-full bg-glass-panel border border-glass-border rounded-lg px-4 py-3 text-text-primary focus:border-red-500 outline-none transition-colors placeholder:text-text-secondary/50"
                                />
                                <p className="text-xs text-text-secondary mt-2">
                                    Use commas to separate ranges. Example: "1-5, 8, 11-13" will create 3 PDF files.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleSplit}
                                disabled={isProcessing || (mode === 'ranges' && !ranges)}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="scissors" className="w-5 h-5" />
                                        Split PDF
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
