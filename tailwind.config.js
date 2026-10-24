/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1B1D',
        paper: '#F7F5F1',
        cobalt: '#2B3A67',
        rose: '#C1666B',
        moss: '#4C7A5E',
        sand: '#EDE7DC',
        // Baby pink accent (landing page); deep is the text-safe shade (about 4.8:1 on paper)
        blush: { DEFAULT: '#F8C8D8', deep: '#B04A63' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
