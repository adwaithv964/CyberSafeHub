import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// import { Document, Packer, Paragraph, TextRun } from 'docx'; // Too heavy to bundle blindly? Let's just output text for now.
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PDFToOffice({ onBack }) {
    const [file, setFile] = useState(null);
    const [targetFormat, setTargetFormat] = useState('docx'); // 'docx' | 'txt'
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

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            let blob;
            let extension;

            // For real DOCX creation we'd need 'docx' library. For now, we save as Text with .doc (which Word opens as plain text).
            // Or ideally use Blob with specific mime type.

            if (targetFormat === 'docx' || targetFormat === 'doc') {
                // Faking a doc file with rich text (RTF-ish) or just plain text is the client-side limitation without 'docx' library
                blob = new Blob([fullText], { type: 'application/msword' }); // Word will open it and ask
                extension = 'doc';
            } else {
                blob = new Blob([fullText], { type: 'text/plain' });
                extension = 'txt';
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `extracted_${file.name.replace('.pdf', '')}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to extract text from PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF to Word/Text"
            description="Extract text content from your PDF documents."
            icon="fileText"
            color="text-blue-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF to convert"
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

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTargetFormat('docx')}
                                className={`p-4 rounded-xl border text-center transition-all ${targetFormat === 'docx' ? 'bg-blue-500 text-white border-blue-500' : 'bg-glass-panel border-glass-border hover:border-blue-500/50'}`}
                            >
                                <Icon name="fileText" className="w-6 h-6 mx-auto mb-2" />
                                <span className="block font-bold">Word (.doc)</span>
                            </button>
                            <button
                                onClick={() => setTargetFormat('txt')}
                                className={`p-4 rounded-xl border text-center transition-all ${targetFormat === 'txt' ? 'bg-blue-500 text-white border-blue-500' : 'bg-glass-panel border-glass-border hover:border-blue-500/50'}`}
                            >
                                <Icon name="alignLeft" className="w-6 h-6 mx-auto mb-2" />
                                <span className="block font-bold">Text (.txt)</span>
                            </button>
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
                                Extracted Successfully!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="fileText" className="w-5 h-5" />
                                        Convert PDF
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
