import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { callGeminiAPI } from '../utils/geminiApi';

const CyberAssistantPage = () => {
    const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I am CyberShield, your personal AI security expert. How can I help you fortify your digital defenses today?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        const updatedMessages = [...messages, userMessage]; // Create conversation history for API

        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        const systemPrompt = "You are a friendly and helpful cybersecurity expert named CyberShield. Your goal is to explain complex security topics in a simple, easy-to-understand way for non-technical users. Avoid jargon where possible, or explain it clearly if you must use it. Keep your responses concise and actionable. Use markdown for formatting like bolding, lists, and code blocks.";

        // Pass full history to API
        const aiResponse = await callGeminiAPI(updatedMessages, systemPrompt);

        const aiMessage = { sender: 'ai', text: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <Header title="Cyber Assistant" subtitle="Your personal AI-powered security expert." />
            <div className="glass-card flex-grow flex flex-col p-4 overflow-hidden w-full relative">
                <div className="flex-grow overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent custom-scrollbar">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0 mt-1">
                                    <Icon name="shield" className="w-6 h-6" />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl max-w-lg shadow-md ${msg.sender === 'user'
                                ? 'bg-accent text-background rounded-br-none'
                                : 'bg-secondary text-text-primary rounded-bl-none border border-border-color'
                                }`}>
                                <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline ? (
                                                    <div className="bg-background/50 rounded-md p-2 my-2 overflow-x-auto border border-border-color">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                ) : (
                                                    <code className="bg-background/30 rounded px-1 py-0.5" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0">
                                <Icon name="shield" className="w-6 h-6" />
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary rounded-bl-none border border-border-color">
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                {/* Input Area - Fixed at bottom via flex layout */}
                <div className="mt-4 pt-4 border-t border-border-color bg-inherit">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about phishing, passwords, or anything security..."
                            className="flex-grow p-3 border border-border-color rounded-lg bg-secondary text-text-primary focus:ring-2 focus:ring-accent focus:outline-none placeholder-text-secondary transition-all"
                        />
                        <Button type="submit" disabled={isLoading} className="p-3 bg-accent hover:bg-accent-hover text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Icon name="send" className="w-6 h-6" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CyberAssistantPage;
