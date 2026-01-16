import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../ToolLayout';
import Icon from '../../../Icon';
import axios from 'axios';
import { FormatSelector } from './FormatSelector';
import { useConversionConfig } from '../hooks/useConversionConfig';
import { useJobPolling } from '../hooks/useJobPolling';
import { WarningModal } from '../components/WarningModal';

export function UniversalConverter({ onBack }) {
    const [file, setFile] = useState(null);
    const [inputFormat, setInputFormat] = useState('...');
    const [outputFormat, setOutputFormat] = useState('...');
    const [openDropdown, setOpenDropdown] = useState(null);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Warning State
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [currentWarning, setCurrentWarning] = useState(null);
    const [pendingConversion, setPendingConversion] = useState(false); // If true, retry after confirm

    const { getValidTargets, loading: configLoading } = useConversionConfig();
    const [availableTargets, setAvailableTargets] = useState(null);

    // Update Input Format and Targets when file changes
    useEffect(() => {
        if (file) {
            const ext = file.name.split('.').pop(); // Keep case for now, selector handles normalising
            setInputFormat(ext.toUpperCase());
            setOutputFormat('...');
            setAvailableTargets(null);
        }
    }, [file]);

    // Update Valid Targets based on Input
    useEffect(() => {
        if (inputFormat && inputFormat !== '...') {
            const valid = getValidTargets(inputFormat);
            setAvailableTargets(new Set(valid));
        }
    }, [inputFormat]);

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
            setProgress(0);
            setIsProcessing(false); // Reset processing state in case previous got stuck
            setPendingConversion(false);
        }
    };

    const { job, startPolling, error: jobError } = useJobPolling();

    // Effect: Handle Job Completion
    useEffect(() => {
        if (job && job.status === 'completed' && !success) {
            setProgress(100);
            setSuccess(true);
            setIsProcessing(false);

            // Trigger Download
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            window.location.href = `${API_URL}/api/convert/download/${job.id}`;
        }
        if (job && job.status === 'failed') {
            setIsProcessing(false);
            setError(job.error?.message || jobError || "Conversion Failed");
        }
        if (job && (job.status === 'processing' || job.status === 'queued')) {
            setProgress(job.progress || (job.status === 'queued' ? 5 : 10));
        }
    }, [job, jobError]);

    const runConversion = async (confirmed = false) => {
        if (!file || outputFormat === '...') {
            setError('Please select an output format');
            return;
        }

        setIsProcessing(true);
        setError('');
        setProgress(0);
        setSuccess(false);

        if (confirmed) setWarningModalOpen(false);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', outputFormat.toLowerCase());
            if (confirmed) formData.append('confirm', 'true');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // 1. Create Job
            const res = await axios.post(`${API_URL}/api/convert/job`, formData);

            // 2. Start Polling
            startPolling(res.data.jobId);

        } catch (err) {
            console.error(err);
            // Handle Warning (409)
            if (err.response && err.response.status === 409) {
                const data = err.response.data;
                setCurrentWarning(data.warning);
                setWarningModalOpen(true);
                setPendingConversion(true);
                setIsProcessing(false);
                return;
            }

            const errorMsg = err.response?.data?.error || err.message || "Failed to start job";
            const errorDetails = err.response?.data?.details;
            setError(errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg);
            setIsProcessing(false);
        }
    };

    const onConfirmWarning = () => {
        runConversion(true);
    };

    return (
        <ToolLayout
            title="Professional File Converter"
            description="Strict, high-quality format conversion."
            icon="refreshCw"
            color="text-emerald-500"
            onBack={onBack}
        >
            <div className="min-h-[500px] flex flex-col items-center relative">

                <WarningModal
                    isOpen={warningModalOpen}
                    warning={currentWarning}
                    onConfirm={onConfirmWarning}
                    onCancel={() => { setWarningModalOpen(false); setIsProcessing(false); }}
                />

                {/* Header Section (Hero) */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">
                        Universal Converter
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Professional grade conversion engine. We prioritize quality and data integrity.
                    </p>
                </div>

                {/* Conversion Selector Bar */}
                <div className="flex items-center gap-4 mb-12 relative z-20">
                    <span className="text-2xl text-text-secondary font-light">convert</span>

                    {/* Input Format - Read Only mostly, but we use selector for consistent look or assume detected */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-glass-panel-dark border border-glass-border rounded-lg min-w-[120px] justify-center">
                        <span className="font-bold text-lg text-text-primary">{inputFormat}</span>
                    </div>

                    <span className="text-2xl text-text-secondary font-light">to</span>

                    {/* Output Format */}
                    <FormatSelector
                        label=""
                        value={outputFormat}
                        isOpen={openDropdown === 'output'}
                        onToggle={() => setOpenDropdown(openDropdown === 'output' ? null : 'output')}
                        onClose={() => setOpenDropdown(null)}
                        onChange={(fmt) => setOutputFormat(fmt)}
                        availableFormats={availableTargets} // Strict Filter
                    />
                </div>

                {/* File Uploader or Action Area */}
                <div className="w-full max-w-3xl">
                    {!file ? (
                        <div className="bg-[#1a1d21] border-2 border-dashed border-glass-border rounded-xl p-10 text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files)}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-lg shadow-xl shadow-red-900/20 transition-all">
                                <Icon name="plus" className="w-5 h-5" />
                                Select File
                            </label>
                            <p className="mt-4 text-text-secondary">or drop files here</p>
                        </div>
                    ) : (
                        <div className="bg-[#1a1d21] border border-glass-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#2b2f36] rounded flex items-center justify-center text-text-primary font-bold text-xs">
                                        {inputFormat}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary text-lg">{file.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <span>•</span>
                                            <span className="text-emerald-400">Ready</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="p-2 hover:bg-[#2b2f36] rounded text-text-secondary hover:text-white">
                                    <Icon name="x" className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Status Area */}
                            {isProcessing && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2 text-text-secondary">
                                        <span className="capitalize">{job?.status || 'Converting'}...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-[#2b2f36] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center gap-2">
                                    <Icon name="checkCircle" className="w-5 h-5" />
                                    <span>Finished! Download started.</span>
                                </div>
                            )}

                            {!success && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => runConversion(false)}
                                        disabled={isProcessing || !outputFormat || outputFormat === '...'}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-bold text-lg shadow-lg transition-all flex items-center gap-2"
                                    >
                                        {isProcessing ? 'Processing...' : 'Convert'}
                                        {!isProcessing && <Icon name="arrowRight" className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-20 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 text-text-secondary opacity-50 text-sm">
                    <div className="text-center">
                        <h3 className="font-bold">Strict Validation</h3>
                        <p>Impossible conversions are blocked.</p>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold">Quality First</h3>
                        <p>Warnings for lossy actions.</p>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold">Private</h3>
                        <p>Files processed locally.</p>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold">Universal</h3>
                        <p>Smart backend engine.</p>
                    </div>
                </div>

            </div>
        </ToolLayout>
    );
}

