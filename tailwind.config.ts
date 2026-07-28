import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-slow-reverse': 'spin 16s linear infinite reverse',
      },
    },
  },
  plugins: [],
};

export default config;
