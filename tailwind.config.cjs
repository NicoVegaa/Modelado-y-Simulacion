/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0b3a53',
        accent: '#f59e0b'
      }
    }
  },
  plugins: []
};
