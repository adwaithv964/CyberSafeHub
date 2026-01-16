import React, { useState } from 'react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function OfficeToPDF({ onBack }) {
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

    const convertWordToPDF = async (arrayBuffer) => {
        try {
            // Convert docx to html
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            // Basic HTML to PDF using jsPDF
            const doc = new jsPDF();

            // Note: jsPDF .html() is asynchronous and requires the element to be in the DOM or a string.
            // Using a simpler approach for stability: Strip tags and print text?
            // Or try to use the .html() method with a virtual container.
            // For a robust "Word to PDF", we really need server-side.
            // Here we will do a "Text Dump" style conversion for reliability in this demo.

            const textResult = await mammoth.extractRawText({ arrayBuffer });
            const text = textResult.value;

            const lines = doc.splitTextToSize(text, 180);
            let y = 10;
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += 7;
            });

            return doc.output('blob');
        } catch (e) {
            throw new Error('Word conversion failed: ' + e.message);
        }
    };

    const convertExcelToPDF = async (arrayBuffer) => {
        try {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert sheet to JSON/CSV text representation
            const text = XLSX.utils.sheet_to_csv(firstSheet);

            const doc = new jsPDF();
            doc.setFont("courier"); // Monospace for alignment
            doc.setFontSize(8);

            const lines = doc.splitTextToSize(text, 180);
            let y = 10;
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += 4;
            });

            return doc.output('blob');
        } catch (e) {
            throw new Error('Excel conversion failed: ' + e.message);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            let pdfBlob = null;

            if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                pdfBlob = await convertWordToPDF(arrayBuffer);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                pdfBlob = await convertExcelToPDF(arrayBuffer);
            } else {
                throw new Error('Unsupported file type. Improved support coming soon!');
            }

            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `converted_${file.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Conversion failed.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Office to PDF"
            description="Convert Word and Excel documents to PDF (Client-Side Preview Mode)."
            icon="fileText"
            color="text-blue-600"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select .docx, .xlsx file"
                        accept=".docx,.doc,.xlsx,.xls,.csv"
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
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-glass-panel rounded-full transition-colors text-text-secondary hover:text-danger">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 text-sm">
                            <h4 className="font-bold mb-1">Client-Side Limitations</h4>
                            <p>This tool runs entirely in your browser for privacy. Complex formatting (images, layouts) may be lost. For perfect quality, use official desktop software.</p>
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
                                Converted Successfully!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="fileText" className="w-5 h-5" />
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
