/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': '#0a2463',
        'secondary': '#3e92cc',
        'accent': '#d8315b',
        'neutral': '#1e1b18'
      }
    },
  },
  plugins: [],
}

