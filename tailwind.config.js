/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FDE8E8',
          sky: '#E0F2FE',
          yellow: '#FEF08A',
          charcoal: '#1E293B',
          softBg: '#F9F9FF',
          accentPink: '#F472B6',
          mint: '#DCFCE7'
        }
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif']
      },
      fontSize: {
        xs: ['clamp(0.875rem, 0.82rem + 0.22vw, 0.9375rem)', { lineHeight: '1.45' }],
        sm: ['clamp(1rem, 0.94rem + 0.25vw, 1.125rem)', { lineHeight: '1.5' }],
        base: ['clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)', { lineHeight: '1.55' }],
        lg: ['clamp(1.25rem, 1.12rem + 0.45vw, 1.5rem)', { lineHeight: '1.45' }],
        xl: ['clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)', { lineHeight: '1.35' }],
        '2xl': ['clamp(1.625rem, 1.35rem + 0.9vw, 2rem)', { lineHeight: '1.3' }],
        '3xl': ['clamp(1.875rem, 1.45rem + 1.3vw, 2.375rem)', { lineHeight: '1.2' }],
        '4xl': ['clamp(2.25rem, 1.6rem + 1.8vw, 2.875rem)', { lineHeight: '1.15' }],
        '5xl': ['clamp(2.75rem, 1.8rem + 2.6vw, 3.5rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(3.25rem, 2rem + 3.2vw, 4.25rem)', { lineHeight: '1.05' }],
        '7xl': ['clamp(3.75rem, 2.2rem + 3.8vw, 5rem)', { lineHeight: '1' }],
        '8xl': ['clamp(4.5rem, 2.4rem + 5vw, 6.5rem)', { lineHeight: '1' }],
        '9xl': ['clamp(5.5rem, 2.8rem + 6vw, 8rem)', { lineHeight: '1' }],
      },
      borderRadius: {
        '4xl': '2rem'
      }
    },
  },
  plugins: [],
}
