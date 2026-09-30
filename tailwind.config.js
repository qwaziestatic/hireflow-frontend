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
          50:  "#edf4ff",
          100: "#dbeafe",
          500: "#5b7cfa",
          600: "#4968e8",
          700: "#3d56c9",
          900: "#202d67",
        },
        surface: {
          DEFAULT: "#0b1220",   // Deep navy page background
          card:    "#121d30",   // Elevated panel background
          border:  "#233552",   // Cool blue-gray border
        },
      },
      fontFamily: {
        display: ["'Manrope'", "sans-serif"],
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
