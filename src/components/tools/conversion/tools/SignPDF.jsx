import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout, FileUploader } from '../ToolLayout';
import Icon from '../../../Icon';

export function SignPDF({ onBack }) {
    const [file, setFile] = useState(null);
    const [signatureType, setSignatureType] = useState('draw'); // 'draw' | 'type'
    const [typedSignature, setTypedSignature] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Canvas refs
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleFileSelect = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
            setSuccess(false);
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const rect = canvas.getBoundingClientRect();
        const x = e.type.includes('touch') ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = e.type.includes('touch') ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const x = e.type.includes('touch') ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = e.type.includes('touch') ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getSignatureImage = async () => {
        if (signatureType === 'draw') {
            const canvas = canvasRef.current;
            return canvas.toDataURL('image/png');
        } else {
            // Create a temporary canvas to render typed text
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 400;
            tempCanvas.height = 100;
            const ctx = tempCanvas.getContext('2d');
            ctx.font = 'italic 40px "Dancing Script", cursive, serif'; // Fallback to cursive
            ctx.fillStyle = 'black';
            ctx.fillText(typedSignature, 20, 60);
            return tempCanvas.toDataURL('image/png');
        }
    };

    const handleSign = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');

        try {
            const signatureDataUrl = await getSignatureImage();
            const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

            // For now, place on the last page at bottom right as a default "Sign Logic"
            // Implementing generic drag-drop placement without rendering the whole PDF is hard.
            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1];
            const { width } = lastPage.getSize();

            const dims = signatureImage.scale(0.5);
            lastPage.drawImage(signatureImage, {
                x: width - dims.width - 50,
                y: 50,
                width: dims.width,
                height: dims.height,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `signed_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError('Failed to sign PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Sign PDF"
            description="Create your signature and add it to the document."
            icon="penTool"
            color="text-purple-500"
            onBack={onBack}
        >
            <div className="space-y-6">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        label="Select PDF to sign"
                    />
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-glass-panel-dark p-4 rounded-lg border border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 font-bold">
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

                        {/* Signature Creation Area */}
                        <div className="bg-glass-panel border border-glass-border rounded-xl overflow-hidden">
                            <div className="flex border-b border-glass-border">
                                <button
                                    onClick={() => setSignatureType('draw')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${signatureType === 'draw' ? 'bg-purple-500/10 text-purple-500' : 'text-text-secondary hover:bg-glass-panel-dark'}`}
                                >
                                    Draw
                                </button>
                                <button
                                    onClick={() => setSignatureType('type')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${signatureType === 'type' ? 'bg-purple-500/10 text-purple-500' : 'text-text-secondary hover:bg-glass-panel-dark'}`}
                                >
                                    Type
                                </button>
                            </div>

                            <div className="p-6">
                                {signatureType === 'draw' ? (
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-glass-border rounded-lg bg-white overflow-hidden relative cursor-crosshair">
                                            <canvas
                                                ref={canvasRef}
                                                width={500}
                                                height={200}
                                                className="w-full touch-none"
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                onTouchStart={startDrawing}
                                                onTouchMove={draw}
                                                onTouchEnd={stopDrawing}
                                            />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button onClick={clearCanvas} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Clear">
                                                    <Icon name="x" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-secondary text-center">Draw your signature in the box above</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={typedSignature}
                                            onChange={(e) => setTypedSignature(e.target.value)}
                                            placeholder="Type your name"
                                            className="w-full bg-glass-panel-dark border border-glass-border rounded-lg px-4 py-3 text-2xl font-serif italic text-center outline-none focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                )}
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
                                Signed and Downloaded!
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleSign}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                                        Signing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="penTool" className="w-5 h-5" />
                                        Sign PDF
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
