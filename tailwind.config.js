/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#1a1a2e',
          grid: '#2d2d44',
          node: '#25253a',
          nodeHover: '#2f2f4a',
          border: '#3d3d5c',
          accent: '#7c3aed',
          'accent-light': '#a78bfa',
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
