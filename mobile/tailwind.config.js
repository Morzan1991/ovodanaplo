/**
 * Ugyanaz a pasztell rózsaszín paletta, mint az asztali programban —
 * a két felület nem térhet el egymástól.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      colors: {
        cream: '#FEF8FA',
        ink: '#3B2A30',
        rozsa: {
          50: '#FDF5F8',
          100: '#FBE9EE',
          200: '#F5D2DC',
          300: '#EEB4C4',
          400: '#E59FB4',
          500: '#D87B9C',
          600: '#BC6182',
          700: '#9C4D6A',
          800: '#763A51',
          900: '#52273A',
        },
      },
    },
  },
  plugins: [],
};
