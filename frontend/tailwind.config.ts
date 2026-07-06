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
        gold: {
          50: "#fdf9e9",
          100: "#faf0c8",
          200: "#f6df94",
          300: "#f0c755",
          400: "#eab228",
          500: "#d99a1b",
          600: "#bc7714",
          700: "#965614",
          800: "#7d4518",
          900: "#6b391a",
          950: "#3e1d0c",
        },
        ink: {
          50: "#f6f6f7",
          100: "#e2e3e6",
          200: "#c5c7cd",
          300: "#a0a3ad",
          400: "#7b7f8c",
          500: "#616471",
          600: "#4c4f5a",
          700: "#3f414a",
          800: "#35363d",
          900: "#1a1b20",
          950: "#0e0f12",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        bengali: ["var(--font-bengali)", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
