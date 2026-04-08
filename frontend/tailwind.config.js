/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:  '#0B0F14',
        panel:   '#111827',
        surface: '#1a2233',
        border:  'rgba(255,255,255,0.08)',
        risk: {
          red:    '#EF4444',
          yellow: '#F59E0B',
          green:  '#10B981',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
