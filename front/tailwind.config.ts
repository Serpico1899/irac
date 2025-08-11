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
        vazir: ["vazir-matn", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#002D56", // The main dark blue
          dark: "#002D56", // Explicitly our dark blue
        },
        accent: {
          DEFAULT: "#FDB913", // The main golden/yellow
          gold: "#FDB913",
        },
        text: {
          DEFAULT: "#333333", // The default main text color
          main: "#333333",
          light: "#777777", // The secondary gray text
        },
        background: {
          DEFAULT: "#FFFFFF", // White background for content blocks
          light: "#F8F8F8", // Light gray for the page background
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-delay": "fadeIn 0.8s ease-out 0.3s forwards",
        "fade-in-delay-2": "fadeIn 0.8s ease-out 0.6s forwards",
        "slide-down": "slideDown 0.8s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "slide-up-delay": "slideUp 0.8s ease-out 0.2s forwards",
        "slide-up-delay-2": "slideUp 0.8s ease-out 0.4s forwards",
        "slide-up-delay-3": "slideUp 0.8s ease-out 0.6s forwards",
        "slide-up-delay-4": "slideUp 0.8s ease-out 0.8s forwards",
        "slide-up-delay-5": "slideUp 0.8s ease-out 1s forwards",
        "slide-up-delay-6": "slideUp 0.8s ease-out 1.2s forwards",
        "slide-up-delay-7": "slideUp 0.8s ease-out 1.4s forwards",
        "slide-up-delay-8": "slideUp 0.8s ease-out 1.6s forwards",
        "pop-in": "popIn 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards",
        "bounce-in":
          "bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "0.9", transform: "scale(1.1)" },
          "80%": { opacity: "1", transform: "scale(0.89)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
