import React from 'react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-primary border border-border-color rounded-xl shadow-lg ${className}`}>
        {children}
    </div>
);

export default Card;
