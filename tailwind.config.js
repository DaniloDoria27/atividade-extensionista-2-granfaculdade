/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mapeia as variáveis do index.css para classes do Tailwind (ex: bg-brand-primary, text-brand-main)
        brand: {
          primary: 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          secondary: 'var(--secondary)',
          'secondary-hover': 'var(--secondary-hover)',
          success: 'var(--success)',
          'success-hover': 'var(--success-hover)',
          danger: 'var(--danger)',
          'danger-hover': 'var(--danger-hover)',
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
          surface: 'var(--surface)',
          border: 'var(--border)',
        },
      },
    },
  },
  plugins: [],
};
