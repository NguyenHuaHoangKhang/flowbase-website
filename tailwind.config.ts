import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F9FB',
        ink: '#111318',
        primary: { DEFAULT: '#2563EB', hover: '#1D4ED8' },
        card: '#FFFFFF',
        border: '#E5E7EB',
        muted: '#6B7280',
        success: '#22C55E',
        dark: { DEFAULT: '#111318', 2: '#191C23', border: '#262A33', muted: '#8A909C' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '16px', btn: '12px' },
      maxWidth: { shell: '1200px' },
      letterSpacing: { tightest: '-0.045em' },
      keyframes: {
        drop: {
          '0%': { top: '-4px', opacity: '0' },
          '20%, 80%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
      },
      animation: {
        drop: 'drop 2.4s cubic-bezier(.5,0,.5,1) infinite',
        blink: 'blink 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
