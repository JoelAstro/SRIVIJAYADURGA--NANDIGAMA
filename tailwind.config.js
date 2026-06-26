/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#8B0000',
          dark: '#5C0000',
          light: '#B22222',
        },
        saffron: {
          DEFAULT: '#D4A017',
          dark: '#B8860B',
          light: '#FFD700',
        },
        bg: {
          light: '#FFF8F0',
          dark: '#0f0909',
        }
      },
      fontFamily: {
        logo: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
