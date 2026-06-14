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
        green: {
          DEFAULT: "#00875A",
          light: "#E3F5EE",
          mid: "#C0E8D8",
        },
        ink: {
          DEFAULT: "#111827",
          2: "#374151",
          3: "#6B7280",
          4: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
