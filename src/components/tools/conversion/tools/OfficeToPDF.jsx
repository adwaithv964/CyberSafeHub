import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

// Detect environment
const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    return 'https://cybersafehub-backend.onrender.com';
};

const API_BASE = getApiBaseUrl();

export function OfficeToPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState(null);
    const [success, setSuccess] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
            setJobId(null);
            setProgress(0);
        }
    };

    const pollJob = async (id) => {
        try {
            const res = await axios.get(`${API_BASE}/api/convert/job/${id}`);
            const job = res.data;

            if (job.status === 'completed') {
                setIsProcessing(false);
                setSuccess(true);
                setStatus('completed');
                setProgress(100);
                setDownloadUrl(`${API_BASE}/api/convert/download/${id}`);
            } else if (job.status === 'failed') {
                setIsProcessing(false);
                setError(job.error?.message || 'Conversion failed on server.');
            } else {
                // Map backend progress (0-100) to remaining UI progress (50-100)
                const backendProgress = job.progress || 0;
                const totalProgress = 50 + Math.round(backendProgress / 2);
                setProgress(prev => Math.max(prev, totalProgress)); // Never go backwards
                setTimeout(() => pollJob(id), 2000);
            }
        } catch (err) {
            setIsProcessing(false);
            setError('Lost connection to server.');
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');
        setStatus('uploading');
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', 'pdf');
        formData.append('confirm', 'true');

        try {
            const res = await axios.post(`${API_BASE}/api/convert/job`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded * 100) / p.total);
                    if (percent < 100) setProgress(percent / 2);
                }
            });

            const { jobId } = res.data;
            setJobId(jobId);
            setStatus('processing');
            pollJob(jobId);

        } catch (err) {
            console.error(err);
            setIsProcessing(false);
            const serverError = err.response?.data?.error;
            const serverReason = err.response?.data?.reason; // From blocked conversion
            const serverWarning = err.response?.data?.warning;

            let displayError = serverError || err.message || 'Failed to start conversion.';
            if (serverReason) displayError += ` (${serverReason})`;
            if (serverWarning) displayError += ` Warning: ${serverWarning}`;

            setError(displayError);
        }
    };

    return (
        <ToolLayout
            title="Office to PDF"
            description="Convert Word, Excel, and PowerPoint documents to high-quality PDF."
            icon="fileText"
            color="text-blue-600"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select .docx, .xlsx, .pptx file"
                        accept=".docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                    DOC
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            {!isProcessing && !success && (
                                <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                    <Icon name="x" className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-text-secondary">
                                    <span>{status === 'uploading' ? 'Uploading...' : 'Converting...'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-glass-panel rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2">
                                    <Icon name="checkCircle" className="w-4 h-4" />
                                    Converted Successfully!
                                </div>
                                <a
                                    href={downloadUrl}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white text-center rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all"
                                >
                                    Download PDF
                                </a>
                                <button
                                    onClick={() => setFile(null)}
                                    className="block w-full py-3 bg-glass-panel hover:bg-glass-panel-hover text-text-primary text-center rounded-xl font-semibold border border-glass-border transition-all"
                                >
                                    Convert Another
                                </button>
                            </div>
                        )}

                        {!isProcessing && !success && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleConvert}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3"
                                >
                                    <Icon name="fileText" className="w-5 h-5" />
                                    Convert to PDF
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
