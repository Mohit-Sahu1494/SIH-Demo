/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        mission: {
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderLight: '#F1F5F9',
          text: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          accent: '#0284C7',
          accentHover: '#0369A1',
          accentLight: '#E0F2FE',
        },
        status: {
          healthy: '#10B981',
          healthyBg: '#ECFDF5',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          critical: '#EF4444',
          criticalBg: '#FEF2F2',
          offline: '#94A3B8',
          offlineBg: '#F8FAFC',
          info: '#3B82F6',
          infoBg: '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        glowCritical: '0 0 15px rgba(239, 68, 68, 0.35)',
        glowWarning: '0 0 15px rgba(245, 158, 11, 0.35)',
        glowHealthy: '0 0 15px rgba(16, 185, 129, 0.35)'
      }
    },
  },
  plugins: [],
}
