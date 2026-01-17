import React from 'react';

const Header = ({ title, subtitle }) => (
    <header className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-1">{title}</h2>
        <p className="text-text-secondary">{subtitle}</p>
    </header>
);

export default Header;
