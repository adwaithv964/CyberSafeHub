import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { callGeminiAPI } from '../../utils/geminiApi';

const CodeSecurityAuditor = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const handleAudit = async () => {
        if (!code.trim()) return;

        setIsAnalyzing(true);
        setError('');
        setAnalysis('');

        try {
            const systemPrompt = `You are an expert Application Security Engineer. Your goal is to simplify complex security findings for developers.
            
            Analyze the code and provide a report in this EXACT format:
            
            ## 🛡️ Security Status
            > A 1-sentence summary of the overall security posture. (e.g., "This code is vulnerable to SQL Injection." or "This code follows best practices.")
            
            ## 🚩 Vulnerabilities Found
            - **[Severity Level]**: [Issue Name]
            (e.g., - **Critical**: SQL Injection detected in line 4.)
            
            *If no issues, write "✅ No major vulnerabilities detected."*
            
            ## 📝 Explanation
            A short, plain-English explanation of *why* the code is dangerous. Avoid overly technical jargon where possible.
            
            ## 🔧 Fixed Code
            Provide the corrected code block below:
            
            ## 💡 Best Practices
            - Bullet point 1
            - Bullet point 2`;

            const userPrompt = `Please audit this code for security vulnerabilities:\n\n\`\`\`\n${code}\n\`\`\``;

            const response = await callGeminiAPI([{ sender: 'user', text: userPrompt }], systemPrompt);
            setAnalysis(response);
        } catch (err) {
            console.error("Audit failed:", err);
            setError("Failed to analyze code. Please check your internet connection or API key.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <Header title="Code Security Auditor" subtitle="AI-powered static analysis to find vulnerabilities within seconds." />

            <button
                onClick={() => navigate('/tools')}
                className="absolute top-24 left-8 flex items-center text-text-secondary hover:text-accent transition-colors z-10"
            >
                <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                Back to Tools
            </button>

            <div className="flex-grow p-4 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">

                    {/* Input Column */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-glass-panel p-4 rounded-xl border border-glass-border flex-grow flex flex-col shadow-lg">
                            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Icon name="code" className="w-5 h-5 text-accent" /> Source Code
                            </h3>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="// Paste your code here (JS, Python, SQL, etc.)..."
                                className="flex-grow w-full bg-black/40 text-green-400 font-mono text-sm p-4 rounded-lg border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent resize-none placeholder-white/20"
                                spellCheck="false"
                            />
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={handleAudit}
                                    disabled={!code.trim() || isAnalyzing}
                                    variant="primary"
                                    className="w-full md:w-auto"
                                >
                                    {isAnalyzing ? (
                                        <><Icon name="refreshCw" className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
                                    ) : (
                                        <><Icon name="shieldCheck" className="w-5 h-5 mr-2" /> Audit Code</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-glass-panel p-4 rounded-xl border border-glass-border flex-grow flex flex-col shadow-lg bg-secondary/90 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Icon name="fileText" className="w-5 h-5 text-accent" /> Security Report
                            </h3>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 p-2 rounded-lg bg-background/30 border border-white/5">
                                {!analysis && !isAnalyzing && !error && (
                                    <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-60">
                                        <Icon name="shield" className="w-16 h-16 mb-4" />
                                        <p>Ready to analyze.</p>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="h-full flex flex-col items-center justify-center text-accent animate-pulse">
                                        <Icon name="activity" className="w-16 h-16 mb-4" />
                                        <p>Scanning for vulnerabilities...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="h-full flex flex-col items-center justify-center text-danger">
                                        <Icon name="alertTriangle" className="w-16 h-16 mb-4" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {analysis && (
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-accent mt-6 mb-3 border-b border-white/10 pb-2" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="space-y-3 my-4" {...props} />,
                                                li: ({ node, ...props }) => <li className="ml-4 list-disc text-gray-300" {...props} />,
                                                p: ({ node, ...props }) => <div className="mb-4 leading-relaxed" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-accent pl-4 py-2 my-4 bg-accent/5 italic text-gray-300 rounded-r" {...props} />,
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline ? (
                                                        <div className="bg-black/50 rounded-md p-3 my-4 border border-white/10 overflow-x-auto shadow-inner">
                                                            <div className="flex justify-between items-center mb-2 px-1">
                                                                <span className="text-xs text-gray-500 font-mono uppercase">{match ? match[1] : 'code'}</span>
                                                            </div>
                                                            <code className={`${className} font-mono text-sm`} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-white/10 rounded px-1.5 py-0.5 text-accent font-mono text-sm" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {analysis}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CodeSecurityAuditor;
