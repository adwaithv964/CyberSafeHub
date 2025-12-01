import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { callGeminiAPI } from '../utils/geminiApi';
import { simpleMarkdownToHtml } from '../utils/markdown';

const CyberAssistantPage = () => {
    const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I am Cy, your personal AI security expert. How can I help you fortify your digital defenses today?" }]);
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
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const systemPrompt = "You are a friendly and helpful cybersecurity expert named Cy. Your goal is to explain complex security topics in a simple, easy-to-understand way for non-technical users. Avoid jargon where possible, or explain it clearly if you must use it. Keep your responses concise and actionable. Use markdown for formatting like bolding and lists.";
        const aiResponse = await callGeminiAPI(input, systemPrompt);

        const aiMessage = { sender: 'ai', text: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <Header title="Cyber Assistant" subtitle="Your personal AI-powered security expert." />
            <Card className="flex-grow flex flex-col p-4">
                <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0"><Icon name="shield" className="w-6 h-6" /></div>}
                            <div className={`p-4 rounded-2xl max-w-lg ${msg.sender === 'user' ? 'bg-accent text-background rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(msg.text) }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3"><div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0"><Icon name="shield" className="w-6 h-6" /></div><div className="p-4 rounded-2xl bg-secondary rounded-bl-none"><div className="flex items-center gap-2 text-text-secondary"><div className="w-2 h-2 bg-current rounded-full animate-bounce"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce delay-300"></div></div></div></div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 border-t border-border-color pt-4">
                    <div className="flex items-center gap-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about phishing, passwords, or anything security..." className="flex-grow p-3 border border-border-color rounded-lg bg-secondary text-text-primary focus:ring-2 focus:ring-accent focus:outline-none" />
                        <Button type="submit" disabled={isLoading} className="p-3"><Icon name="send" className="w-6 h-6" /></Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CyberAssistantPage;
