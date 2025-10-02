/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [
    require('../../packages/config/tailwind-preset.js')
  ],
  theme: {
    extend: {
      // Partner portal specific theme extensions can go here
    },
  },
  plugins: [],
}

