import React, { useState } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function WatermarkPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('CONFIDENTIAL');
    const [opacity, setOpacity] = useState(0.3);
    const [size, setSize] = useState(50);
    const [color, setColor] = useState('#FF0000');
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

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    };

    const handleApply = async () => {
        if (!file) return;
        if (!text) {
            setError('Please enter watermark text.');
            return;
        }
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont('Helvetica-Bold');
            const { r, g, b } = hexToRgb(color);

            const pages = pdfDoc.getPages();
            pages.forEach(page => {
                const { width, height } = page.getSize();
                // Draw center
                page.drawText(text, {
                    x: width / 2 - (text.length * size) / 4, // Rough centering estimate
                    y: height / 2,
                    size: Number(size),
                    font: font,
                    color: rgb(r, g, b),
                    opacity: Number(opacity),
                    rotate: degrees(45),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `watermarked_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to apply watermark.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Add Watermark"
            description="Stamp text over your PDF pages to protect your intellectual property."
            icon="droplet"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Text</label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full bg-glass-panel border border-glass-border rounded-lg px-4 py-2 text-text-primary focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full h-10 bg-glass-panel border border-glass-border rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Size: {size}</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Opacity: {opacity}</label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={opacity}
                                    onChange={(e) => setOpacity(e.target.value)}
                                    className="w-full"
                                />
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
                                Watermark Added and Downloaded!
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
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="droplet" className="w-5 h-5" />
                                        Add Watermark
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
