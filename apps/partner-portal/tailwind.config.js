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
  safelist: [
    // Ensure custom brand colors are never purged
    'bg-grub-red',
    'bg-grub-red-light',
    'bg-grub-red-dark',
    'text-grub-red',
    'text-grub-red-light',
    'text-grub-red-dark',
    'border-grub-red',
    'border-grub-red-light',
    'border-grub-red-dark',
    'from-grub-red',
    'to-grub-red-dark',
    'hover:bg-grub-red',
    'hover:text-grub-red',
    // Gradient classes
    'bg-gradient-to-br',
    'from-grub-red',
    'to-grub-red-dark',
  ],
  theme: {
    extend: {
      // Partner portal specific theme extensions can go here
    },
  },
  plugins: [],
}

