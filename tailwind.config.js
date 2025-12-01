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
        'background': '#0D1117',
        'primary': '#161B22',
        'secondary': '#21262D',
        'accent': {
          DEFAULT: '#00A8E8',
          hover: '#007EA7',
          glow: 'rgba(0, 168, 232, 0.5)',
        },
        'success': '#3FB950',
        'warning': '#F8E71C',
        'danger': '#F85149',
        'text-primary': '#C9D1D9',
        'text-secondary': '#8B949E',
        'border-color': '#30363D',
      },
      boxShadow: {
        'glow-accent': '0 0 15px rgba(0, 168, 232, 0.4)',
        'glow-danger': '0 0 15px rgba(248, 81, 73, 0.5)',
        'glow-success': '0 0 15px rgba(63, 185, 80, 0.5)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-in-out',
      },
    },
  },
  plugins: [],
}