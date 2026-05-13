/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FEF8FA', // pasztell rózsaszínes off-white
        ink: '#3B2A30', // mélyebb rózsaszín-barnás textszín
        // FIGYELEM: a `sage` palette mostantól pasztell rózsaszínű
        // (a változónév megtartva a kompatibilitásért, csak a HEX-ek frissítve)
        sage: {
          50: '#FDF5F8', // alig rózsaszín alap
          100: '#FBE9EE', // világos pasztell rózsaszín
          200: '#F5D2DC', // light pink
          300: '#EEB4C4', // medium light pink
          400: '#E59FB4', // medium pink
          500: '#D87B9C', // accent / primary
          600: '#BC6182', // hover
          700: '#9C4D6A', // dark / active
          800: '#763A51', // very dark
          900: '#52273A', // deepest pink
        },
        mauve: {
          50: '#FCF5F7',
          100: '#F7E6EB',
          200: '#EFCCD6',
          300: '#E3B0BF',
          400: '#D89AAB',
          500: '#C57E92',
          600: '#A86577',
          700: '#82505F',
        },
        terra: {
          400: '#E69EB0', // pasztell meleg rózsaszín
          500: '#D67E92',
          600: '#B66176',
        },
      },
      boxShadow: {
        paper: '0 1px 2px rgba(59, 42, 48, 0.06), 0 0 0 1px rgba(59, 42, 48, 0.04)',
      },
    },
  },
  plugins: [],
};
