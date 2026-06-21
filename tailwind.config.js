/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Rounded, bubbly display font to match the "nailong" show logo.
        // Used for headers/titles via `font-display`.
        display: ['Fredoka_600SemiBold'],
        displayBold: ['Fredoka_700Bold'],
      },
      colors: {
        // Nailong identity — warm dinosaur yellow
        nailong: {
          DEFAULT: '#FFD93D',
          light: '#FFE873',
          dark: '#F5C518',
        },
        // Soft period-theme rose
        rose: {
          DEFAULT: '#FF8FA3',
          light: '#FFD0DA',
          dark: '#E76A82',
        },
        // Mint accents (Nailong's belly / fresh tone)
        mint: {
          DEFAULT: '#A8E6CF',
          dark: '#7FCBAE',
        },
        cream: '#FFFDF5',
        ink: '#4A4A4A',
      },
    },
  },
  plugins: [],
};
