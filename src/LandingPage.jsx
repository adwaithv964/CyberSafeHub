import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import ThemedModal from './components/ThemedModal';
import Input from './components/Input';
import Button from './components/Button';
import Icon from './components/Icon';

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

export const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA State
  const [showMfa, setShowMfa] = useState(false);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaCode, setMfaCode] = useState('');

  const { login, signup, googleSignIn, getMultiFactorResolver, mfaResolveSignIn } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err) {
      if (err.code === 'auth/multi-factor-auth-required') {
        setMfaResolver(getMultiFactorResolver(err));
        setShowMfa(true);
        setShowLogin(false); // Close generic login modal
        setError('');
      } else {
        setError('Failed to log in: ' + err.message);
      }
    }
    setLoading(false);
  }

  async function handleMfaSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      // Use the first hint (assuming single MFA enrollment for now)
      const hint = mfaResolver.hints[0];
      await mfaResolveSignIn(mfaResolver, hint.uid, mfaCode);
      setShowMfa(false);
      setMfaResolver(null);
      // Auth state change will trigger redirect/app load via AuthContext
    } catch (err) {
      setError('MFA Verification failed: ' + err.message);
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
    } catch (err) {
      setError('Failed to sign in with Google: ' + err.message);
    }
    setLoading(false);
  }

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
    setError('');
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
    setError('');
  };

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
          <Icon name="shield" className="w-24 h-24 text-accent drop-shadow-[0_0_10px_rgba(0,168,232,0.8)]" />
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
          onClick={openLogin}
          className="px-8 py-4 bg-accent text-background font-bold rounded-lg text-lg tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent-glow shadow-lg shadow-accent-glow"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2, type: 'spring' }}
        >
          Secure The System
        </motion.button>
      </div>

      {/* Login Modal */}
      <ThemedModal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Access Control">
        {error && <div className="bg-danger/20 text-danger p-3 rounded mb-4 text-sm mix-blend-screen">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@cybersafe.com"
            icon="user"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon="lock"
            required
          />
          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
              Login with Google
            </Button>
          </div>
          <div className="text-center mt-4">
            <span className="text-text-secondary text-sm">New Agent? </span>
            <button type="button" onClick={openRegister} className="text-accent hover:underline text-sm">
              Register Protocol
            </button>
          </div>
        </form>
      </ThemedModal>

      {/* Register Modal */}
      <ThemedModal isOpen={showRegister} onClose={() => setShowRegister(false)} title="New Agent Registration">
        {error && <div className="bg-danger/20 text-danger p-3 rounded mb-4 text-sm mix-blend-screen">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@cybersafe.com"
            icon="user"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon="lock"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="••••••••"
            icon="lock"
            required
          />
          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
              Register with Google
            </Button>
          </div>
          <div className="text-center mt-4">
            <span className="text-text-secondary text-sm">Already verified? </span>
            <button type="button" onClick={openLogin} className="text-accent hover:underline text-sm">
              Login Protocol
            </button>
          </div>
        </form>
      </ThemedModal>

      {/* MFA Verification Modal */}
      <ThemedModal isOpen={showMfa} onClose={() => { setShowMfa(false); setMfaResolver(null); }} title="Security Verification">
        {error && <div className="bg-danger/20 text-danger p-3 rounded mb-4 text-sm mix-blend-screen">{error}</div>}
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <Icon name="shield" className="w-16 h-16 text-accent mb-4" />
            <p className="text-center text-text-secondary mb-4">
              Enter the 6-digit code from your authenticator app to verify your identity.
            </p>
            <Input
              label="Verification Code"
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              icon="lock"
              required
              className="text-center tracking-[0.5em] font-mono text-xl"
            />
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setShowMfa(false); openLogin(); }} disabled={loading} className="w-full">
              Back to Login
            </Button>
          </div>
        </form>
      </ThemedModal>
    </div >
  );
};
