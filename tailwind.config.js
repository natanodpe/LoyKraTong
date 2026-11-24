/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#070b14',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155'
        },
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309'
        },
        candle: '#FFE29A',
        lotus: {
          light: '#FBCFE8',
          pink: '#F472B6',
          dark: '#DB2777'
        }
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', '"Sarabun"', 'sans-serif'],
        display: ['"Prompt"', '"Noto Sans Thai"', 'sans-serif']
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'flicker': 'candleFlicker 0.8s ease-in-out infinite alternate',
        'lantern-drift': 'lanternDrift 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        },
        candleFlicker: {
          '0%': { opacity: '0.9', transform: 'scale(1)' },
          '100%': { opacity: '1', transform: 'scale(1.15)' }
        },
        lanternDrift: {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, -40px)' },
          '100%': { transform: 'translate(20px, -80px)' }
        }
      }
    },
  },
  plugins: [],
}
