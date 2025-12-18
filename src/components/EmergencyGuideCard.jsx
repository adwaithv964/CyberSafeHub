
import React from 'react';
import Icon from './Icon';

const EmergencyGuideCard = ({ guide, onClick, panicMode }) => {
    const severityColors = {
        low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };

    return (
        <button
            onClick={() => onClick(guide)}
            className={`group text-left p-6 rounded-2xl shadow-sm border transition-all duration-300 relative overflow-hidden
                ${panicMode ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 hover:scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md'}
            `}
        >
            <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${severityColors[guide.severity]}`}>
                {guide.severity}
            </div>

            <Icon
                name={guide.icon}
                className={`w-10 h-10 mb-4 transition-transform group-hover:scale-110 duration-300 
                    ${panicMode ? 'text-red-600 dark:text-red-500' : 'text-' + guide.color + '-500'}
                `}
            />

            <h3 className={`font-bold text-xl mb-2 ${panicMode ? 'text-red-900 dark:text-red-100 text-2xl' : 'text-gray-800 dark:text-gray-100'}`}>
                {guide.title}
            </h3>

            <p className={`${panicMode ? 'text-red-800 dark:text-red-200 text-lg' : 'text-gray-500 dark:text-gray-400 text-sm'}`}>
                {guide.description}
            </p>

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Start Guide <Icon name="arrowLeft" className="w-4 h-4 ml-1 rotate-180" />
            </div>
        </button>
    );
};

export default EmergencyGuideCard;
