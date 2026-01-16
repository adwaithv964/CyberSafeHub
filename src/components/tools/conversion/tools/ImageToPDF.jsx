import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function ImageToPDF({ onBack }) {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        pageSize: 'A4',
        orientation: 'portrait',
        margin: 'small'
    });

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

    const handleConvert = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                let image;
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    continue; // Skip unsupported types (though file input restricts this)
                }

                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();

                // Calculate scaling to fit page while maintaining aspect ratio
                const imgDims = image.scale(1);
                const margin = settings.margin === 'small' ? 20 : settings.margin === 'none' ? 0 : 50;

                const availableWidth = width - (margin * 2);
                const availableHeight = height - (margin * 2);

                let scaled = imgDims;
                const scaleFactor = Math.min(availableWidth / imgDims.width, availableHeight / imgDims.height);

                if (scaleFactor < 1) {
                    scaled = image.scale(scaleFactor);
                }

                page.drawImage(image, {
                    x: width / 2 - scaled.width / 2,
                    y: height / 2 - scaled.height / 2,
                    width: scaled.width,
                    height: scaled.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'converted_images.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError('Failed to convert images to PDF. Please ensure all files are valid JPG or PNG images.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="JPG to PDF"
            description="Convert JPG images to PDF in seconds. Easily adjust orientation and margins."
            icon="image"
            color="text-yellow-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!files.length ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={true}
                        accept="image/jpeg, image/jpg, image/png"
                        label="Select JPG/PNG images"
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-glass-panel-dark p-4 rounded-xl border border-glass-border">
                            <h3 className="text-xl font-semibold text-text-primary">Selected Images ({files.length})</h3>
                            <button
                                onClick={() => document.getElementById('add-more-img-input').click()}
                                className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors flex items-center gap-2"
                            >
                                <Icon name="plus" className="w-4 h-4" />
                                <span>Add More</span>
                            </button>
                            <input
                                id="add-more-img-input"
                                type="file"
                                className="hidden"
                                accept="image/jpeg, image/jpg, image/png"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="relative group aspect-square bg-glass-panel-dark rounded-xl border border-glass-border overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => moveFile(index, -1)} disabled={index === 0} className="p-2 bg-glass-panel rounded-full hover:bg-accent text-text-primary disabled:opacity-50">
                                            <Icon name="arrowLeft" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className="p-2 bg-glass-panel rounded-full hover:bg-accent text-text-primary disabled:opacity-50">
                                            <Icon name="arrowRight" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeFile(index)} className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-white text-xs truncate">
                                        {index + 1}. {file.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-glass-border pt-6">
                            <h4 className="text-lg font-semibold text-text-primary mb-4">Conversion Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">Page Size</label>
                                    <select
                                        value={settings.pageSize}
                                        onChange={(e) => setSettings({ ...settings, pageSize: e.target.value })}
                                        className="w-full bg-glass-panel border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    >
                                        <option value="A4">A4 (210 x 297 mm)</option>
                                        <option value="Letter">Letter (216 x 279 mm)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">Orientation</label>
                                    <select
                                        value={settings.orientation}
                                        onChange={(e) => setSettings({ ...settings, orientation: e.target.value })}
                                        className="w-full bg-glass-panel border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    >
                                        <option value="portrait">Portrait</option>
                                        <option value="landscape">Landscape</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">Margin</label>
                                    <select
                                        value={settings.margin}
                                        onChange={(e) => setSettings({ ...settings, margin: e.target.value })}
                                        className="w-full bg-glass-panel border border-glass-border rounded-lg px-3 py-2 text-text-primary"
                                    >
                                        <option value="none">No Margin</option>
                                        <option value="small">Small</option>
                                        <option value="large">Big</option>
                                    </select>
                                </div>
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
                                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white rounded-xl font-semibold shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="image" className="w-5 h-5" />
                                        Convert to PDF
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
