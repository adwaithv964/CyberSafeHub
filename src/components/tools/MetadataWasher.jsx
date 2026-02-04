import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon';
import EXIF from 'exif-js';

export default function MetadataWasher() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [cleanedUrl, setCleanedUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile) => {
        // Reset state
        setFile(selectedFile);
        setCleanedUrl(null);
        setMetadata(null);
        setIsCleaning(false);

        // Create Preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        // Extract EXIF
        EXIF.getData(selectedFile, function () {
            const allTags = EXIF.getAllTags(this);

            // Format interesting tags
            const formattedMetadata = {
                make: EXIF.getTag(this, "Make"),
                model: EXIF.getTag(this, "Model"),
                date: EXIF.getTag(this, "DateTime") || EXIF.getTag(this, "DateTimeOriginal"),
                gps: null
            };

            // Handle GPS
            const lat = EXIF.getTag(this, "GPSLatitude");
            const long = EXIF.getTag(this, "GPSLongitude");

            if (lat && long) {
                // Convert array to decimal if needed (simplified)
                // EXIF-JS usually returns arrays [deg, min, sec]
                const convertDMSToDD = (dms, ref) => {
                    if (!dms) return 0;
                    let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
                    if (ref === "S" || ref === "W") {
                        dd = dd * -1;
                    }
                    return dd;
                };

                const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                const longRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

                formattedMetadata.gps = {
                    lat: convertDMSToDD(lat, latRef).toFixed(6),
                    lng: convertDMSToDD(long, longRef).toFixed(6)
                };
            }

            setMetadata(formattedMetadata);
        });
    };

    const cleanImage = async () => {
        if (!file || !previewUrl) return;
        setIsCleaning(true);

        try {
            // We use HTML Canvas to create a fresh copy of the pixel data
            // This inherently strips all metadata (EXIF, IPTC, XMP) because Canvas only cares about pixels.

            const img = new Image();
            img.src = previewUrl;

            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Export as Blob (lossless PNG or high quality JPG)
            // Using PNG ensures no compression artifacts, but file size might increase.
            // Using JPG 0.95 is usually the best balance. Let's stick to input format if possible, or default to JPG.
            const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

            canvas.toBlob((blob) => {
                const newUrl = URL.createObjectURL(blob);
                setCleanedUrl(newUrl);
                setIsCleaning(false);
            }, type, 0.95);

        } catch (err) {
            console.error("Error cleaning image:", err);
            setIsCleaning(false);
        }
    };

    const downloadCleaned = () => {
        if (!cleanedUrl) return;
        const a = document.createElement('a');
        a.href = cleanedUrl;
        a.download = "washed_" + file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const triggerSelect = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/tools')}
                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-6"
            >
                <Icon name="arrowLeft" className="w-5 h-5" />
                Back to Tools
            </button>
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400 mb-4 inline-block">
                    Metadata Washer
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    Remove hidden data (GPS coordinates, camera model, timestamps) from your photos before sharing them online.
                    All processing happens 100% in your browser.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Upload / Preview Area */}
                <div className="bg-glass-panel p-6 rounded-xl border border-glass-border flex flex-col items-center justify-center min-h-[400px]">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/jpeg, image/png, image/jpg"
                    />

                    {!file ? (
                        <div
                            onClick={triggerSelect}
                            className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-glass-border rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-all p-10"
                        >
                            <div className="w-20 h-20 rounded-full bg-glass-surface flex items-center justify-center mb-6">
                                <Icon name="uploadCloud" className="w-10 h-10 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold text-text-primary mb-2">Drop your photo here</h3>
                            <p className="text-text-secondary text-center">Supports JPG, PNG</p>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col">
                            <div className="relative flex-1 bg-black/50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain" />
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={triggerSelect} className="px-4 py-2 rounded-lg bg-glass-surface hover:bg-glass-highlight text-text-secondary transition-colors text-sm">
                                    Change Image
                                </button>
                                <p className="text-sm text-text-secondary truncate flex-1 text-right">{file.name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis / Action Area */}
                <div className="flex flex-col gap-6">

                    {/* Metadata Report */}
                    <div className="bg-glass-panel p-6 rounded-xl border border-glass-border flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Icon name="search" className="w-5 h-5 text-accent" />
                            Hidden Data Found
                        </h3>

                        {!file ? (
                            <div className="h-40 flex items-center justify-center text-text-secondary opacity-50 italic">
                                Upload an image to analyze...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(!metadata || (!metadata.make && !metadata.date && !metadata.gps)) ? (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-3">
                                        <Icon name="checkCircle" className="w-6 h-6" />
                                        <div>
                                            <p className="font-semibold">Clean Image</p>
                                            <p className="text-xs opacity-80">No standard EXIF data detected.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {metadata.date && (
                                                <div className="flex justify-between items-center py-2 border-b border-glass-border">
                                                    <span className="text-text-secondary text-sm">Date Taken</span>
                                                    <span className="text-text-primary font-mono text-sm">{metadata.date.toString()}</span>
                                                </div>
                                            )}
                                            {(metadata.make || metadata.model) && (
                                                <div className="flex justify-between items-center py-2 border-b border-glass-border">
                                                    <span className="text-text-secondary text-sm">Device</span>
                                                    <span className="text-text-primary font-mono text-sm">{metadata.make} {metadata.model}</span>
                                                </div>
                                            )}
                                            {metadata.gps && (
                                                <div className="py-2 border-b border-glass-border">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-text-secondary text-sm">GPS Location</span>
                                                        <span className="text-red-400 font-mono text-xs flex items-center gap-1">
                                                            <Icon name="alertTriangle" className="w-3 h-3" />
                                                            CRITICAL
                                                        </span>
                                                    </div>
                                                    <div className="bg-red-500/10 p-2 rounded text-red-200 font-mono text-xs break-all">
                                                        {metadata.gps.lat}, {metadata.gps.lng}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm mt-4">
                                            Warning: This file contains personal metadata.
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {file && (
                        <div className="bg-glass-panel p-6 rounded-xl border border-glass-border">
                            {!cleanedUrl ? (
                                <button
                                    onClick={cleanImage}
                                    disabled={isCleaning}
                                    className="w-full py-4 bg-gradient-to-r from-accent to-purple-600 rounded-lg font-bold text-white hover:shadow-glow-accent transition-all flex items-center justify-center gap-2"
                                >
                                    {isCleaning ? (
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                    ) : (
                                        <>
                                            <Icon name="shield" className="w-5 h-5" />
                                            Wash Metadata
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-3 text-green-400 mb-4 justify-center">
                                        <Icon name="checkCircle" className="w-6 h-6" />
                                        <span className="font-semibold">Image Scrubbed Successfully!</span>
                                    </div>
                                    <button
                                        onClick={downloadCleaned}
                                        className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icon name="download" className="w-5 h-5" />
                                        Download Clean Image
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
