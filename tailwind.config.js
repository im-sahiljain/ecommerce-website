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
      borderRadius: {
        '4xl': '2rem'
      }
    },
  },
  plugins: [],
}
