// postcss.config.js
// PostCSS processes our CSS. These two plugins are required by Tailwind.
export default {
  plugins: {
    tailwindcss: {},  // Generates Tailwind utility classes
    autoprefixer: {}, // Adds vendor prefixes (-webkit-, -moz-) for browser compatibility
  },
};
