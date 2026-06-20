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
        brand: {
          dark: "#2A4B3A",
          DEFAULT: "#386641",
          light: "#A3B18A",
          accent: "#BC4749",
          cream: "#F2E8CF",
          bg: "#FAF9F6"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-playfair)", "var(--font-outfit)", "serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
