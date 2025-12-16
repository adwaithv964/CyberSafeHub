/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Share Tech Mono"', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        'background': '#020617', // Slate-950 for deep cyber darkness
        'primary': 'rgba(15, 23, 42, 0.8)', // Slate-900
        'secondary': 'rgba(30, 41, 59, 0.7)', // Slate-800
        'glass': {
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(56, 189, 248, 0.2)', // Sky-400
        },
        'accent': {
          DEFAULT: '#06b6d4', // Cyan-500
          hover: '#0891b2', // Cyan-600
          glow: 'rgba(6, 182, 212, 0.5)',
        },
        'success': '#10b981', // Emerald-500
        'warning': '#f59e0b', // Amber-500
        'danger': '#ef4444', // Red-500 (standard red, not pink)
        'text-primary': '#f1f5f9', // Slate-100
        'text-secondary': '#94a3b8', // Slate-400
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-accent': '0 0 20px rgba(0, 210, 255, 0.4)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        moveGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-in-out',
        float: 'float 6s ease-in-out infinite',
        gradient: 'moveGradient 15s ease infinite',
      },
    },
  },
  plugins: [],
}