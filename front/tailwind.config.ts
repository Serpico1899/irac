import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Inter", "sans-serif"],
        vazir: ["Vazirmatn", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#168c95", // The main brand teal
          dark: "#0f7882",
        },
        accent: {
          DEFAULT: "#cea87a", // Bronze/Gold accent
        },
        background: {
          DEFAULT: "#FFFFFF", // White
          light: "#F5F7FA", // Light Gray-Blue
        },
        text: {
          DEFAULT: "#333333", // Dark Gray for headings
          light: "#777777", // Medium Gray for sub-text
        },
      },
    },
  },
  plugins: [],
};

export default config;
