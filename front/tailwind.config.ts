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
          DEFAULT: "#cea87a", // Bronze accent
          primary: "#facc15", // Gold accent
        },
        background: {
          DEFAULT: "#FFFFFF", // background
          // light: "#F5F7FA", //
          primary: "#F5F7FA",
          // darker: "#F3F4F6", // Darker Gray-Blue
          secondary: "#F3F4F6", // gray-100
          darkest: "#E5E7EB", // gray-200
        },
        text: {
          DEFAULT: "#000000", // black
          // light: "#3D3D3D",
          primary: "#3D3D3D",
          // lighter: "#4B5563", // gray-600
          secondary: "#4B5563",
          // lightest: "#6B7280", // gray-500
          light: "#6B7280",
          // lightestest: "#9CA3AF", // gray-400
          lighter: "#9CA3AF",
          // lightestestest: "#D1D5DB", // gray-300
          lightest: "#D1D5DB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
