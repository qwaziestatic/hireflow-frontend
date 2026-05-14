// src/pages/AuthCallbackPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// After Google OAuth, the backend redirects here with:
//   /auth/callback?token=<jwt>
// This page reads the token, stores it, fetches user data, then redirects.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { Spinner } from "../components/ui";
import toast from "react-hot-toast";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token"); // JWT from backend redirect URL
      const error = searchParams.get("error");

      if (error) {
        toast.error("Google login failed. Please try again.");
        navigate("/login");
        return;
      }

      if (!token) {
        toast.error("No token received");
        navigate("/login");
        return;
      }

      // Store the token so the Axios interceptor attaches it to all future requests
      localStorage.setItem("token", token);

      try {
        // Fetch the user's profile using the new token
        const { data } = await authAPI.getMe();
        updateUser(data.user); // Update AuthContext state
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(`Welcome, ${data.user.name}!`);
        navigate("/dashboard"); // Redirect to dashboard
      } catch {
        localStorage.removeItem("token");
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, []); // Run once on mount

  // Show a spinner while processing the OAuth callback
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm">Completing sign in...</p>
    </div>
  );
}
