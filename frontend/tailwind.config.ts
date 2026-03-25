import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        meli: {
          yellow: '#ffe600',
          bg: '#ebebeb',
          blue: '#3483fa',
          dark: '#333333',
          gray: '#999999',
          light: '#ffffff',
          border: '#e6e6e6'
        }
      },
    },
  },
  plugins: [],
};
export default config;
