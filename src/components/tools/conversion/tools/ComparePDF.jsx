import React, { useState } from 'react';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function ComparePDF({ onBack }) {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'overlay' (placeholder)

    const handleFile1Select = (files) => files.length > 0 && setFile1(files[0]);
    const handleFile2Select = (files) => files.length > 0 && setFile2(files[0]);

    const getFileUrl = (file) => file ? URL.createObjectURL(file) : null;

    return (
        <ToolLayout
            title="Compare PDF"
            description="View two PDFs side-by-side to manually inspect differences."
            icon="columns"
            color="text-purple-600"
            onBack={onBack}
        >
            <div className="space-y-6 h-full flex flex-col">
                {(!file1 || !file2) ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-text-primary">Document 1</h3>
                            {!file1 ? (
                                <FileUploader onFileSelect={handleFile1Select} multiple={false} label="Select First PDF" />
                            ) : (
                                <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name="fileText" className="text-purple-600" />
                                        <span className="text-text-primary truncate">{file1.name}</span>
                                    </div>
                                    <button onClick={() => setFile1(null)} className="text-text-secondary hover:text-danger"><Icon name="x" /></button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-text-primary">Document 2</h3>
                            {!file2 ? (
                                <FileUploader onFileSelect={handleFile2Select} multiple={false} label="Select Second PDF" />
                            ) : (
                                <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name="fileText" className="text-purple-600" />
                                        <span className="text-text-primary truncate">{file2.name}</span>
                                    </div>
                                    <button onClick={() => setFile2(null)} className="text-text-secondary hover:text-danger"><Icon name="x" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col gap-4 h-[600px]">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <button onClick={() => { setFile1(null); setFile2(null); }} className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark">
                                    Reset
                                </button>
                            </div>
                            <div className="text-sm text-text-secondary">
                                Visual Comparison Mode
                            </div>
                        </div>

                        <div className="flex-grow grid grid-cols-2 gap-4 h-full">
                            <div className="border border-glass-border rounded-lg overflow-hidden bg-white/5 relative">
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded z-10">{file1.name}</div>
                                <iframe src={getFileUrl(file1)} className="w-full h-full" title="PDF 1" />
                            </div>
                            <div className="border border-glass-border rounded-lg overflow-hidden bg-white/5 relative">
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded z-10">{file2.name}</div>
                                <iframe src={getFileUrl(file2)} className="w-full h-full" title="PDF 2" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
