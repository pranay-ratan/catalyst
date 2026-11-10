/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#1B2459', brand: '#1B2459' },
        linen: '#F5F1E8',
        turquoise: '#1E9C8E',
        'turquoise-text': '#16695F',
        'turquoise-dark': '#5FD3C4',
        ink: '#151A33',
        muted: '#565C78',
        warn: '#7A4E00',
        danger: '#9B2C2C',
      },
      fontFamily: {
        heading: ['"Libre Baskerville"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
