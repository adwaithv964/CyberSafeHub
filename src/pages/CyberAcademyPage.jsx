import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import Icon from '../components/Icon';
import PhishingTrainer from '../components/academy/PhishingTrainer';
import PasswordCracker from '../components/academy/PasswordCracker';
import EncryptionVisualizer from '../components/academy/EncryptionVisualizer';
import SteganographyPage from './SteganographyPage';
import IncidentSimulator from '../components/academy/IncidentSimulator';

const CyberAcademyPage = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();

    // Map moduleId to activeModule logic or just use moduleId directly
    const activeModule = moduleId;

    const modules = [
        {
            id: 'phishing',
            title: 'Phishing Simulation',
            description: 'Train your eyes to spot fake emails, sketchy links, and CEO fraud.',
            icon: 'shieldAlert',
            color: 'text-orange-500',
            borderColor: 'border-orange-500/50'
        },
        {
            id: 'cracker',
            title: 'Password Cracker',
            description: 'Visualize how fast a hacker can brute-force your passwords.',
            icon: 'lock',
            color: 'text-red-500',
            borderColor: 'border-red-500/50'
        },
        {
            id: 'crypto',
            title: 'Encryption Lab',
            description: 'Experiment with Caesar Ciphers, AES, and Hashing algorithms.',
            icon: 'fileText', // Using fileText as a temporary icon for crypto/code
            color: 'text-blue-500',
            borderColor: 'border-blue-500/50'
        },
        {
            id: 'stego',
            title: 'Steganography Studio',
            description: 'Learn how to hide secret messages inside standard image files.',
            icon: 'eyeOff',
            color: 'text-emerald-500',
            borderColor: 'border-emerald-500/50'
        },
        {
            id: 'incident',
            title: 'Incident Response RPG',
            description: 'Simulate a live cyber attack. You are the Admin. Can you save the servers?',
            icon: 'terminal',
            color: 'text-purple-500',
            borderColor: 'border-purple-500/50'
        }
    ];

    const renderModule = () => {
        switch (activeModule) {
            case 'phishing': return <PhishingTrainer />;
            case 'cracker': return <PasswordCracker />;
            case 'crypto': return <EncryptionVisualizer />;
            case 'stego': return <SteganographyPage />;
            case 'incident': return <IncidentSimulator />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <Header
                title="Cyber Academy"
                subtitle="Interactive simulations to master cybersecurity concepts."
            />

            {/* Navigation / Hub */}
            {activeModule ? (
                <div className="animate-fade-in">
                    <button
                        onClick={() => navigate('/academy')}
                        className="mb-6 flex items-center text-text-secondary hover:text-accent transition-colors"
                    >
                        <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                        Back to Academy Hub
                    </button>
                    <div className="bg-background/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 min-h-[600px]">
                        {renderModule()}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((mod) => (
                        <div
                            key={mod.id}
                            onClick={() => navigate(`/academy/${mod.id}`)}
                            className={`group cursor-pointer relative overflow-hidden bg-glass-gradient p-8 rounded-2xl border border-white/5 hover:border-accent/50 transition-all duration-300 hover:shadow-glow-accent hover:-translate-y-1`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon name={mod.icon} className="w-32 h-32" />
                            </div>

                            <div className={`w-14 h-14 rounded-full bg-background/50 flex items-center justify-center mb-6 border ${mod.borderColor}`}>
                                <Icon name={mod.icon} className={`w-8 h-8 ${mod.color}`} />
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-2">{mod.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed mb-6">{mod.description}</p>

                            <div className="flex items-center text-accent font-semibold text-sm group-hover:gap-2 transition-all">
                                Start Module <Icon name="arrowLeft" className="w-4 h-4 rotate-180 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CyberAcademyPage;
