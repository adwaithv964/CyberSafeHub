import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function UnlockPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileSelect = async (files) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            setError('');
            setSuccess(false);
            setIsEncrypted(false);
            setPassword('');

            // Check if encrypted
            try {
                const arrayBuffer = await f.arrayBuffer();
                // Try loading without password
                await PDFDocument.load(arrayBuffer);
            } catch (e) {
                if (e.message.includes('Encrypted')) {
                    setIsEncrypted(true);
                }
                // If it fails for other reasons, we'll catch it during unlock
            }
        }
    };

    const handleUnlock = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            // Load with password (even if empty string if user tries that)
            const pdfDoc = await PDFDocument.load(arrayBuffer, { password });

            // Saving automatically removes encryption unless re-specified
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unlocked_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            if (err.message.includes('Password') || err.message.includes('Encrypted')) {
                setError('Incorrect password. Please try again.');
            } else {
                setError('Failed to unlock PDF. The file might be corrupted or using an unsupported encryption.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Unlock PDF"
            description="Remove password security from PDF files, giving you the freedom to use your data."
            icon="unlock"
            color="text-gray-400"
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
                                <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center text-gray-500 font-bold">
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

                        <div className="space-y-4">
                            <p className="text-text-secondary text-center">
                                {isEncrypted
                                    ? "This file is encrypted. Enter the password to unlock it."
                                    : "This file does not appear to be encrypted, but you can process it to ensure all restrictions are removed."}
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-glass-panel border border-glass-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none transition-colors"
                                    placeholder="Enter file password"
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
                                PDF Unlocked and Downloaded!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleUnlock}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Unlocking...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="unlock" className="w-5 h-5" />
                                        Unlock PDF
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
