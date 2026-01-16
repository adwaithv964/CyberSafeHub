import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function RepairPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [repairStats, setRepairStats] = useState('');

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
            setRepairStats('');
        }
    };

    const handleRepair = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');
        setRepairStats('');

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Try to load with ignoreEncryption to handle some corrupt files that claim to be encrypted but aren't
            let pdfDoc;
            try {
                pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            } catch (loadError) {
                // Should try generic load if first fails
                pdfDoc = await PDFDocument.load(arrayBuffer);
            }

            // Simple "repair" by saving it cleanly
            // pdf-lib rebuilds the XRef table and file structure on save
            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `repaired_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setSuccess(true);
            setRepairStats('File structure rebuilt and normalized.');

        } catch (err) {
            console.error(err);
            setError('Could not repair this PDF. The damage might be too severe for client-side repair.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Repair PDF"
            description="Recover data from a corrupted or damaged PDF document."
            icon="tool"
            color="text-orange-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF file to repair"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 font-bold">
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

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && !error && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <Icon name="checkCircle" className="w-5 h-5" />
                                    Repaired Successfully!
                                </div>
                                <div className="text-xs opacity-80">
                                    {repairStats}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleRepair}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Repairing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="tool" className="w-5 h-5" />
                                        Repair PDF
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
