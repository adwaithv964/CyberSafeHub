import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Button from '../Button';
import Icon from '../Icon';

const EncryptionVisualizer = () => {
    const [algorithm, setAlgorithm] = useState('caesar'); // 'caesar', 'aes', 'hash'
    const [input, setInput] = useState('Hello World');
    const [shift, setShift] = useState(3);
    const [key, setKey] = useState('secret123');
    const [output, setOutput] = useState('');

    // --- Algorithms ---

    // Caesar Cipher
    const caesarCipher = (str, shiftAmount) => {
        return str.replace(/[a-zA-Z]/g, (char) => {
            const base = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - base + shiftAmount) % 26) + base);
        });
    };

    // Simple Hash (DJB2 - non-cryptographic but good for visualization)
    const djb2Hash = (str) => {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return (hash >>> 0).toString(16).padStart(16, '0'); // Force positive hex
    };

    // Fake AES Visualization (XOR for demo purposes to show avalanche effect basically)
    // Real AES in JS without library is heavy. We want to show the concept: Key + Input = Scrambled Output
    const pseudoAES = (str, keyStr) => {
        if (!keyStr) return str;
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length);
            result += charCode.toString(16).padStart(2, '0');
        }
        return btoa(result).substring(0, 32) + '...'; // Base64 appearance
    };

    useEffect(() => {
        if (algorithm === 'caesar') {
            setOutput(caesarCipher(input, parseInt(shift)));
        } else if (algorithm === 'aes') {
            setOutput(pseudoAES(input, key));
        } else if (algorithm === 'hash') {
            setOutput(djb2Hash(input));
        }
    }, [input, shift, key, algorithm]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Algorithm Selector */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                {[
                    { id: 'caesar', label: 'Caesar Cipher', icon: 'rotateCw' },
                    { id: 'aes', label: 'AES Encryption', icon: 'lock' },
                    { id: 'hash', label: 'Hashing (MD5/SHA)', icon: 'hash' }
                ].map((algo) => (
                    <button
                        key={algo.id}
                        onClick={() => setAlgorithm(algo.id)}
                        className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 rounded-lg border transition-all ${algorithm === algo.id ? 'bg-accent text-white border-accent shadow-lg scale-105' : 'bg-background/50 border-white/10 text-text-secondary hover:bg-background/80'}`}
                    >
                        {algo.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* INPUT */}
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Icon name="fileText" className="w-5 h-5 text-accent" />
                        Plaintext Input
                    </h3>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-32 bg-background/50 border border-white/10 rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono"
                        placeholder="Type message here..."
                    />

                    {/* Controls based on Algo */}
                    {algorithm === 'caesar' && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-background/30 p-3 rounded-lg">
                            <span className="text-text-secondary text-sm">Shift Amount:</span>
                            <div className="w-full sm:w-auto flex flex-1 items-center gap-4">
                                <input
                                    type="range" min="1" max="25"
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                    className="flex-1 accent-accent cursor-pointer"
                                />
                                <span className="font-mono text-accent font-bold w-6 text-center">{shift}</span>
                            </div>
                        </div>
                    )}

                    {algorithm === 'aes' && (
                        <div className="space-y-2 bg-background/30 p-3 rounded-lg">
                            <span className="text-text-secondary text-sm">Secret Key:</span>
                            <input
                                type="text"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-text-primary font-mono text-sm"
                            />
                        </div>
                    )}
                </Card>

                {/* OUTPUT */}
                <Card className="p-6 space-y-4 border-accent/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Icon name="shield" className="w-5 h-5 text-success" />
                        Ciphertext Output
                    </h3>

                    <div className="w-full h-32 bg-black/40 border border-white/5 rounded-lg p-4 font-mono text-success break-all overflow-y-auto">
                        {output}
                    </div>

                    <div className="text-xs text-text-secondary space-y-1">
                        <p><span className="font-bold text-accent">Algorithm:</span> {algorithm.toUpperCase()}</p>
                        <p><span className="font-bold text-accent">Explanation:</span>
                            {algorithm === 'caesar' && " Shifts every letter by a fixed number. Very weak, easily broken."}
                            {algorithm === 'aes' && " Uses a secret key to scramble data. Standard for protecting classified info."}
                            {algorithm === 'hash' && " One-way mathematical function. Cannot be reversed. Used for passwords."}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EncryptionVisualizer;
