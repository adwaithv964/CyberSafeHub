import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function MergePDF({ onBack }) {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (newFiles) => {
        setFiles(prev => [...prev, ...Array.from(newFiles)]);
        setError('');
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === files.length - 1)) return;

        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + direction];
        newFiles[index + direction] = temp;
        setFiles(newFiles);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('Please select at least 2 PDF files to merge.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            // Trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'merged_document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError('Failed to merge PDFs. Please ensure all files are valid PDFs.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Merge PDF"
            description="Combine PDFs in the order you want with the easiest PDF merger available."
            icon="filePlus"
            color="text-red-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!files.length ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={true}
                        label="Select PDF files"
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-text-primary">Selected Files ({files.length})</h3>
                            <button
                                onClick={() => document.getElementById('add-more-input').click()}
                                className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors flex items-center gap-2"
                            >
                                <Icon name="plus" className="w-4 h-4" />
                                <span>Add More</span>
                            </button>
                            <input
                                id="add-more-input"
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                                            <Icon name="fileText" className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                                            <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => moveFile(index, -1)} disabled={index === 0} className="p-1 hover:text-accent disabled:opacity-30 transition-colors">
                                            <Icon name="arrowUp" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className="p-1 hover:text-accent disabled:opacity-30 transition-colors">
                                            <Icon name="arrowDown" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeFile(index)} className="p-1 hover:text-danger text-text-secondary transition-colors">
                                            <Icon name="x" className="w-4 h-4" />
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

                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleMerge}
                                disabled={isProcessing || files.length < 2}
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
                                        Merge PDF
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
