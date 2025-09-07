/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Xinfinity brand colors from logo
        xinfinity: {
          'blue-900': '#1e3a8a',
          'blue-800': '#1e40af',
          'cyan-500': '#06b6d4',
          'blue-500': '#3b82f6',
          'primary': '#1e40af',
          'primary-light': '#3b82f6',
          'secondary': '#06b6d4',
          'secondary-light': '#0891b2',
          'accent': '#1e3a8a',
          'accent-light': '#1d4ed8',
        },
        // Extended neutral palette
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Fibonacci-based spacing
        '1': '0.125rem',    // 2px
        '2': '0.25rem',     // 4px
        '3': '0.375rem',    // 6px
        '5': '0.5rem',      // 8px
        '8': '0.8rem',      // 13px
        '13': '1.3rem',     // 21px
        '21': '2.1rem',     // 34px
        '34': '3.4rem',     // 55px
        '55': '5.5rem',     // 89px
        '89': '8.9rem',     // 144px
      },
      borderRadius: {
        // Fibonacci-based border radius
        '1': '0.125rem',    // 2px
        '2': '0.25rem',     // 4px
        '3': '0.375rem',    // 6px
        '5': '0.5rem',      // 8px
        '8': '0.8rem',      // 13px
        '13': '1.3rem',     // 21px
        '21': '2.1rem',     // 34px
      },
      maxWidth: {
        'fibonacci': '89rem', // 1424px - Fibonacci container
      },
      gridTemplateColumns: {
        'fibonacci-2': '1fr 1.618fr',
        'fibonacci-3': '1fr 1.618fr 2.618fr',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'glass': '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(30, 64, 175, 0.12)',
        'xinfinity': '0 4px 12px rgba(30, 64, 175, 0.2)',
        'xinfinity-lg': '0 12px 40px rgba(30, 64, 175, 0.25)',
      }
    },
  },
  plugins: [],
}
