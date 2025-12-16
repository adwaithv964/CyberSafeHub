import React from 'react';

const BackgroundBlobs = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Large primary blob - Deep Blue/Cyan */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/40 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDuration: '10s' }}></div>

            {/* Secondary blob - Cyan */}
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-900/30 rounded-full blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '2s', animationDuration: '15s' }}></div>

            {/* Bottom blob - Indigo */}
            <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[130px] mix-blend-screen animate-float" style={{ animationDelay: '5s', animationDuration: '20s' }}></div>

            {/* Small accent blobs - Sparkles */}
            <div className="absolute top-1/2 left-10 w-32 h-32 bg-sky-500/20 rounded-full blur-[50px] animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
    );
};

export default BackgroundBlobs;
