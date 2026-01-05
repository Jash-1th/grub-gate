module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'grub-red': 'rgb(var(--grub-red-rgb) / <alpha-value>)',
        'grub-red-dark': 'rgb(var(--grub-red-dark-rgb) / <alpha-value>)',
        'grub-red-light': 'var(--grub-red-light)',
      },
    },
  },
  plugins: [],
};
