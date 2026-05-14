/** @type {import('tailwindcss').Config} */
// tailwind.config.js
// content: tells Tailwind which files to scan for class names.
// Any class used in these files gets included in the final CSS build.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Custom color palette for the job portal brand
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          500: "#4f6ef7",
          600: "#3b5bf0",
          700: "#2d48d6",
          900: "#1a2b8a",
        },
        surface: {
          DEFAULT: "#0f1117",   // Dark background
          card:    "#181c27",   // Card background
          border:  "#252a3a",   // Border color
        },
      },
      fontFamily: {
        // Custom fonts loaded in index.html
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease forwards",
        "slide-up":  "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
