import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { io } from "socket.io-client";
import API_BASE_URL from '../../config';

// --- Configuration ---
const SOCKET_URL = API_BASE_URL;

export default function SecureShare({ onNavigate }) {
    const [mode, setMode] = useState('menu'); // 'menu', 'send', 'receive'
    const [shareType, setShareType] = useState('global'); // 'global', 'nearby'
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, failed
    const [transferStatus, setTransferStatus] = useState('idle'); // idle, sending, receiving, completed, error
    const [progress, setProgress] = useState(0);

    // Sender State
    const [generatedCode, setGeneratedCode] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

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

            return () => {
                newSocket.disconnect();
                if (peerConnection.current) {
                    peerConnection.current.close();
                }
                socketRef.current = null;
                setSocket(null);
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
        };

        channel.onmessage = handleDataChannelMessage;
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

    // --- File Transfer Logic ---
    const CHUNK_SIZE = 16384;

    const sendFile = async () => {
        if (!selectedFile || !dataChannel.current) return;
        setTransferStatus('sending');

        // Send Metadata first
        dataChannel.current.send(JSON.stringify({
            type: 'metadata',
            name: selectedFile.name,
            size: selectedFile.size,
            fileType: selectedFile.type
        }));

        const buffer = await selectedFile.arrayBuffer();
        let offset = 0;

        const sendChunk = () => {
            if (offset >= buffer.byteLength) {
                setTransferStatus('completed');
                return;
            }

            const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
            dataChannel.current.send(chunk);
            offset += CHUNK_SIZE;

            setProgress(Math.min(100, Math.round((offset / buffer.byteLength) * 100)));

            if (dataChannel.current.bufferedAmount > 1000 * 1000) {
                setTimeout(sendChunk, 50);
            } else {
                setTimeout(sendChunk, 0);
            }
        };

        sendChunk();
    };

    // Receiver Buffers
    const receivedBuffers = useRef([]);
    const receivedSize = useRef(0);
    const fileMetadata = useRef(null);

    const handleDataChannelMessage = (event) => {
        const data = event.data;

        if (typeof data === 'string') {
            try {
                const metadata = JSON.parse(data);
                if (metadata.type === 'metadata') {
                    fileMetadata.current = metadata;
                    receivedBuffers.current = [];
                    receivedSize.current = 0;
                    setTransferStatus('receiving');
                }
            } catch (e) {
                console.error("Error parsing metadata", e);
            }
        } else {
            receivedBuffers.current.push(data);
            receivedSize.current += data.byteLength;

            if (fileMetadata.current) {
                setProgress(Math.min(100, Math.round((receivedSize.current / fileMetadata.current.size) * 100)));

                if (receivedSize.current >= fileMetadata.current.size) {
                    saveReceivedFile();
                }
            }
        }
    };

    const saveReceivedFile = () => {
        setTransferStatus('completed');
        const blob = new Blob(receivedBuffers.current, { type: fileMetadata.current.fileType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileMetadata.current.name;
        a.click();
        URL.revokeObjectURL(url);
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
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Nearby Helpers
    const toggleVisibility = () => {
        if (!isVisible) {
            if (socket) socket.emit('join-nearby', deviceName);
            setIsVisible(true);
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


    // --- Render ---

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
            </div>

            <div className="grid grid-cols-2 gap-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setMode('send')}
                    className="bg-glass-panel p-8 rounded-2xl border border-glass-border hover:border-accent hover:shadow-glow-accent flex flex-col items-center gap-4 transition-all"
                >
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                        <Icon name="uploadCloud" className="w-10 h-10 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Send File</h2>
                    <p className="text-text-secondary text-center">
                        {shareType === 'global' ? 'Create a secure room and share code.' : 'Scan for nearby devices to send.'}
                    </p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setMode('receive')}
                    className="bg-glass-panel p-8 rounded-2xl border border-glass-border hover:border-blue-400 hover:shadow-glow-blue flex flex-col items-center gap-4 transition-all"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Icon name="downloadCloud" className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Receive File</h2>
                    <p className="text-text-secondary text-center">
                        {shareType === 'global' ? 'Enter a code to join room.' : 'Make device visible to nearby senders.'}
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
                                    <Icon name="arrowRight" className="w-4 h-4 text-text-secondary" />
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedFile ? 'border-accent bg-accent/5' : 'border-glass-border hover:border-text-secondary'}`}>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer block">
                        {selectedFile ? (
                            <div>
                                <Icon name="file" className="w-12 h-12 text-accent mx-auto mb-2" />
                                <p className="font-semibold text-lg">{selectedFile.name}</p>
                                <p className="text-sm text-text-secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div>
                                <Icon name="upload" className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                                <p className="text-lg">Click to select a file</p>
                            </div>
                        )}
                    </label>
                </div>

                <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-glow-green' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected' ? 'Peer Connected' : 'Waiting for Peer...'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={sendFile}
                    disabled={connectionStatus !== 'connected' || !selectedFile || transferStatus === 'sending'}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${connectionStatus === 'connected' && selectedFile
                        ? 'bg-accent text-black hover:shadow-glow-accent'
                        : 'bg-glass-border text-text-secondary cursor-not-allowed'
                        }`}
                >
                    {transferStatus === 'sending' ? `Sending... ${progress}%` : 'Send Securely'}
                </button>
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
                            disabled={isVisible}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${isVisible ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-black hover:bg-accent-hover'}`}
                        >
                            {isVisible ? 'Visible to Nearby Devices' : 'Make Visible'}
                        </button>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-glow-green' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected' ? 'Connected to Peer' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                {transferStatus !== 'idle' && (
                    <div className="bg-black/30 p-6 rounded-xl text-center">
                        <Icon name={transferStatus === 'completed' ? "checkCircle" : "download"} className={`w-12 h-12 mx-auto mb-4 ${transferStatus === 'completed' ? 'text-green-400' : 'text-accent animate-bounce'}`} />
                        <p className="text-lg font-bold mb-2">
                            {transferStatus === 'receiving' ? 'Receiving File...' : 'Transfer Complete'}
                        </p>
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
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
