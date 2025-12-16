import React from 'react';
import Icon from './Icon';

const Card = ({ children, className = '', title, icon, headerAction }) => (
    <div className={`glass-card relative overflow-hidden ${className}`}>
        {(title || icon) && (
            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-secondary/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <Icon name={icon} className="w-5 h-5" />
                        </div>
                    )}
                    {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
                </div>
                {headerAction && <div>{headerAction}</div>}
            </div>
        )}
        <div className={title || icon ? 'p-6' : ''}>
            {children}
        </div>
    </div>
);

export default Card;
