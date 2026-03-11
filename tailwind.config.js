/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0C0C14',
        surface: '#14141F',
        'surface-hi': '#1C1C2C',
        'surface-hover': '#222230',
        border: '#2C2C40',
        'text-primary': '#D8DCF0',
        'text-secondary': '#9098C0',
        'text-muted': '#7078A8',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
