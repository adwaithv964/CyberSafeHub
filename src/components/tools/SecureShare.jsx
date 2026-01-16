import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { io } from "socket.io-client";
import QRCode from 'qrcode'; // Use default export
import { Html5QrcodeScanner } from "html5-qrcode";
import LZString from 'lz-string';
import API_BASE_URL from '../../config';

// --- Configuration ---
const SOCKET_URL = API_BASE_URL;

export default function SecureShare({ onNavigate }) {
    const [mode, setMode] = useState('menu'); // 'menu', 'send', 'receive'
    const [shareType, setShareType] = useState('global'); // 'global', 'nearby', 'offline'
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, failed
    const [transferStatus, setTransferStatus] = useState('idle'); // idle, sending, receiving, completed, error
    const [progress, setProgress] = useState(0);
    const [isChannelReady, setIsChannelReady] = useState(false); // Track data channel open state

    // Sender State
    const [generatedCode, setGeneratedCode] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const selectedFilesRef = useRef([]);
    const currentFileIndexRef = useRef(0);


    // Receiver State
    const [inputCode, setInputCode] = useState((new Array(6)).fill(''));

    // Nearby State
    const [deviceName, setDeviceName] = useState(`User-${Math.floor(Math.random() * 1000)}`);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState(null); // { senderId, senderName }

    // WebRTC Refs
    const peerConnection = useRef(null);
    const dataChannel = useRef(null);
    const socketRef = useRef(null);

    const isTransferCancelled = useRef(false);
    const fileStreamRef = useRef(null); // For writing to disk
    const [incomingMetadata, setIncomingMetadata] = useState(null); // For receiver approval

    // Offline State
    const [offlineStep, setOfflineStep] = useState('init'); // init, generate-offer, scan-offer, generate-answer, scan-answer
    const [qrData, setQrData] = useState('');
    const [scannerRef, setScannerRef] = useState(null);
    const isOfflineScanning = useRef(false);

    // --- Socket Initialization ---
    useEffect(() => {
        // Only connect when user enters a specific mode (or enables visibility for nearby)
        if (mode !== 'menu' || (shareType === 'nearby')) {
            if (socketRef.current) return; // Already connected

            const newSocket = io(SOCKET_URL);
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log("Connected to signaling server:", newSocket.id);
            });

            newSocket.on('user-connected', (userId) => {
                console.log("Peer connected:", userId);
                if (shareType === 'global') { // Only for code-based rooms
                    setConnectionStatus('connected');
                    if (mode === 'send') initiateOffer(userId);
                }
            });

            // Nearby Logic
            newSocket.on('nearby-users-list', (users) => {
                setNearbyUsers(users);
            });

            newSocket.on('connection-request', (data) => {
                console.log("Incoming connection request from", data.senderName);
                if (shareType === 'nearby') {
                    setIncomingRequest(data);
                }
            });

            newSocket.on('connection-accepted', (data) => {
                console.log("Connection accepted by", data.accepterId);
                setConnectionStatus('connected');
                initiateOffer(data.accepterId);
            });


            // Signaling Logic
            newSocket.on('offer', async (payload) => {
                console.log("Received Offer");
                await handleReceiveOffer(payload);
            });

            newSocket.on('answer', async (payload) => {
                console.log("Received Answer");
                await handleReceiveAnswer(payload);
            });

            newSocket.on('ice-candidate', async (payload) => {
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.addIceCandidate(payload.candidate);
                    } catch (e) {
                        console.error("Error adding received ice candidate", e);
                    }
                }
            });

            newSocket.on('disconnect-peer', () => {
                console.log("Peer disconnected");
                handleDisconnect(false);
            });

            return () => {
                newSocket.disconnect();
                if (peerConnection.current) {
                    peerConnection.current.close();
                }
                socketRef.current = null;
                setSocket(null);
                setIsChannelReady(false);
            };
        }
    }, [mode, shareType]);

    // --- WebRTC Logic ---

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current && remotePeerIdRef.current) {
                socketRef.current.emit('ice-candidate', {
                    target: remotePeerIdRef.current,
                    candidate: event.candidate
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
                handleDisconnect(false);
            }
        };

        pc.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            setupDataChannel(receiveChannel);
        };

        return pc;
    };

    const setupDataChannel = (channel) => {
        dataChannel.current = channel;
        channel.onopen = () => {
            console.log("Data Channel Open");
            setTransferStatus('idle');
            setIsChannelReady(true);
        };

        channel.onmessage = handleDataChannelMessage;

        channel.onclose = () => {
            console.log("Data Channel Closed");
            setIsChannelReady(false);
        };
    };

    const remotePeerIdRef = useRef(null);

    // Actual WebRTC functions
    const initiateOffer = async (targetUserId) => {
        console.log("Initiating Offer to", targetUserId);
        remotePeerIdRef.current = targetUserId;

        const pc = createPeerConnection();
        peerConnection.current = pc;

        // Create Data Channel (Sender side)
        const channel = pc.createDataChannel("fileTransfer");
        setupDataChannel(channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('offer', {
            target: targetUserId,
            callerId: socketRef.current.id,
            sdp: offer
        });
    };

    const handleReceiveOffer = async (payload) => {
        console.log("Handling Offer from", payload.callerId);
        remotePeerIdRef.current = payload.callerId;

        const pc = createPeerConnection();
        peerConnection.current = pc;

        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit('answer', {
            target: payload.callerId,
            sdp: answer
        });

        setConnectionStatus('connected');
    };

    const handleReceiveAnswer = async (payload) => {
        console.log("Handling Answer");
        const pc = peerConnection.current;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    };

    // --- Disconnect & Cancel Logic ---
    const handleDisconnect = (emitEvent = true) => {
        console.log("Disconnecting peer...");

        if (emitEvent && socketRef.current && remotePeerIdRef.current) {
            socketRef.current.emit('disconnect-peer', { target: remotePeerIdRef.current });
        }

        if (peerConnection.current) {
            peerConnection.current.close();
        }

        if (dataChannel.current) {
            dataChannel.current.close();
        }

        if (fileStreamRef.current) {
            fileStreamRef.current.close().catch(e => console.error("Error closing stream", e));
            fileStreamRef.current = null;
        }

        setConnectionStatus('disconnected');
        setTransferStatus('idle');
        setProgress(0);
        setIsChannelReady(false);
        remotePeerIdRef.current = null;
        isTransferCancelled.current = true;
        setIncomingMetadata(null);

        receivedBuffers.current = [];
        receivedSize.current = 0;
        fileMetadata.current = null;
    };

    const handleCancelTransfer = () => {
        isTransferCancelled.current = true;
        setTransferStatus('idle');
        setProgress(0);

        // Notify peer to stop sending
        if (dataChannel.current && dataChannel.current.readyState === 'open') {
            try {
                dataChannel.current.send(JSON.stringify({ type: 'CANCEL' }));
            } catch (e) {
                console.error("Failed to send cancel signal", e);
            }
        }

        // Close file stream if open
        if (fileStreamRef.current) {
            fileStreamRef.current.close().catch(e => console.error(e));
            fileStreamRef.current = null;
        }

        // Reset buffers
        receivedBuffers.current = [];
        receivedSize.current = 0;
    };

    // --- File Transfer Logic ---
    const CHUNK_SIZE = 65536; // 64KB

    const sendFile = async () => {
        if (selectedFilesRef.current.length === 0 || !dataChannel.current) return;
        setTransferStatus('sending'); // Start the overall process
        isTransferCancelled.current = false;

        // Reset index if starting fresh
        if (transferStatus !== 'sending') {
            currentFileIndexRef.current = 0;
            setCurrentFileIndex(0);
        }

        processNextFile();
    };

    const processNextFile = () => {
        const index = currentFileIndexRef.current;
        const files = selectedFilesRef.current;

        if (index >= files.length) {
            setTransferStatus('completed');
            return;
        }

        const file = files[index];
        if (!file || !dataChannel.current) return;

        try {
            if (dataChannel.current.readyState !== 'open') {
                console.error("Attempted to send but channel is not open");
                setTransferStatus('error');
                return;
            }

            // Send Metadata for CURRENT file
            dataChannel.current.send(JSON.stringify({
                type: 'metadata',
                name: file.name,
                size: file.size,
                fileType: file.type,
                fileIndex: index,
                totalFiles: files.length
            }));

            setTransferStatus('waiting-for-ack');
        } catch (error) {
            console.error("Error in processNextFile:", error);
            setTransferStatus('error');
        }
    };


    const startStreamingFile = () => {
        const index = currentFileIndexRef.current;
        const file = selectedFilesRef.current[index];

        if (!file || !dataChannel.current) return;

        setTransferStatus('sending');

        const channel = dataChannel.current;
        channel.bufferedAmountLowThreshold = 65536; // 64KB low watermark

        let offset = 0;
        const reader = new FileReader();

        const readSlice = () => {
            if (isTransferCancelled.current) return;
            if (channel.readyState !== 'open') {
                setTransferStatus('error');
                return;
            }

            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            const buffer = e.target.result;
            try {
                if (channel.bufferedAmount > 256 * 1024) { // 256KB Safety cap
                    const onBufferedAmountLow = () => {
                        channel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
                        sendData(buffer);
                    };
                    channel.addEventListener('bufferedamountlow', onBufferedAmountLow);
                } else {
                    sendData(buffer);
                }
            } catch (err) {
                console.error("Error sending chunk", err);
                setTransferStatus('error');
            }
        };

        const sendData = (buffer) => {
            try {
                channel.send(buffer);
                offset += buffer.byteLength;
                setProgress(Math.round((offset / file.size) * 100));

                if (offset < file.size) {
                    readSlice();
                } else {
                    // File Completed
                    currentFileIndexRef.current += 1;
                    setCurrentFileIndex(currentFileIndexRef.current);

                    // Move to next file immediately
                    setTimeout(processNextFile, 100);
                }
            } catch (error) {
                console.error("Critical error in sendData", error);
                // If queue full happens despite check, wait for drain
                if (error.name === 'OperationError') {
                    setTimeout(() => sendData(buffer), 50);
                } else {
                    setTransferStatus('error');
                }
            }
        };

        readSlice();
    };

    // Receiver Buffers
    const receivedBuffers = useRef([]);
    const receivedSize = useRef(0);
    const fileMetadata = useRef(null);
    const lastProgressUpdate = useRef(0);


    const handleDataChannelMessage = async (event) => {
        const data = event.data;

        if (typeof data === 'string') {
            try {
                const message = JSON.parse(data);

                if (message.type === 'metadata') {
                    setIncomingMetadata(message);
                    fileMetadata.current = message; // Persist in ref for callbacks
                    setTransferStatus('waiting-for-accept');
                } else if (message.type === 'ACK') {
                    startStreamingFile();
                } else if (message.type === 'CANCEL') {
                    // Peer cancelled transfer
                    isTransferCancelled.current = true;
                    setTransferStatus('idle');
                    setProgress(0);
                    setIncomingMetadata(null);
                }
            } catch (e) {
                console.error("Error parsing message", e);
            }
        } else {
            // Binary Data (Chunk)
            if (isTransferCancelled.current) return; // IGNORE chunks if cancelled

            setTransferStatus('receiving');
            const arrayBuffer = data;
            const meta = fileMetadata.current; // Use ref for reliability

            if (fileStreamRef.current) {
                try {
                    await fileStreamRef.current.write(arrayBuffer);
                    receivedSize.current += arrayBuffer.byteLength;

                    if (meta) {
                        const now = Date.now();
                        // Throttle updates to every 100ms unless complete
                        if (now - lastProgressUpdate.current > 100 || receivedSize.current >= meta.size) {
                            const percent = Math.min(100, Math.round((receivedSize.current / meta.size) * 100));
                            setProgress(percent);
                            lastProgressUpdate.current = now;
                        }

                        if (receivedSize.current >= meta.size) {
                            await fileStreamRef.current.close();
                            fileStreamRef.current = null;
                            receivedBuffers.current = [];
                            receivedSize.current = 0;

                            // Check if this was the last file
                            if (meta.fileIndex + 1 >= meta.totalFiles) {
                                setTransferStatus('completed');
                                setIncomingMetadata(null); // Clear metadata only on full completion
                                fileMetadata.current = null;
                            } else {
                                // Wait for next metadata
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error writing to file stream", err);
                    setTransferStatus('error');
                }
            } else {
                // Flashback: RAM Buffer
                receivedBuffers.current.push(arrayBuffer);
                receivedSize.current += arrayBuffer.byteLength;

                if (meta) {
                    const now = Date.now();
                    if (now - lastProgressUpdate.current > 100 || receivedSize.current >= meta.size) {
                        const percent = Math.min(100, Math.round((receivedSize.current / meta.size) * 100));
                        setProgress(percent);
                        lastProgressUpdate.current = now;
                    }

                    if (receivedSize.current >= meta.size) {
                        saveReceivedFile();
                    }
                }
            }
        }
    };

    const handleAcceptDownload = async () => {
        if (!incomingMetadata) return;

        // Reset cancellation state for new transfer
        isTransferCancelled.current = false;

        try {
            // Try to use File System Access API
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: incomingMetadata.name,
                });
                const writable = await handle.createWritable();
                fileStreamRef.current = writable;
            } else {
                console.warn("File System Access API not supported. Using RAM buffer.");
            }
        } catch (err) {
            console.error("Error getting file handle (user might have cancelled):", err);
            return; // Don't start transfer if user cancelled
        }

        // Ready to receive
        receivedBuffers.current = [];
        receivedSize.current = 0;

        // Send ACK
        if (dataChannel.current) {
            dataChannel.current.send(JSON.stringify({ type: 'ACK' }));
        }

        setTransferStatus('receiving');
    };

    const saveReceivedFile = () => {
        setTransferStatus('completed');
        const blob = new Blob(receivedBuffers.current, { type: incomingMetadata.fileType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = incomingMetadata.name;
        a.click();
        URL.revokeObjectURL(url);
        setIncomingMetadata(null);
    };




    // --- UI Helpers ---
    const generateCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        if (socket) {
            socket.emit('join-room', code, socket.id);
        }
        return code;
    };

    const joinWithCode = () => {
        const code = inputCode.join('');
        if (code.length === 6 && socket) {
            socket.emit('join-room', code, socket.id);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
            selectedFilesRef.current = files;
            setCurrentFileIndex(0);
            currentFileIndexRef.current = 0;
            setTransferStatus('idle'); // Reset status on new select
        }
    };

    // Nearby Helpers
    const toggleVisibility = () => {
        if (!isVisible) {
            if (socket) socket.emit('join-nearby', deviceName);
            setIsVisible(true);
        } else {
            // Stop visibility
            if (socket) socket.emit('leave-nearby', deviceName);
            setIsVisible(false);
        }
    };

    const scanNearby = () => {
        if (socket) socket.emit('get-nearby-users');
    };

    const requestConnection = (targetId) => {
        if (socket) socket.emit('request-connection', targetId, deviceName);
    };

    const acceptRequest = () => {
        if (socket && incomingRequest) {
            socket.emit('accept-connection', incomingRequest.senderId);
            setIncomingRequest(null);
            setConnectionStatus('connected');
        }
    };


    // Auto-generate code on 'send' mode enter for Global
    useEffect(() => {
        if (mode === 'send' && shareType === 'global' && socket) {
            generateCode();
        }
    }, [mode, shareType, socket]);


    // --- Offline Mode Helpers ---
    const initiateOffline = async () => {
        const pc = createPeerConnection();
        peerConnection.current = pc;

        // Create Data Channel immediately as we are the "Offerer"
        const channel = pc.createDataChannel("fileTransfer");
        setupDataChannel(channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete for a self-contained offer
        // Usually we send ICE candidates separately, but for QR (Offline),
        // we need the FULL SDP with candidates embedded, or mostly complete.
        // A simple trick is to wait a bit or use 'iceGatheringState' change.
        // For simplicity here, we assume the initial offer has enough candidates (host candidates).

        // Compress SDP
        const compressed = LZString.compressToBase64(JSON.stringify(offer));
        setQrData(compressed);
        setOfflineStep('generate-offer');

        // Render QR
        setTimeout(() => {
            const canvas = document.getElementById('qr-canvas');
            if (canvas) QRCode.toCanvas(canvas, compressed, { width: 300 }, (error) => {
                if (error) console.error(error);
            });
        }, 100);
    };

    const handleOfflineScan = async (decodedText) => {
        try {
            const decompressed = LZString.decompressFromBase64(decodedText);
            const signal = JSON.parse(decompressed);


            if (!peerConnection.current) {
                const pc = createPeerConnection(); // Fixed: Use correct helper name
                peerConnection.current = pc;
            }
            const pc = peerConnection.current;

            if (signal.type === 'offer') {
                // We are Receiver
                await pc.setRemoteDescription(new RTCSessionDescription(signal));

                // Handle Data Channel (will happen in 'ondatachannel')

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                const compressedAnswer = LZString.compressToBase64(JSON.stringify(answer));
                setQrData(compressedAnswer);
                setOfflineStep('generate-answer');

                setTimeout(() => {
                    const canvas = document.getElementById('qr-canvas');
                    if (canvas) QRCode.toCanvas(canvas, compressedAnswer, { width: 300 }, (error) => {
                        if (error) console.error(error);
                    });
                }, 100);

            } else if (signal.type === 'answer') {
                // We are Sender
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                setConnectionStatus('connected');
                setIsChannelReady(true);
                setOfflineStep('connected');
            }
        } catch (e) {
            console.error("Scan Error", e);
        }
    };

    const startScanner = () => {
        if (scannerRef) return;
        setOfflineStep('scanning'); // Generic scanning step
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                 /* verbose= */ false
            );
            scanner.render((decodedText) => {
                console.log("Scanned:", decodedText);
                scanner.clear();
                setScannerRef(null);
                handleOfflineScan(decodedText);
            }, (error) => {
                // console.warn(error);
            });
            setScannerRef(scanner);
        }, 100);
    };


    // --- Render ---

    const renderOffline = () => (
        <div className="max-w-xl mx-auto mt-8 bg-glass-panel p-8 rounded-2xl border border-glass-border">
            <button onClick={() => { setMode('menu'); if (scannerRef) scannerRef.clear(); }} className="mb-6 flex items-center gap-2 text-text-secondary hover:text-accent">
                <Icon name="arrowLeft" className="w-4 h-4" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Offline Sharing (QR)</h2>

            {offlineStep === 'init' && (
                <div className="space-y-4">
                    <button onClick={initiateOffline} className="w-full py-4 bg-accent text-black rounded-xl font-bold hover:shadow-glow-accent">
                        I want to SEND (Generate QR)
                    </button>
                    <button onClick={startScanner} className="w-full py-4 bg-glass-border text-white rounded-xl font-bold hover:bg-glass-panel-hover">
                        I want to RECEIVE (Scan QR)
                    </button>
                </div>
            )}

            {(offlineStep === 'generate-offer' || offlineStep === 'generate-answer') && (
                <div className="flex flex-col items-center">
                    <p className="mb-4 text-text-secondary">
                        {offlineStep === 'generate-offer' ? 'Ask receiver to scan this QR Code.' : 'Ask sender to scan this QR Answer.'}
                    </p>
                    <canvas id="qr-canvas" className="rounded-xl border border-white/20 mb-6"></canvas>
                    {offlineStep === 'generate-offer' && (
                        <button onClick={() => { setOfflineStep('scanning'); startScanner(); }} className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                            Next: Scan Answer
                        </button>
                    )}
                </div>
            )}

            {offlineStep === 'scanning' && (
                <div className="flex flex-col items-center">
                    <p className="mb-4 text-text-secondary">Scan the QR code on the other device.</p>
                    <div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl border border-white/20"></div>
                </div>
            )}

            {offlineStep === 'connected' && (
                <div className="text-center">
                    <Icon name="checkCircle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-xl font-bold text-green-500 mb-6">Connected!</p>
                    <div className="flex gap-4">
                        <button onClick={() => setMode('send')} className="flex-1 py-3 bg-accent text-black rounded-xl font-bold">
                            Send File
                        </button>
                        <button onClick={() => setMode('receive')} className="flex-1 py-3 bg-glass-border text-white rounded-xl font-bold">
                            Receive File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMenu = () => (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-glass-panel rounded-2xl p-2 flex mb-8">
                <button
                    onClick={() => setShareType('global')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${shareType === 'global' ? 'bg-accent text-black shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Global Share (Code)
                </button>
                <button
                    onClick={() => setShareType('nearby')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${shareType === 'nearby' ? 'bg-accent text-black shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Nearby Share (WiFi)
                </button>
                <button
                    onClick={() => setShareType('offline')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${shareType === 'offline' ? 'bg-accent text-black shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Offline (QR)
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                        if (shareType === 'offline') {
                            setMode('offline');
                        } else {
                            setMode('send');
                        }
                    }}
                    className="bg-glass-panel p-8 rounded-2xl border border-glass-border hover:border-accent hover:shadow-glow-accent flex flex-col items-center gap-4 transition-all"
                >
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                        <Icon name="uploadCloud" className="w-10 h-10 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Send File</h2>
                    <p className="text-text-secondary text-center">
                        {shareType === 'global' ? 'Create a secure room and share code.' : (shareType === 'nearby' ? 'Scan for nearby devices to send.' : 'Generate QR code to connect.')}
                    </p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                        if (shareType === 'offline') {
                            setMode('offline');
                        } else {
                            setMode('receive');
                        }
                    }}
                    className="bg-glass-panel p-8 rounded-2xl border border-glass-border hover:border-blue-400 hover:shadow-glow-blue flex flex-col items-center gap-4 transition-all"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Icon name="downloadCloud" className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Receive File</h2>
                    <p className="text-text-secondary text-center">
                        {shareType === 'global' ? 'Enter a code to join room.' : (shareType === 'nearby' ? 'Make device visible to nearby senders.' : 'Scan QR code to connect.')}
                    </p>
                </motion.button>
            </div>
        </div>
    );

    const renderSend = () => (
        <div className="max-w-xl mx-auto mt-8 bg-glass-panel p-8 rounded-2xl border border-glass-border">
            <button onClick={() => setMode('menu')} className="mb-6 flex items-center gap-2 text-text-secondary hover:text-accent">
                <Icon name="arrowLeft" className="w-4 h-4" /> Back
            </button>

            {shareType === 'global' ? (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Your Secure Code</h2>
                    <div className="flex justify-center mb-8">
                        <div className="text-5xl font-mono font-bold tracking-widest text-accent bg-black/20 px-8 py-4 rounded-xl border border-accent/30">
                            {generatedCode || '------'}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Select Device</h2>
                    <div className="flex gap-4 mb-6">
                        <button onClick={scanNearby} className="flex-1 bg-accent/20 text-accent py-2 rounded-lg hover:bg-accent/30">Scan for Devices</button>
                    </div>
                    <div className="space-y-2 mb-8 max-h-48 overflow-y-auto custom-scrollbar">
                        {nearbyUsers.length === 0 ? (
                            <p className="text-center text-text-secondary py-4">No nearby devices found.</p>
                        ) : (
                            nearbyUsers.map(user => (
                                <div key={user.id} onClick={() => requestConnection(user.id)} className="flex items-center justify-between p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-accent/10 border border-transparent hover:border-accent/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Icon name="smartphone" className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                    <Icon name="arrowLeft" className="w-4 h-4 text-text-secondary rotate-180" />
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedFiles.length > 0 ? 'border-accent bg-accent/5' : 'border-glass-border hover:border-text-secondary'}`}>
                    <input
                        type="file"
                        id="fileInput"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer block">
                        {selectedFiles.length > 0 ? (
                            <div>
                                <Icon name="file" className="w-12 h-12 text-accent mx-auto mb-2" />
                                <p className="font-semibold text-lg">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</p>
                                <p className="text-sm text-text-secondary mt-1">
                                    {selectedFiles[0].name} {selectedFiles.length > 1 && `+ ${selectedFiles.length - 1} more`}
                                </p>
                                {transferStatus === 'sending' || transferStatus === 'waiting-for-ack' ? (
                                    <p className="text-xs text-accent mt-2 font-mono">
                                        Processing: {currentFileIndex + 1} / {selectedFiles.length}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div>
                                <Icon name="uploadCloud" className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                                <p className="text-lg">Click to select files</p>
                            </div>
                        )}
                    </label>
                </div>

                <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isChannelReady ? 'bg-green-500 shadow-glow-green' : (connectionStatus === 'connected' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500')}`} />
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected'
                                ? (isChannelReady ? 'Peer Connected & Ready' : 'Initializing Secure Channel...')
                                : 'Waiting for Peer...'}
                        </span>
                    </div>
                </div>

                {connectionStatus === 'connected' && (
                    <button
                        onClick={() => handleDisconnect(true)}
                        className="w-full py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/20"
                    >
                        Disconnect Peer
                    </button>
                )}

                <div className="flex gap-4">
                    {transferStatus === 'sending' && (
                        <button
                            onClick={handleCancelTransfer}
                            className="flex-1 py-4 bg-red-500/20 text-red-500 rounded-xl font-bold text-lg hover:bg-red-500/30 transition-all border border-red-500/20"
                        >
                            Cancel Transfer
                        </button>
                    )}

                    <button
                        onClick={sendFile}
                        disabled={!isChannelReady || selectedFiles.length === 0 || transferStatus === 'sending'}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${isChannelReady && selectedFiles.length > 0
                            ? 'bg-accent text-black hover:shadow-glow-accent'
                            : 'bg-glass-border text-text-secondary cursor-not-allowed'
                            }`}
                    >
                        {transferStatus === 'sending' || transferStatus === 'waiting-for-ack'
                            ? `Sending ${currentFileIndex + 1}/${selectedFiles.length} (${progress}%)`
                            : 'Send Securely'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderReceive = () => (
        <div className="max-w-xl mx-auto mt-8 bg-glass-panel p-8 rounded-2xl border border-glass-border relative">
            <button onClick={() => setMode('menu')} className="mb-6 flex items-center gap-2 text-text-secondary hover:text-accent">
                <Icon name="arrowLeft" className="w-4 h-4" /> Back
            </button>

            {shareType === 'global' ? (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Enter Code</h2>
                    <div className="flex justify-center gap-2 mb-8">
                        {inputCode.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`code-${idx}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    const newCode = [...inputCode];
                                    newCode[idx] = val;
                                    setInputCode(newCode);
                                    if (val && idx < 5) document.getElementById(`code-${idx + 1}`).focus();
                                }}
                                className="w-12 h-16 text-center text-2xl font-mono bg-black/30 border border-glass-border rounded-lg focus:border-accent focus:outline-none"
                            />
                        ))}
                    </div>
                    <button
                        onClick={joinWithCode}
                        className="w-full py-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-xl hover:bg-blue-500/30 hover:shadow-glow-blue transition-all mb-6"
                    >
                        Connect to Room
                    </button>
                    {connectionStatus === 'connected' && (
                        <button
                            onClick={() => handleDisconnect(true)}
                            className="w-full py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/20"
                        >
                            Disconnect
                        </button>
                    )}
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Discoverable Mode</h2>
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto transition-all ${isVisible ? 'bg-green-500/20 shadow-glow-green' : 'bg-glass-border'}`}>
                                <Icon name="wifi" className={`w-12 h-12 ${isVisible ? 'text-green-400' : 'text-text-secondary'}`} />
                            </div>
                            {isVisible && <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-50" />}
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-text-secondary block mb-1">Device Name</label>
                            <input
                                type="text"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                className="bg-black/30 border border-glass-border rounded-lg px-3 py-2 text-center w-full max-w-[200px]"
                            />
                        </div>

                        <button
                            onClick={toggleVisibility}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${isVisible ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-accent text-black hover:bg-accent-hover'}`}
                        >
                            {isVisible ? 'Stop Visibility' : 'Make Visible'}
                        </button>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isChannelReady ? 'bg-green-500 shadow-glow-green' : (connectionStatus === 'connected' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500')}`} />
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected'
                                ? (isChannelReady ? 'Connected to Peer' : 'Initializing...')
                                : 'Disconnected'}
                        </span>
                    </div>
                    {connectionStatus === 'connected' && shareType === 'nearby' && (
                        <button
                            onClick={() => handleDisconnect(true)}
                            className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full hover:bg-red-500/30 transition-colors"
                        >
                            Disconnect
                        </button>
                    )}
                </div>

                {transferStatus !== 'idle' && (
                    <div className="bg-black/30 p-6 rounded-xl text-center relative">
                        {/* Cancel Button for Receiver */}
                        {transferStatus === 'receiving' && (
                            <button
                                onClick={handleCancelTransfer}
                                className="absolute top-2 right-2 p-2 text-text-secondary hover:text-red-500 transition-colors"
                                title="Cancel Transfer"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        )}

                        <Icon name={transferStatus === 'completed' ? "checkCircle" : "downloadCloud"} className={`w-12 h-12 mx-auto mb-4 ${transferStatus === 'completed' ? 'text-green-400' : 'text-accent animate-bounce'}`} />
                        <p className="text-lg font-bold mb-2">
                            {transferStatus === 'receiving' ? (
                                <span>Receiving <span className="text-accent">{incomingMetadata?.name}</span>...</span>
                            ) : 'Transfer Complete'}
                        </p>

                        {incomingMetadata && (
                            <p className="text-xs text-text-secondary mb-3">
                                {incomingMetadata.fileIndex + 1} of {incomingMetadata.totalFiles} files
                            </p>
                        )}

                        <div className="w-full bg-glass-border h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-text-secondary">{progress}%</p>
                    </div>
                )}
            </div>

            {/* Connection Request Modal */}
            <AnimatePresence>
                {incomingRequest && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
                    >
                        <div className="bg-glass-panel p-6 rounded-xl border border-accent w-3/4 text-center">
                            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="share2" className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Receive File?</h3>
                            <p className="text-text-secondary mb-6">
                                <strong className="text-white">{incomingRequest.senderName}</strong> wants to connect.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setIncomingRequest(null)} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">Decline</button>
                                <button onClick={acceptRequest} className="flex-1 py-2 bg-accent text-black rounded-lg hover:bg-accent-hover font-bold">Accept</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Acceptance Modal */}
            <AnimatePresence>
                {/* Using incomingMetadata instead of incomingRequest here for file acceptance */}
                {incomingMetadata && transferStatus === 'waiting-for-accept' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
                    >
                        <div className="bg-glass-panel p-6 rounded-xl border border-accent w-3/4 text-center">
                            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="downloadCloud" className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Incoming File</h3>
                            <p className="text-white font-semibold mb-1">{incomingMetadata.name}</p>
                            <p className="text-text-secondary mb-6">{(incomingMetadata.size / 1024 / 1024).toFixed(2)} MB</p>

                            <div className="flex gap-4">
                                <button onClick={() => {
                                    setIncomingMetadata(null);
                                    setTransferStatus('idle');
                                }} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">Decline</button>

                                <button onClick={handleAcceptDownload} className="flex-1 py-2 bg-accent text-black rounded-lg hover:bg-accent-hover font-bold">
                                    Save & Accept
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <Icon name="share2" className="w-8 h-8 text-accent" />
                    Secure Share
                </h1>
                <p className="text-text-secondary mt-2">P2P Encrypted File Transfer. Data never touches our servers.</p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {mode === 'menu' && renderMenu()}
                    {mode === 'send' && renderSend()}
                    {mode === 'receive' && renderReceive()}
                    {mode === 'offline' && renderOffline()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
