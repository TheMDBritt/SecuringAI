import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise deep-navy surface scale (bluer, richer than default slate)
        navy: {
          950: '#070c17',
          900: '#0b1120',
          850: '#0f1729',
          800: '#131d33',
          700: '#1c2942',
        },
        // Cyber blue, primary brand accent
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#0b1120',
          card: '#111a2e',
          raised: '#16223a',
          border: '#24324d',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          emerald: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 0 rgba(0,0,0,0.20)',
        elevated: '0 10px 30px -12px rgba(2,8,23,0.75), 0 4px 12px -4px rgba(2,8,23,0.5)',
        glow: '0 0 0 1px rgba(59,130,246,0.35), 0 8px 24px -8px rgba(59,130,246,0.35)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.045) 1px, transparent 1px)',
        'brand-radial':
          'radial-gradient(60% 60% at 50% 0%, rgba(37,99,235,0.14) 0%, rgba(6,182,212,0.05) 40%, transparent 75%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'grow-x': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-fast': 'fade-in-fast 0.25s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
