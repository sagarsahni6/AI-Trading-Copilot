import type { Config } from 'tailwindcss';

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: number }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

const config: Config = {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: withOpacity('--text-white-rgb'),
        // Primary palette
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Success (bullish)
        bullish: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.3)',
        },
        // Danger (bearish)
        bearish: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          glow: 'rgba(239, 68, 68, 0.3)',
        },
        // Neutral (sideways)
        sideways: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.3)',
        },
        // Surface colors for glassmorphism
        surface: {
          50: 'rgba(var(--surface-rgb), 0.05)',
          100: 'rgba(var(--surface-rgb), 0.08)',
          200: 'rgba(var(--surface-rgb), 0.12)',
          300: 'rgba(var(--surface-rgb), 0.16)',
          400: 'rgba(var(--surface-rgb), 0.24)',
        },
        // Dark backgrounds
        dark: {
          DEFAULT: withOpacity('--bg-primary-rgb'),
          50: withOpacity('--bg-secondary-rgb'),
          100: withOpacity('--bg-dark-100-rgb'),
          200: withOpacity('--bg-dark-200-rgb'),
          300: withOpacity('--bg-dark-300-rgb'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-bullish': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-bearish': '0 0 20px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'score-fill': 'scoreFill 1s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
