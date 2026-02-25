/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grub-red': '#800020',
        red: {
          500: '#9a0030',
          600: '#800020',
          700: '#660019'
        }
      },
      screens: {
        'xs': '480px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        // 2xl: 1536px (default)
      },
    },
  },
  plugins: [],
}
