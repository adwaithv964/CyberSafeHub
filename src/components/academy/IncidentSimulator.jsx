import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../Button';
import Icon from '../Icon';
import { callGeminiAPI } from '../../utils/geminiApi';

const IncidentSimulator = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [gameActive, setGameActive] = useState(false);
    const bottomRef = useRef(null);

    const introMessage = {
        sender: 'system',
        text: "**⚡ Incident Response Simulator ⚡**\n\nWelcome, Administrator. In this simulation, you will face a realistic cyber attack scenario. You must make critical decisions to contain the threat and restore services.\n\nType **'Start'** to begin the simulation."
    };

    useEffect(() => {
        setMessages([introMessage]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const GAME_MASTER_PROMPT = `You are the Game Master (GM) for a high-stakes Cybersecurity Incident Response RPG. 
The user is the Lead Incident Responder / SysAdmin. 
Your goal is to run an immersive, realistic simulation of a cyber attack.

**Game Rules:**
1. **Scenario Start:** When the game begins, generate a random, realistic critical incident (e.g., Ransomware detected on HR server, DDoS causing 504 errors, abnormal data egress, SQL injection alerts). Describe the initial symptoms clearly.
2. **Turn-Based:** After the user responds, describe the result of their action and the next development in the crisis.
3. **Realism:** 
   - Good technical decisions (e.g., "isolate host", "check auth logs", "capture memory dump") should yield clues or mitigate threats.
   - bad decisions (e.g., "reboot server" causing evidence loss, "ignore alert") should escalate the crisis.
   - Use technical jargon appropriate for a SOC analyst (IOCs, IPs, logs, ports).
4. **Tone:** Urgent, professional, immersive. Use Markdown for styling (bold key terms, code blocks for logs).
5. **Winning/Losing:**
   - If the user saves the day, declare "**MISSION ACCOMPLISHED**" and give a brief score/feedback.
   - If the user fails catastrophically, declare "**SYSTEM FAILURE**" and explain why.

**Format:**
Keep responses under 150 words. Be punchy. 
Always end with "What do you do?" or a specific prompt for action.`;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userText = input;
        setInput('');

        // Add user message
        const newHistory = [...messages, { sender: 'user', text: userText }];
        setMessages(newHistory);
        setIsThinking(true);

        try {
            let activeGame = gameActive;

            // Check for start command if game not active
            if (!activeGame) {
                if (userText.toLowerCase().includes('start')) {
                    setGameActive(true);
                    activeGame = true;
                } else {
                    setIsThinking(false);
                    setMessages(prev => [...prev, { sender: 'ai', text: "Type '**Start**' to launch the simulation." }]);
                    return;
                }
            }

            // Filter history for API: Exclude internal system messages like the static intro
            const apiHistory = newHistory.filter(m => m.sender !== 'system');

            const responseText = await callGeminiAPI(apiHistory, GAME_MASTER_PROMPT);

            if (responseText) {
                setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);

                if (responseText.includes("MISSION ACCOMPLISHED") || responseText.includes("SYSTEM FAILURE")) {
                    setGameActive(false);
                }
            } else {
                throw new Error("No response from AI");
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'system', text: "⚠️ **Connection Error**: Unable to reach the Simulation Core. Please try again." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const resetGame = () => {
        setGameActive(false);
        setMessages([introMessage]);
        setInput('');
    };

    return (
        <div className="flex flex-col h-[600px] border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-black/80 font-mono text-sm md:text-base relative">
            {/* Terminal Header */}
            <div className="bg-gray-900/90 p-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-xs">TERM_SESSION_ID: {Math.floor(Math.random() * 99999)}</div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${msg.sender === 'user'
                            ? 'bg-accent/20 text-cyan-100 border border-accent/30'
                            : msg.sender === 'system'
                                ? 'bg-blue-900/20 text-blue-200 border border-blue-500/30'
                                : 'bg-green-900/20 text-green-300 border border-green-500/30'
                            }`}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-green-900/10 text-green-500 p-2 rounded animate-pulse text-xs">
                            &gt; SYSTEM_PROCESSING...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-900/90 border-t border-white/10">
                {!gameActive && messages.length > 1 && !messages[messages.length - 1].text.includes("Type 'Start'") ? (
                    <div className="flex justify-center">
                        <Button onClick={resetGame} variant="primary">Restart Simulation</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <span className="text-green-500 font-bold self-center">{'>'}</span>
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={gameActive ? "Enter command (e.g., 'Check firewall logs')..." : "Type 'Start'..."}
                            className="flex-grow bg-transparent border-none focus:ring-0 text-green-400 placeholder-gray-600"
                        />
                        <button type="submit" disabled={isThinking} className="text-green-500 hover:text-green-300 disabled:opacity-50">
                            <Icon name="send" className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default IncidentSimulator;
