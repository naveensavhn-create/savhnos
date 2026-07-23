import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#80a8ff",
          400: "#4d7fff",
          500: "#2456f5",
          600: "#1a3fd1",
          700: "#152fa6",
          800: "#132582",
          900: "#131f66",
        },
      },
    },
  },
  plugins: [],
};

export default config;
