// src/main.jsx
// ─────────────────────────────────────────────────────────────────────────────
// This is where React starts. It mounts the App component into the #root div
// in index.html and wraps it with providers.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client"; // React 18 uses createRoot instead of render
import { BrowserRouter } from "react-router-dom"; // Enables client-side routing
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Data fetching/caching
import { Toaster } from "react-hot-toast"; // Global toast notifications
import App from "./App";
import "./index.css"; // Global styles + Tailwind

// QueryClient manages all server-state (API data) caching and re-fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes before re-fetching
      retry: 1,                  // Retry failed requests once before showing error
    },
  },
});

// React 18's createRoot API (replaces ReactDOM.render from React 17)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* StrictMode highlights potential problems in development (double renders, etc.) */}

    <QueryClientProvider client={queryClient}>
      {/* Makes React Query available to all components */}

      <BrowserRouter>
        {/* Enables <Link>, <NavLink>, useNavigate, useParams throughout the app */}

        <App />

        {/* Global toast container — toasts appear here regardless of which component triggers them */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#181c27",
              color: "#ffffff",
              border: "1px solid #252a3a",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#4f6ef7", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
