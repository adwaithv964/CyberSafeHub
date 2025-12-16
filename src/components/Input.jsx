import React from 'react';
import Icon from './Icon';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon, required = false, error }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-text-secondary text-sm font-bold mb-2">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name={icon} className="h-5 w-5 text-gray-500" />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full glass-input block p-2.5 ${icon ? 'pl-10' : ''} ${error ? 'border-danger' : ''} transition-all duration-200 outline-none`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
};

export default Input;
