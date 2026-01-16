import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function ProtectPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleProtect = async () => {
        if (!file) return;
        if (!password) {
            setError('Please enter a password.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                },
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `protected_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to protect PDF. Using strong encryption might not be supported in this environment or file is corrupt.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Protect PDF"
            description="Encrypt your PDF file with a password."
            icon="lock"
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
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Set Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-glass-panel border border-glass-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none transition-colors"
                                    placeholder="Enter secure password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-glass-panel border border-glass-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none transition-colors"
                                    placeholder="Repeat password"
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
                                PDF Protected and Downloaded!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleProtect}
                                disabled={isProcessing || !password || !confirmPassword}
                                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Encrypting...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="lock" className="w-5 h-5" />
                                        Protect PDF
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
