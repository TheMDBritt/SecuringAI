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
        // Primary brand accent. Was default Tailwind blue-500, which is the
        // house colour of roughly every developer tool ever shipped. This ramp
        // is an aqua that holds its own against the navy ground, stays clearly
        // separable from the emerald used for PASS, and is the one hue allowed
        // to mean "interactive" anywhere in the product.
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        surface: {
          DEFAULT: '#0b1120',
          card: '#111a2e',
          raised: '#16223a',
          border: '#24324d',
        },
        // State only. These never appear decoratively; if something is one of
        // these colours it is reporting an outcome.
        state: {
          pass: '#10b981',
          warn: '#f59e0b',
          fail: '#ef4444',
        },
      },
      fontSize: {
        // A real scale. The app had nine hand-picked pixel sizes (8, 9, 10, 11,
        // 12, 13, 15) sitting alongside Tailwind's named steps, which is what a
        // design without a type system looks like. Two steps below xs cover the
        // dense label sizes this UI genuinely needs, and 8px and 9px are gone:
        // no interface text should be that small.
        micro: ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.01em' }],
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        // Display steps, so headline sizes are named rather than hand-picked
        // per page. The hero used 38/54, About used 40, cards used 28/32.
        'display-sm': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.022em' }],
        'display-lg': ['3.375rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 0 rgba(0,0,0,0.20)',
        elevated: '0 10px 30px -12px rgba(2,8,23,0.75), 0 4px 12px -4px rgba(2,8,23,0.5)',
        glow: '0 0 0 1px rgba(34,211,238,0.30), 0 8px 24px -8px rgba(34,211,238,0.30)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.045) 1px, transparent 1px)',
        'brand-radial':
          'radial-gradient(60% 60% at 50% 0%, rgba(6,182,212,0.13) 0%, rgba(34,211,238,0.05) 42%, transparent 75%)',
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
