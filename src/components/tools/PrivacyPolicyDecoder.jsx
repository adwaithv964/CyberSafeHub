import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { callGeminiAPI } from '../../utils/geminiApi';

const PrivacyPolicyDecoder = () => {
    const navigate = useNavigate();
    const [policyText, setPolicyText] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const handleDecode = async () => {
        if (!policyText.trim()) return;

        setIsAnalyzing(true);
        setError('');
        setAnalysis('');

        try {
            const systemPrompt = `Keep the tone clear and non-legalese. Use emojis to make it engaging.
            
            Format Requirements:
            - Use ## Headers for sections.
            - Use > Blockquotes for the 1-sentence summary.
            - Use - Bullet points for lists (CRITICAL).
            - Use **Bold** for key terms, followed by a normal description.
            - Add a blank line between every bullet point for readability.
            
            Sections:
            
            ## 🔍 Verdict
            > A 1-sentence plain English summary of the policy.
            
            ## 🚩 Red Flags
            - **[Flag Name]**: Explanation of why it's bad.
            (e.g., - **Forced Arbitration**: You cannot sue them in court.)
            
            ## 👁️ Data Collection
            - **[Data Type]**: Why they want it.
            
            ## 🤝 Third Parties
            - **[Entity Type]**: Who gets your data.
            
            ## ✅ Privacy Score
            **[X]/10** - [Short explanation]`;

            const userPrompt = `Please decode this privacy policy:\n\n${policyText.slice(0, 15000)}`; // Truncate to avoid huge token usage if pasted text is massive

            const response = await callGeminiAPI([{ sender: 'user', text: userPrompt }], systemPrompt);
            setAnalysis(response);
        } catch (err) {
            console.error("Decode failed:", err);
            setError("Failed to decode policy. Please check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <Header title="Privacy Policy Decoder" subtitle="AI-powered analysis to reveal what you are actually agreeing to." />

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
                                <Icon name="fileText" className="w-5 h-5 text-accent" /> Paste Legal Text
                            </h3>
                            <textarea
                                value={policyText}
                                onChange={(e) => setPolicyText(e.target.value)}
                                placeholder="Paste the Privacy Policy or Terms of Service here..."
                                className="flex-grow w-full bg-black/20 text-text-primary text-sm p-4 rounded-lg border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent resize-none custom-scrollbar"
                            />
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={handleDecode}
                                    disabled={!policyText.trim() || isAnalyzing}
                                    variant="primary"
                                    className="w-full md:w-auto"
                                >
                                    {isAnalyzing ? (
                                        <><Icon name="refreshCw" className="w-5 h-5 animate-spin mr-2" /> Decoding...</>
                                    ) : (
                                        <><Icon name="search" className="w-5 h-5 mr-2" /> Reveal Truth</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-glass-panel p-4 rounded-xl border border-glass-border flex-grow flex flex-col shadow-lg bg-secondary/90 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Icon name="shieldCheck" className="w-5 h-5 text-accent" /> Decoder Report
                            </h3>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 p-2 rounded-lg bg-background/30 border border-white/5">
                                {!analysis && !isAnalyzing && !error && (
                                    <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-60">
                                        <Icon name="book" className="w-16 h-16 mb-4" />
                                        <p>Paste text and click 'Reveal Truth'</p>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="h-full flex flex-col items-center justify-center text-accent animate-pulse">
                                        <Icon name="activity" className="w-16 h-16 mb-4" />
                                        <p>Reading the fine print...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="h-full flex flex-col items-center justify-center text-danger">
                                        <Icon name="alertTriangle" className="w-16 h-16 mb-4" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {analysis && (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-accent mt-6 mb-3 border-b border-white/10 pb-2" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="space-y-3 my-4" {...props} />,
                                                li: ({ node, ...props }) => <li className="ml-4 list-disc text-gray-300" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-accent pl-4 py-2 my-4 bg-accent/5 italic text-gray-300 rounded-r" {...props} />
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

export default PrivacyPolicyDecoder;
