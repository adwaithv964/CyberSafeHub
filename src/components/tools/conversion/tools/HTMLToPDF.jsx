import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ToolLayout } from '../ToolLayout';
import Icon from '../../../Icon';

export function HTMLToPDF({ onBack }) {
    const [htmlContent, setHtmlContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleConvert = () => {
        if (!htmlContent) return;
        setIsProcessing(true);
        setError('');

        try {
            const doc = new jsPDF();

            // Using .text() for simple content or .html() for rich content. 
            // .html() is complex and requires container. 
            // Let's implement a clean "Text/Code to PDF" first, or try to use a hidden container for .html()

            // Basic implementation: Split text by line.
            // For true HTML, we would need to mount it.

            // Let's do a "Rich Text" approach: We'll render the text as is.
            // Actually, users usually paste raw text or url. 
            // If it's raw HTML code, they probably want the source code or the rendered view. 
            // Let's assume rendered view is desired.

            // For client side simplicity and robustness, we will treat this as "Text/Note to PDF" which covers "HTML Code" too.
            // But to honor the "HTML to PDF" name, let's try to interpret simple tags or just dump it.

            const lines = doc.splitTextToSize(htmlContent, 180);
            let y = 10;
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += 7;
            });

            doc.save('converted.pdf');
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Conversion failed.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="HTML/Text to PDF"
            description="Convert text, code, or HTML source to a PDF document."
            icon="code"
            color="text-teal-600"
            onBack={onBack}
        >
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-glass-panel p-4 rounded-xl border border-glass-border space-y-4">
                    <label className="block text-sm text-text-secondary mb-1">Enter Text or HTML</label>
                    <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-64 bg-glass-panel-dark border border-glass-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm"
                        placeholder="Paste your content here..."
                    />
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
                        PDF Downloaded!
                    </div>
                )}

                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleConvert}
                        disabled={isProcessing || !htmlContent}
                        className="px-8 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Icon name="loader" className="w-5 h-5 animate-spin" />
                                Converting...
                            </>
                        ) : (
                            <>
                                <Icon name="download" className="w-5 h-5" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
