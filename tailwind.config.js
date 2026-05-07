/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
      width: {
        '[--sidebar-width]': 'var(--sidebar-width)',
        '[--sidebar-width-icon]': 'var(--sidebar-width-icon)',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')]
}
