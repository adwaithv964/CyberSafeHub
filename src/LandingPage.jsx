import React from 'react';
import { motion } from 'framer-motion';

const TypingText = ({ text, delay = 0 }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: i * delay },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const LandingPage = ({ onEnter }) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-background overflow-hidden">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 bg-black opacity-70 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0, 168, 232, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 168, 232, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            animation: 'pan 60s linear infinite',
          }}
        ></div>
      </div>

      <div className="relative z-10 text-center flex flex-col items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent drop-shadow-[0_0_10px_rgba(0,168,232,0.8)]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <TypingText text="CyberSafeHub" />
        </h1>

        <motion.p
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
        >
          Your AI-powered guardian in the digital world. Analyze threats, secure your data, and stay one step ahead.
        </motion.p>

        <motion.button
          onClick={onEnter}
          className="px-8 py-4 bg-accent text-background font-bold rounded-lg text-lg tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent-glow shadow-lg shadow-accent-glow"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2, type: 'spring' }}
        >
          Secure The System
        </motion.button>
      </div>
    </div>
  );
};