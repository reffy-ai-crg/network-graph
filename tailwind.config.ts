import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        emerald: {
          50: "rgb(var(--color-theme-50, 236 253 245) / <alpha-value>)",
          100: "rgb(var(--color-theme-100, 209 250 229) / <alpha-value>)",
          200: "rgb(var(--color-theme-200, 167 243 208) / <alpha-value>)",
          300: "rgb(var(--color-theme-300, 110 231 183) / <alpha-value>)",
          400: "rgb(var(--color-theme-400, 52 211 153) / <alpha-value>)",
          500: "rgb(var(--color-theme-500, 16 185 129) / <alpha-value>)",
          600: "rgb(var(--color-theme-600, 5 150 105) / <alpha-value>)",
          700: "rgb(var(--color-theme-700, 4 120 87) / <alpha-value>)",
          800: "rgb(var(--color-theme-800, 6 95 70) / <alpha-value>)",
          900: "rgb(var(--color-theme-900, 6 78 59) / <alpha-value>)",
        },
        teal: {
          400: "rgb(var(--color-theme-sec-400, 45 212 191) / <alpha-value>)",
          500: "rgb(var(--color-theme-sec-500, 20 184 166) / <alpha-value>)",
          600: "rgb(var(--color-theme-sec-600, 13 148 136) / <alpha-value>)",
          700: "rgb(var(--color-theme-sec-700, 15 118 110) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
