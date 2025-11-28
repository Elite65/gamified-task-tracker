/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tech: {
          bg: '#050510',
          primary: '#00f3ff',
          secondary: '#bc13fe',
          accent: '#f59e0b',
          surface: 'rgba(255, 255, 255, 0.05)',
          'surface-hover': 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(0, 243, 255, 0.2)',
          'border-active': 'rgba(0, 243, 255, 0.6)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
