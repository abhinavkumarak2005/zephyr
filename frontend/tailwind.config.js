/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas:       'var(--color-canvas)',
        ink:          'var(--color-ink)',
        'text-muted': 'var(--color-text-muted)',
        surface:      'var(--color-surface)',
        hairline:     'var(--color-hairline)',
        accent:       'var(--color-accent)',
        'accent-2':   'var(--color-accent-2)',
        'accent-3':   'var(--color-accent-3)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      letterSpacing: {
        tightest: '-0.08em',
        tighter:  '-0.05em',
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}
