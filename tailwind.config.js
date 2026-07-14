import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Absolute content globs so Tailwind scans correctly regardless of the
// process CWD (dev servers may be launched from a parent directory).
const here = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [resolve(here, 'index.html'), resolve(here, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d5cdff',
          300: '#b7a6ff',
          400: '#9575ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1673',
        },
        accent: {
          pink: '#ff5db1',
          orange: '#ff9f45',
          teal: '#2dd4bf',
          sky: '#38bdf8',
          amber: '#fbbf24',
        },
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(80, 40, 160, 0.28)',
        glow: '0 10px 40px -8px rgba(124, 58, 237, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop': 'pop 0.35s ease-out both',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
