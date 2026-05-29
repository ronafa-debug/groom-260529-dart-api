/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          white: '#FAF9F6',
          off: '#F5F3EF',
          beige: '#EDE8E0',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          gray: '#4A4A4A',
        },
        accent: {
          green: '#1B4332',
          burgundy: '#722F37',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
