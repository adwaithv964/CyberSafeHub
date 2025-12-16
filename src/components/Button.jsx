import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, variant = 'primary' }) => {
    const baseClasses = 'px-5 py-2 font-bold rounded-lg tracking-wide uppercase transition-all duration-300 transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100';
    const variantClasses = {
        primary: 'bg-accent text-background shadow-md shadow-accent-glow hover:bg-accent-hover focus:ring-4 focus:ring-accent-glow',
        secondary: 'bg-secondary text-text-primary hover:bg-border-color',
        danger: 'bg-danger text-white shadow-md shadow-glow-danger hover:bg-red-700 focus:ring-4 focus:ring-red-400/50',
        success: 'bg-success text-white shadow-md shadow-glow-success hover:bg-green-700 focus:ring-4 focus:ring-green-400/50',
        glass: 'glass-button'
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </button>
    );
};

export default Button;
