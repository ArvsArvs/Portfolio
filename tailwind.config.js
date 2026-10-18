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
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
