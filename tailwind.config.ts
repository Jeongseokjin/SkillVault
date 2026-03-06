import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#EBEBEB',
          hover: '#111111',
        },
        text: {
          primary: '#0A0A0A',
          secondary: '#555555',
          tertiary: '#888888',
        },
        accent: '#111111',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        premium: '#7C3AED',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,0.04)',
        md: '0 4px 16px rgba(0,0,0,0.06)',
        lg: '0 12px 32px rgba(0,0,0,0.08)',
        hover: '0 16px 40px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config
