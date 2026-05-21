import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noir:      '#151515',
        blanc:     '#FFFFFF',
        beige:     '#F2EDE8',
        beige2:    '#EAE3DA',
        beige3:    '#DAD1C6',
        or:        '#B8893A',
        'or-dark': '#8A6030',
        gris:      '#84827F',
        'gris-cl': '#E0DEDA',
        rouge:     '#C84030',
        vert:      '#3A8A3A',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
