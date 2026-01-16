import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout } from '../ToolLayout';
import Icon from '../../../Icon';

export function ScanToPDF({ onBack }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraActive(true);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Could not access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImages(prev => [...prev, imageDataUrl]);
        }
    };

    const removeImage = (index) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSavePDF = async () => {
        if (capturedImages.length === 0) return;
        setIsProcessing(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.create();

            for (const imgDataUrl of capturedImages) {
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedJpg(imgBytes);

                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();

                // Scale image to fit page
                const imgDims = image.scale(1);
                const scale = Math.min(width / imgDims.width, height / imgDims.height);

                const scaledWidth = imgDims.width * scale;
                const scaledHeight = imgDims.height * scale;

                page.drawImage(image, {
                    x: (width - scaledWidth) / 2,
                    y: (height - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scanned_document.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Cleanup
            setCapturedImages([]);
            stopCamera();

        } catch (err) {
            console.error(err);
            setError('Failed to generate PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Scan to PDF"
            description="Use your camera to scan documents and convert them to PDF."
            icon="camera"
            color="text-red-500"
            onBack={() => {
                stopCamera();
                onBack();
            }}
        >
            <div className="space-y-6">
                {!isCameraActive && capturedImages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Icon name="camera" className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Ready to Scan?</h3>
                        <p className="text-text-secondary mb-8">We'll need access to your camera to capture documents.</p>
                        <button
                            onClick={startCamera}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 mx-auto"
                        >
                            <Icon name="camera" className="w-5 h-5" />
                            Start Scanning
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {isCameraActive && (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto border-2 border-glass-border">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                    <button
                                        onClick={captureImage}
                                        className="w-16 h-16 rounded-full border-4 border-white bg-red-500/80 hover:bg-red-500 transition-all shadow-lg"
                                        aria-label="Capture"
                                    />
                                    <button
                                        onClick={stopCamera}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                    >
                                        <Icon name="x" className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {capturedImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-text-primary">Captured Pages ({capturedImages.length})</h3>
                                    {!isCameraActive && (
                                        <button
                                            onClick={startCamera}
                                            className="px-4 py-2 bg-glass-panel border border-glass-border rounded-lg hover:bg-glass-panel-dark transition-colors flex items-center gap-2"
                                        >
                                            <Icon name="plus" className="w-4 h-4" />
                                            <span>Scan More</span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {capturedImages.map((img, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border border-glass-border">
                                            <img src={img} alt={`Scan ${index + 1}`} className="w-full h-full object-cover aspect-[3/4]" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => removeImage(index)} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                                                    <Icon name="trash" className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xxs text-center p-1">
                                                Page {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center pt-6 space-x-4">
                                    <button
                                        onClick={handleSavePDF}
                                        disabled={isProcessing}
                                        className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Icon name="loader" className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="fileText" className="w-5 h-5" />
                                                Save as PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2 max-w-xl mx-auto">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
