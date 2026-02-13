/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral Papyrus — Design Language
        papyrus: "#F6F2EE",
        silver: "#CACBCD",
        pewter: "#B3B9C1",
        stone: "#77726E",
        charcoal: "#323841",

        neutral: {
          50: "#F6F2EE",
          100: "#F0ECE8",
          200: "#E8E4E0",
          300: "#CACBCD",
          400: "#B3B9C1",
          500: "#77726E",
          600: "#635E5A",
          700: "#323841",
          800: "#252B33",
          900: "#1E2228",
          950: "#161A1F",
        },

        // Semantic status colors
        success: {
          DEFAULT: "#5B8A6F",
          light: "#5B8A6F",
          dark: "#7FB396",
          bg: "#EEF5F1",
          "bg-dark": "#2A3A30",
        },
        error: {
          DEFAULT: "#B85C5C",
          light: "#B85C5C",
          dark: "#D98E8E",
          bg: "#F8EEEE",
          "bg-dark": "#3D2A2A",
        },
        warning: {
          DEFAULT: "#B89A5C",
          light: "#B89A5C",
          dark: "#D4B87A",
          bg: "#F5F1E8",
          "bg-dark": "#3A3528",
        },
        info: {
          DEFAULT: "#5C7EB8",
          light: "#5C7EB8",
          dark: "#8EA8D9",
          bg: "#EEF1F8",
          "bg-dark": "#2A3040",
        },

        // Keep primary alias for backward compatibility during migration
        primary: {
          50: "#F6F2EE",
          100: "#F0ECE8",
          200: "#E8E4E0",
          300: "#CACBCD",
          400: "#B3B9C1",
          500: "#77726E",
          600: "#635E5A",
          700: "#323841",
          800: "#252B33",
          900: "#1E2228",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
  // Enable RTL support
  corePlugins: {
    preflight: true,
  },
};
