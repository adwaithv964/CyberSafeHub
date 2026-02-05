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
            let systemPrompt = "";

            if (!gameActive) {
                // Initial game start logic
                if (userText.toLowerCase().includes('start')) {
                    setGameActive(true);
                    systemPrompt = `You are a Game Master for a Cybersecurity Incident Response RPG. 
                    Start a new random scenario (e.g., Ransomware outbreak, DDoS attack, Insider Threat, SQL Injection breach).
                    Describe the initial alert or symptoms clearly.
                    Ask the user what they want to do next.
                    Keep responses concise (under 100 words) but immersive. 
                    Use Markdown.`;
                } else {
                    // Not starting yet
                    setIsThinking(false);
                    setMessages(prev => [...prev, { sender: 'ai', text: "Type 'Start' to begin the simulation." }]);
                    return;
                }
            } else {
                // Ongoing game logic
                systemPrompt = `You are a Game Master for a Cybersecurity Incident Response RPG.
                The user is the System Administrator.
                Continue the scenario based on the user's last action.
                
                Rules:
                1. If the user's action is good standard practice (e.g., "isolate infected host", "check firewall logs"), advance the story positively.
                2. If the user's action is bad or dangerous (e.g., "ignore alert", "delete everything"), introduce complications or failure.
                3. If the user asks for help/hint, give a subtle clue.
                4. Maintain a 'Crisis Level' (Low, Medium, Critical) and mention it if it changes.
                5. If the incident is resolved, declare "VICTORY" and summarize performance.
                6. If the simulation ends in disaster, declare "GAME OVER".
                
                Keep responses immersive, concise, and use Markdown.`;
            }

            // Call API with history context
            // Convert message history to format expected by logic if needed, 
            // but here we simply pass the last user prompt + system instruction effectively 
            // treating it as a new turn with history context from the 'messages' state if we were sending full history.
            // For simplicity/token limits, we might just send the last few turns or a summarized context.
            // But 'callGeminiAPI' helper in this project usually takes (userPrompt, systemPrompt). 
            // We can construct a "chat history" string for the user prompt to keep context.

            const conversationContext = newHistory.slice(-6).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
            const fullPrompt = `${conversationContext}\n\n(Respond to the User's last action as the Game Master)`;

            const aiResponse = await callGeminiAPI([{ sender: 'user', text: fullPrompt }], systemPrompt);

            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

            if (aiResponse.includes("VICTORY") || aiResponse.includes("GAME OVER")) {
                setGameActive(false);
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'system', text: "Error connecting to simulation server. Please try again." }]);
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
