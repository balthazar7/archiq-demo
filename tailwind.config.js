/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Police sous-titre — Agency FB avec fallbacks web-safe
        // Pour activer: ajouter @font-face dans index.css
        'archi-sub': ['"Agency FB"', '"Arial Narrow"', 'Helvetica', 'sans-serif'],
      },
      colors: {
        brand: {
          hp:    '#98ae12',
          ing:   '#9d62a5',
          archi: '#ee343d',
          urb:   '#0e7f40',
          art:   '#985a15',
          vis:   '#325497',
        },
      },
      animation: {
        'pulse-fast': 'pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
