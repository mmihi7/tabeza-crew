import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode theme tokens (staff PWA)
        'bg-primary': 'var(--background-primary)',
        'bg-secondary': 'var(--background-secondary)',
        'bg-tertiary': 'var(--background-tertiary)',
        'border-default': 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'amber': 'var(--amber)',
        'amber-dark': 'var(--amber-dark)',
        'amber-pale': 'var(--amber-pale)',
      },
    },
  },
  plugins: [],
};
export default config;
