import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function EditPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [textToAdd, setTextToAdd] = useState('');
    const [fontSize, setFontSize] = useState(12);
    const [xPos, setXPos] = useState(50);
    const [yPos, setYPos] = useState(50);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileSelect = async (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setTotalPages(pdf.getPageCount());
            } catch (e) {
                setError('Invalid PDF');
            }
        }
    };

    const handleSave = async () => {
        if (!file) return;
        if (!textToAdd) {
            setError('Please enter some text to add.');
            return;
        }
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            const pageIndex = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
            const page = pages[pageIndex];
            const { height } = page.getSize();

            page.drawText(textToAdd, {
                x: Number(xPos),
                y: height - Number(yPos), // Invert Y for user friendlies
                size: Number(fontSize),
                font: font,
                color: rgb(0, 0, 0),
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to edit PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Edit PDF"
            description="Add text annotations to your PDF document."
            icon="edit"
            color="text-indigo-600"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF to edit"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                    PDF
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-glass-panel p-4 rounded-xl border border-glass-border space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Text content</label>
                                <textarea
                                    value={textToAdd}
                                    onChange={(e) => setTextToAdd(e.target.value)}
                                    className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary h-24"
                                    placeholder="Enter text to add..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Page Number</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={pageNumber}
                                        onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                                        className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Font Size</label>
                                    <input
                                        type="number"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(e.target.value)}
                                        className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">X Position</label>
                                    <input
                                        type="number"
                                        value={xPos}
                                        onChange={(e) => setXPos(e.target.value)}
                                        className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Y Position (from top)</label>
                                    <input
                                        type="number"
                                        value={yPos}
                                        onChange={(e) => setYPos(e.target.value)}
                                        className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    />
                                </div>
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
                                Edit Saved!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="edit" className="w-5 h-5" />
                                        Add Text
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
