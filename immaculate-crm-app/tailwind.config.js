/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0a0a0f',
        carbon: '#111118',
        slate: '#1a1a24',
        steel: '#2a2a38',
        silver: '#8888a0',
        ice: '#e8e8f0',
        accent: '#00d4aa',
        'accent-dim': '#00a888',
        warning: '#ffb020',
        danger: '#ff4466',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
