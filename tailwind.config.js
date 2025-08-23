/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'fifa-blue': '#326295',
        'fifa-green': '#58aa00',
        'fifa-yellow': '#ffdd00',
        'gamer-blue': '#2563eb',
        'gamer-purple': '#7c3aed',
        'gamer-pink': '#db2777',
        'gamer-neon': '#00ffaa',
        'dark-card': '#1c1c27',
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-green': '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'neon-purple': '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
      },
      backgroundImage: {
        'gamer-gradient': 'linear-gradient(to right, #4f46e5, #7c3aed)',
        'dark-gradient': 'linear-gradient(to bottom, #0f172a, #1e293b)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
