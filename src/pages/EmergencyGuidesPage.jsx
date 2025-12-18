import React, { useState } from 'react';
import Icon from '../components/Icon';
import EmergencyGuideCard from '../components/EmergencyGuideCard';
import EmergencyWizard from '../components/EmergencyWizard';
import EmergencyContacts from '../components/EmergencyContacts';
import { emergencyGuides } from '../utils/emergencyData';

const EmergencyGuidesPage = () => {
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [panicMode, setPanicMode] = useState(false);

    const filteredGuides = emergencyGuides.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`min-h-screen transition-colors duration-500 ${panicMode ? 'bg-red-50/50 dark:bg-black' : ''}`}>

            {/* Header Section */}
            {!selectedGuide && (
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className={`text-3xl font-bold ${panicMode ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>
                                "What to Do If..."
                            </h2>
                            {panicMode && (
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
                                    Panic Mode Active
                                </span>
                            )}
                        </div>
                        <p className={`text-gray-500 dark:text-gray-400 ${panicMode ? 'hidden' : 'block'}`}>
                            Step-by-step guides for common cybersecurity emergencies.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPanicMode(!panicMode)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-lg transition-all transform hover:scale-105
                                ${panicMode
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/30'
                                }
                            `}
                        >
                            <Icon name={panicMode ? "shieldCheck" : "shieldAlert"} className="w-5 h-5" />
                            {panicMode ? 'Exit Panic Mode' : 'Panic Mode'}
                        </button>
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Guides or Wizard */}
                <div className="lg:col-span-3">
                    {selectedGuide ? (
                        <EmergencyWizard
                            guide={selectedGuide}
                            onBack={() => setSelectedGuide(null)}
                            panicMode={panicMode}
                        />
                    ) : (
                        <>
                            {/* Search Bar */}
                            <div className="relative mb-8">
                                <Icon name="scan" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Describe your emergency (e.g., 'ransomware', 'hacked')..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`
                                        w-full pl-12 pr-4 py-4 rounded-xl text-lg outline-none border transition-all
                                        ${panicMode
                                            ? 'bg-white border-red-300 text-red-900 placeholder-red-300 focus:ring-4 focus:ring-red-500/20'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                        }
                                    `}
                                />
                            </div>

                            {/* Grid of Guides */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredGuides.map(guide => (
                                    <EmergencyGuideCard
                                        key={guide.id}
                                        guide={guide}
                                        onClick={setSelectedGuide}
                                        panicMode={panicMode}
                                    />
                                ))}
                                {filteredGuides.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Icon name="search" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">No guides found matching "{searchTerm}"</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Sidebar (Contacts & Quick Actions) */}
                <div className="space-y-6">
                    <EmergencyContacts />

                    {/* Quick Tips Card */}
                    {!panicMode && (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <Icon name="lightbulb" className="w-5 h-5" />
                                Pro Tip
                            </h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Most security incidents can be contained if you act quickly. Don't panic—follow the steps carefully.
                            </p>
                            <div className="text-xs font-mono bg-blue-800/30 p-3 rounded border border-blue-500/30">
                                Global Emergency: 112 / 911 <br />
                                Cyber Crime: ic3.gov
                            </div>
                        </div>
                    )}

                    {/* Panic Mode Explanation (Only visible when NOT in panic mode) */}
                    {!panicMode && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                                    <Icon name="shieldAlert" className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">What is Panic Mode?</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Simplifies the interface and highlights critical actions for high-stress situations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EmergencyGuidesPage;
