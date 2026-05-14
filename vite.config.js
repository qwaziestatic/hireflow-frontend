// vite.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Vite configuration for development and production builds.
//
// DEV:  The proxy forwards /api requests to localhost:5000 so the browser
//       never hits CORS — it thinks everything is on the same origin.
//
// PROD: No proxy — VITE_API_URL in .env points directly to your Render URL.
//       Vite bundles the app; the deployed frontend calls the API URL
//       directly from the browser (CORS is allowed because we configured it
//       on the backend with the Vercel URL as the allowed origin).
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",
    sourcemap: false, // Disable source maps in production for smaller bundles
  },

  server: {
    port: 5173,
    proxy: {
      // In development ONLY: forward /api/* → http://localhost:5000/api/*
      // This lets VITE_API_URL stay as "/api" locally — no hardcoded ports.
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
