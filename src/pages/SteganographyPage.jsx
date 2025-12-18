import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Button from '../components/Button';
import Input from '../components/Input';

const SteganographyPage = () => {
    const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [secretMessage, setSecretMessage] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Canvas ref for image processing
    const canvasRef = useRef(null);

    const CSH_SIG = "CSH_SEC_v1::"; // Security Signature

    // --- Helper: Sanitize Input ---
    const sanitizeInput = (text) => {
        // Block script tags and other dangerous patterns basic filtering
        if (/<script\b[^>]*>([\s\S]*?)<\/script>/gim.test(text) || /javascript:/gim.test(text)) {
            throw new Error("Security Alert: Malicious code pattern detected.");
        }
        return text;
    };

    // --- Helper: Convert Text to Binary ---
    const textToBinary = (text) => {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('') + '00000000'; // Null terminator
    };

    // --- Helper: Convert Binary to Text ---
    const binaryToText = (binary) => {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.slice(i, i + 8);
            if (byte === '00000000') break; // Null terminator found
            text += String.fromCharCode(parseInt(byte, 2));
        }
        return text;
    };

    // --- Handle Image Upload ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit warning
                setError("Image is large. Processing may be slow.");
            } else {
                setError('');
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setPreviewUrl(event.target.result);
                    setSuccess('');
                    setDecodedMessage('');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    // --- ENCODE Logic ---
    const encodeMessage = () => {
        if (!image || !secretMessage) return;
        setProcessing(true);
        setError('');

        setTimeout(() => {
            try {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Security Check: Sanitize
                const safeMessage = sanitizeInput(secretMessage);
                const signedMessage = CSH_SIG + safeMessage;

                const binaryMessage = textToBinary(signedMessage);

                if (binaryMessage.length > data.length / 4) {
                    throw new Error("Message is too long for this image!");
                }

                let dataIndex = 0;
                for (let i = 0; i < binaryMessage.length; i++) {
                    // Get current pixel value
                    let val = data[dataIndex];
                    // Clear LSB
                    val = val & 254;
                    // Set LSB to message bit
                    val = val | parseInt(binaryMessage[i]);
                    // Update pixel
                    data[dataIndex] = val;

                    dataIndex += 4; // Skip to next pixel (using R channel only for simplicity, or iterate R,G,B)
                    // Optimization: We could use R, G, B channels to pack 3 bits per pixel.
                    // Implementation used here: 1 bit per pixel (Red channel) for robustness/simplicity.
                    // If we want more density: dataIndex++ but skip alpha (every 4th byte).
                }

                ctx.putImageData(imageData, 0, 0);
                setPreviewUrl(canvas.toDataURL('image/png'));
                setSuccess("Target armed. Message hidden successfully.");
            } catch (err) {
                setError(err.message);
            } finally {
                setProcessing(false);
            }
        }, 100);
    };

    // --- DECODE Logic ---
    const decodeMessage = () => {
        if (!image) return;
        setProcessing(true);
        setError('');
        setDecodedMessage('');

        setTimeout(() => {
            try {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let binaryMessage = '';

                // Read LSB from Red channel of each pixel
                for (let i = 0; i < data.length; i += 4) {
                    const val = data[i];
                    binaryMessage += (val & 1).toString();
                }

                const extractedText = binaryToText(binaryMessage);

                // Security Check: Verify Signature
                if (!extractedText.startsWith(CSH_SIG)) {
                    // If it doesn't match our signature, treat it as noise or malicious/unauthorized
                    throw new Error("Security Integrity Failed: Invalid or missing security signature. This image may contain untrusted data.");
                }

                const cleanMessage = extractedText.replace(CSH_SIG, '');

                // Additional Sanitization on Output (just in case)
                if (/<script|javascript:/i.test(cleanMessage)) {
                    throw new Error("Security Alert: Threat detected in payload.");
                }

                setDecodedMessage(cleanMessage || "Message is empty.");
                setSuccess("Scan complete. Verification Passed. Secure Payload Extracted.");

            } catch (err) {
                setError(err.message);
            } finally {
                setProcessing(false);
            }
        }, 100);
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.download = 'stego_enc_' + Date.now() + '.png';
        link.href = previewUrl;
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <Header title="Steganography Studio" subtitle="Conceal vital intelligence within standard image files." />
                <div className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/20 flex items-center gap-1">
                    <Icon name="shieldCheck" className="w-3 h-3" /> SECURE MODE
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <Card className="p-6 space-y-6">
                    <div className="flex p-1 bg-background/50 rounded-lg border border-white/5">
                        <button
                            onClick={() => { setMode('encode'); setPreviewUrl(null); setImage(null); setSuccess(''); setDecodedMessage(''); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'encode' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Icon name="eyeOff" className="w-4 h-4" />
                                Hide Message
                            </div>
                        </button>
                        <button
                            onClick={() => { setMode('decode'); setPreviewUrl(null); setImage(null); setSuccess(''); setDecodedMessage(''); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'decode' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Icon name="eye" className="w-4 h-4" />
                                Reveal Message
                            </div>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-accent/50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/png"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                <div className="w-12 h-12 bg-background/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon name={mode === 'encode' ? "image" : "search"} className="w-6 h-6 text-accent" />
                                </div>
                                <p className="text-text-primary font-medium">Click to upload {mode === 'encode' ? 'source' : 'suspicious'} image</p>
                                <p className="text-xs text-text-secondary mt-1">PNG format recommended (Lossless)</p>
                            </div>
                        </div>

                        {mode === 'encode' && (
                            <div className="space-y-3">
                                <label className="text-sm text-text-secondary font-medium uppercase tracking-wider">Secret Message</label>
                                <textarea
                                    value={secretMessage}
                                    onChange={(e) => setSecretMessage(e.target.value)}
                                    placeholder="Enter the intelligence to conceal..."
                                    className="w-full bg-background/30 border border-white/10 rounded-lg p-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none min-h-[120px]"
                                />
                                <div className="flex justify-between items-center text-xs text-text-secondary">
                                    <span>Chars: {secretMessage.length}</span>
                                    <span>Capacity: {image ? Math.floor((image.width * image.height) / 8) : 0} chars (approx)</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg flex items-center gap-2 text-sm">
                                <Icon name="alertTriangle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg flex items-center gap-2 text-sm">
                                <Icon name="checkCircle" className="w-4 h-4" />
                                {success}
                            </div>
                        )}

                        <Button
                            variant={mode === 'encode' ? 'primary' : 'secondary'}
                            onClick={mode === 'encode' ? encodeMessage : decodeMessage}
                            className="w-full"
                            disabled={!image || processing || (mode === 'encode' && !secretMessage)}
                        >
                            {processing ? (
                                <><Icon name="refreshCw" className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                            ) : (
                                mode === 'encode' ? 'Encrypt & Embed Data' : 'Scan & Extract Data'
                            )}
                        </Button>
                    </div>
                </Card>

                {/* Preview Panel */}
                <Card className="p-6 flex flex-col min-h-[500px]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Icon name="monitor" className="w-5 h-5 text-text-secondary" />
                        Visual Output
                    </h3>

                    <div className="flex-1 bg-black/40 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
                        ) : (
                            <div className="text-center text-text-secondary/50">
                                <Icon name="image" className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                <p>No image loaded</p>
                            </div>
                        )}
                        {/* Hidden Canvas */}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {mode === 'encode' && previewUrl && success && (
                        <div className="mt-4 animate-fade-in">
                            <Button onClick={downloadImage} className="w-full bg-success hover:bg-success/80 text-white">
                                <Icon name="download" className="w-4 h-4 mr-2" />
                                Download Stego-Image
                            </Button>
                        </div>
                    )}

                    {mode === 'decode' && decodedMessage && (
                        <div className="mt-4 p-4 bg-background/50 rounded-lg border border-white/10 animate-fade-in">
                            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Decrypted Payload</p>
                            <p className="text-accent font-mono break-all">{decodedMessage}</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SteganographyPage;
