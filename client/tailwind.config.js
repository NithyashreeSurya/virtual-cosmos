/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': '#0a0a0f',
        'space-dark': '#12121a',
        'cyan-glow': '#00d4ff',
        'pink-glow': '#ff6b9d',
        'green-connected': '#00ff88',
        'red-disconnected': '#ff4466',
        'yellow-500': '#ffaa00',
        'text-primary': '#ffffff',
        'text-secondary': '#8888aa',
        'panel-bg': 'rgba(20, 20, 30, 0.9)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
