import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function FlattenPDF({ onBack }) {
    const [file, setFile] = useState(null);
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

    const handleFlatten = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const form = pdfDoc.getForm();
            form.flatten();

            // Optionally flatten annotations if needed, but form.flatten() covers the main use case (interactive forms).
            // We can also try to "print" it to a new PDF to flatten everything effectively but that's heavier.
            // form.flatten() is the standard "make it read only" step for forms.

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flattened_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to flatten PDF. It might be encrypted or corrupted.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Flatten PDF"
            description="Make fillable forms read-only and merge layers."
            icon="layers"
            color="text-orange-600"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF to flatten"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-600/10 rounded-lg flex items-center justify-center text-orange-600 font-bold">
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

                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500 text-sm">
                            <h4 className="font-bold mb-1">About Flattening</h4>
                            <p>This process will convert interactive form fields into static content. This action cannot be undone.</p>
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
                                Flattened Successfully!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleFlatten}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-semibold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="layers" className="w-5 h-5" />
                                        Flatten PDF
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
