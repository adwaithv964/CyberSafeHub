import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Icon from '../components/Icon';
import PhishingTrainer from '../components/academy/PhishingTrainer';
import PasswordCracker from '../components/academy/PasswordCracker';
import EncryptionVisualizer from '../components/academy/EncryptionVisualizer';
import SteganographyPage from './SteganographyPage';
import IncidentSimulator from '../components/academy/IncidentSimulator';
import { API_BASE_URL } from '../config';

// Map route IDs → interactive React components (built-in interactive labs)
const INTERACTIVE_RENDERERS = {
    phishing: () => <PhishingTrainer />,
    cracker: () => <PasswordCracker />,
    crypto: () => <EncryptionVisualizer />,
    stego: () => <SteganographyPage />,
    incident: () => <IncidentSimulator />,
};

// Card colour schemes cycled by module index
const CARD_COLORS = [
    { text: 'text-orange-500', border: 'border-orange-500/50', icon: 'shieldAlert' },
    { text: 'text-red-500', border: 'border-red-500/50', icon: 'lock' },
    { text: 'text-blue-500', border: 'border-blue-500/50', icon: 'fileText' },
    { text: 'text-emerald-500', border: 'border-emerald-500/50', icon: 'eyeOff' },
    { text: 'text-purple-500', border: 'border-purple-500/50', icon: 'terminal' },
    { text: 'text-cyan-500', border: 'border-cyan-500/50', icon: 'code' },
    { text: 'text-yellow-500', border: 'border-yellow-500/50', icon: 'book' },
    { text: 'text-pink-500', border: 'border-pink-500/50', icon: 'activity' },
];

const CyberAcademyPage = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();

    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/academy`)
            .then(r => r.json())
            .then(data => setModules(data.modules || []))
            .catch(() => setModules([]))
            .finally(() => setLoading(false));
    }, []);

    // Find the active module doc from URL param
    const activeDoc = moduleId
        ? modules.find(m => m.route === moduleId || m._id === moduleId)
        : null;
    const routeKey = activeDoc?.route || moduleId;
    const Renderer = routeKey ? INTERACTIVE_RENDERERS[routeKey] : null;

    return (
        <div className="space-y-8">
            <Header
                title="Cyber Academy"
                subtitle="Interactive simulations to master cybersecurity concepts."
            />

            {moduleId ? (
                // ── Module view ──────────────────────────────────────────────
                <div className="animate-fade-in">
                    <button
                        onClick={() => navigate('/academy')}
                        className="mb-6 flex items-center text-text-secondary hover:text-accent transition-colors"
                    >
                        <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                        Back to Academy Hub
                    </button>
                    <div className="bg-background/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 min-h-[600px]">
                        {Renderer ? <Renderer /> : (
                            <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                                <span className="text-5xl mb-4">{activeDoc?.icon || '📚'}</span>
                                <h3 className="text-xl font-bold text-text-primary mb-2">{activeDoc?.title || 'Module'}</h3>
                                <p className="text-sm opacity-70">Interactive content for this module is coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // ── Hub grid ─────────────────────────────────────────────────
                <>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                        </div>
                    ) : modules.length === 0 ? (
                        <div className="text-center py-16 text-text-secondary opacity-60">
                            <Icon name="book" className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-lg font-semibold">No modules published yet</p>
                            <p className="text-sm">Check back soon — new modules are coming.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {modules.map((mod, i) => {
                                const cc = CARD_COLORS[i % CARD_COLORS.length];
                                const routeTo = mod.route || mod._id;
                                const hasInteractive = !!INTERACTIVE_RENDERERS[routeTo];
                                return (
                                    <div
                                        key={mod._id}
                                        onClick={() => navigate(`/academy/${routeTo}`)}
                                        className="group cursor-pointer relative overflow-hidden bg-glass-gradient p-8 rounded-2xl border border-white/5 hover:border-accent/50 transition-all duration-300 hover:shadow-glow-accent hover:-translate-y-1"
                                    >
                                        {/* Faded background icon */}
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Icon name={cc.icon} className="w-32 h-32" />
                                        </div>

                                        {/* Icon circle */}
                                        <div className={`w-14 h-14 rounded-full bg-background/50 flex items-center justify-center mb-6 border ${cc.border} text-3xl`}>
                                            {mod.icon && mod.icon.length <= 2
                                                ? <span>{mod.icon}</span>
                                                : <Icon name={cc.icon} className={`w-8 h-8 ${cc.text}`} />
                                            }
                                        </div>

                                        <h3 className="text-xl font-bold text-text-primary mb-2">{mod.title}</h3>
                                        <p className="text-text-secondary text-sm leading-relaxed mb-4">{mod.description}</p>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {mod.difficulty && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${mod.difficulty === 'beginner' ? 'text-success border-success/30 bg-success/10' :
                                                        mod.difficulty === 'intermediate' ? 'text-warning border-warning/30 bg-warning/10' :
                                                            'text-danger border-danger/30 bg-danger/10'
                                                    }`}>{mod.difficulty}</span>
                                            )}
                                            {mod.category && (
                                                <span className="text-xs px-2 py-0.5 rounded-full border border-glass-border text-text-secondary">{mod.category}</span>
                                            )}
                                        </div>

                                        <div className={`flex items-center font-semibold text-sm group-hover:gap-2 transition-all ${hasInteractive ? 'text-accent' : 'text-text-secondary'}`}>
                                            {hasInteractive ? 'Start Module' : 'View Module'}
                                            <Icon name="arrowLeft" className="w-4 h-4 rotate-180 ml-1" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CyberAcademyPage;
