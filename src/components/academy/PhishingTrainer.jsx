import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Icon from '../Icon';

const PhishingTrainer = () => {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState(null); // { isCorrect, message }
    const [completed, setCompleted] = useState(false);

    const scenarios = [
        {
            id: 1,
            sender: "Security Team <security-alert@g0ogle-support.com>",
            subject: "Irgnet: Your Password Expires in 24 Hours",
            body: "Dear User,\n\nYour account password will expire soon. Please click the link below to keep your current password.\n\n[Keep My Password]\n\nThank you,\nSecurity Team",
            isPhish: true,
            explanation: "Look at the sender address: 'g0ogle-support.com' is a fake domain (typo-squatting). Legitimate alerts come from google.com."
        },
        {
            id: 2,
            sender: "HR Department <hr@company.com>",
            subject: "Updated Holiday Policy",
            body: "Hi Team,\n\nPlease review the attached PDF regarding the new holiday carry-over policy for 2026.\n\nBest,\nHR",
            isPhish: false,
            explanation: "The sender domain matches the company domain, the tone is professional, and there are no urgent threats or suspicious links."
        },
        {
            id: 3,
            sender: "PayPal Service <service@paypal-billing-v2.net>",
            subject: "Receipt for your payment to EGaming Store ($499.00)",
            body: "You sent a payment of $499.00 USD to EGaming Store.\n\nIf you did not make this transaction, click here immediately to cancel and refund.\n\nTransaction ID: 8X99201L",
            isPhish: true,
            explanation: "Urgency ('click here immediately') and a strange domain ('paypal-billing-v2.net') are classic signs of a phishing attempt."
        },
        {
            id: 4,
            sender: "Netflix <info@mailer.netflix.com>",
            subject: "We've added a new show you might like",
            body: "Hi Jane,\n\n'Cyber Defenders' is now streaming. Watch it now on your device.\n\nSee you there,\nThe Netflix Team",
            isPhish: false,
            explanation: "This is a standard marketing email from a legitimate subdomain (mailer.netflix.com)."
        },
        {
            id: 5,
            sender: "CEO <ceo.urgent.task@gmail.com>",
            subject: "Urgent Wire Transfer Needed",
            body: "I am in a meeting and can't talk. I need you to process a wire transfer for a vendor immediately. I will explain later.\n\nSent from my iPhone",
            isPhish: true,
            explanation: "CEO Fraud! The CEO is using a personal Gmail address and creating fake urgency to bypass procedures."
        }
    ];

    const handleAnswer = (userSaysPhish) => {
        const scenario = scenarios[currentScenario];
        const isCorrect = userSaysPhish === scenario.isPhish;

        if (isCorrect) setScore(score + 1);

        setFeedback({
            isCorrect,
            message: scenario.explanation
        });
        setShowResult(true);
    };

    const nextScenario = () => {
        if (currentScenario < scenarios.length - 1) {
            setCurrentScenario(currentScenario + 1);
            setShowResult(false);
            setFeedback(null);
        } else {
            setCompleted(true);
        }
    };

    const reset = () => {
        setCurrentScenario(0);
        setScore(0);
        setCompleted(false);
        setShowResult(false);
        setFeedback(null);
    };

    if (completed) {
        return (
            <div className="text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-background/50 rounded-full flex items-center justify-center mx-auto border-4 border-accent">
                    <span className="text-4xl font-bold text-accent">{Math.round((score / scenarios.length) * 100)}%</span>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Training Complete!</h2>
                <p className="text-text-secondary">You identified {score} out of {scenarios.length} emails correctly.</p>
                <Button onClick={reset} variant="primary">Run Simulation Again</Button>
            </div>
        );
    }

    const email = scenarios[currentScenario];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center text-sm text-text-secondary">
                <span>Scenario {currentScenario + 1} of {scenarios.length}</span>
                <span>Current Score: {score}</span>
            </div>

            <Card className="p-0 overflow-hidden border border-white/10 shadow-2xl relative min-h-[400px]">
                {/* Fake Email Header */}
                <div className="bg-background/80 p-4 border-b border-white/5 space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="text-text-secondary w-16 text-right text-xs uppercase tracking-wider mt-1">From:</span>
                        <span className="font-mono text-sm bg-black/30 px-2 py-1 rounded text-text-primary break-all">{email.sender}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-text-secondary w-16 text-right text-xs uppercase tracking-wider mt-1">Subject:</span>
                        <span className="font-bold text-text-primary">{email.subject}</span>
                    </div>
                </div>

                {/* Email Body */}
                <div className="p-6 whitespace-pre-wrap font-serif text-text-primary/90 leading-relaxed min-h-[200px]">
                    {email.body}
                </div>

                {/* Actions (Overlay when Result shown) */}
                {showResult && (
                    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                        <div className="bg-background border border-white/10 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
                            <div className={`flex items-center gap-3 text-xl font-bold ${feedback.isCorrect ? 'text-success' : 'text-danger'}`}>
                                <Icon name={feedback.isCorrect ? "checkCircle" : "x"} className="w-8 h-8" />
                                {feedback.isCorrect ? "Correct Analysis!" : "Incorrect Analysis"}
                            </div>
                            <p className="text-text-secondary leading-relaxed border-l-2 border-accent/50 pl-4">
                                {feedback.message}
                            </p>
                            <Button onClick={nextScenario} className="w-full mt-4">Next Email <Icon name="arrowLeft" className="w-4 h-4 ml-2 rotate-180" /></Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleAnswer(false)}
                    disabled={showResult}
                    className="p-4 rounded-xl border border-success/30 bg-success/10 hover:bg-success/20 transition-all flex flex-col items-center gap-2 group disabled:opacity-50"
                >
                    <Icon name="checkCircle" className="w-8 h-8 text-success group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-success">Mark as SAFE</span>
                </button>

                <button
                    onClick={() => handleAnswer(true)}
                    disabled={showResult}
                    className="p-4 rounded-xl border border-danger/30 bg-danger/10 hover:bg-danger/20 transition-all flex flex-col items-center gap-2 group disabled:opacity-50"
                >
                    <Icon name="shieldAlert" className="w-8 h-8 text-danger group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-danger">Report as PHISHING</span>
                </button>
            </div>
        </div>
    );
};

export default PhishingTrainer;
