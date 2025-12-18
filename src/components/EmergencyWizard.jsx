
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const EmergencyWizard = ({ guide, onBack, panicMode }) => {
    const [completedSteps, setCompletedSteps] = useState([]);

    const toggleStep = (stepId) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(completedSteps.filter(id => id !== stepId));
        } else {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    const progress = Math.round((completedSteps.length / guide.steps.length) * 100);

    return (
        <div className={`rounded-3xl shadow-xl overflow-hidden animate-fade-in ${panicMode ? 'bg-red-50 dark:bg-gray-900 border-4 border-red-500' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
            {/* Header */}
            <div className={`p-8 ${panicMode ? 'bg-red-600 text-white' : 'bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700'}`}>
                <button
                    onClick={onBack}
                    className={`flex items-center gap-2 font-semibold mb-4 transition-colors ${panicMode ? 'text-white hover:text-red-100' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}
                >
                    <Icon name="arrowLeft" className="w-5 h-5" />
                    Back to Guides
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className={`font-bold ${panicMode ? 'text-4xl' : 'text-3xl text-gray-800 dark:text-gray-100'}`}>
                            {guide.title}
                        </h2>
                        <p className={`mt-2 ${panicMode ? 'text-red-100 text-xl' : 'text-gray-500 dark:text-gray-400'}`}>
                            {guide.description}
                        </p>
                    </div>

                    {/* Progress Circle */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className={panicMode ? 'text-red-800' : 'text-gray-200 dark:text-gray-700'} />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none"
                                className={panicMode ? 'text-white' : 'text-green-500'}
                                strokeDasharray={175}
                                strokeDashoffset={175 - (175 * progress) / 100}
                                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                            />
                        </svg>
                        <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${panicMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                            {progress}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Content */}
            <div className="p-8 space-y-6">
                {guide.steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    return (
                        <div
                            key={step.id}
                            onClick={() => toggleStep(step.id)}
                            className={`
                                relative p-6 rounded-xl border-2 transition-all cursor-pointer select-none group
                                ${isCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 opacity-75'
                                    : panicMode
                                        ? 'bg-white dark:bg-gray-800 border-red-200 hover:border-red-500'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${isCompleted
                                        ? 'bg-green-500 text-white'
                                        : panicMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                    }
                                `}>
                                    {isCompleted ? <Icon name="checkCircle" className="w-5 h-5" /> : index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-green-800 dark:text-green-300 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                                        {step.title}
                                    </h4>
                                    <p className={`${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'} ${panicMode ? 'text-lg' : ''}`}>
                                        {step.content}
                                    </p>
                                </div>
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {isCompleted && <Icon name="checkCircle" className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Completion Actions */}
            {progress === 100 && (
                <div className="p-8 bg-green-50 dark:bg-green-900/20 text-center animate-bounce-in">
                    <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-800 mb-4">
                        <Icon name="checkCircle" className="w-12 h-12 text-green-600 dark:text-green-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">All Steps Completed!</h3>
                    <p className="text-green-700 dark:text-green-300 mb-6">You've taken the right steps to secure your safety.</p>
                    <button onClick={onBack} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg">
                        Return to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmergencyWizard;
