// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// React Context provides a way to share state (like "who is logged in")
// across ALL components without passing props manually at every level.
//
// Any component can call useAuth() to get: { user, login, logout, loading }
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

// Step 1: Create the context object (just an empty container for now)
const AuthContext = createContext(null);

// Step 2: Create the Provider component — it holds the actual state and logic
export const AuthProvider = ({ children }) => {
  // user: the logged-in user object, or null if not logged in
  const [user, setUser] = useState(null);

  // loading: true while we're checking if a saved token is still valid
  const [loading, setLoading] = useState(true);

  // ── INITIALIZE ON APP LOAD ──────────────────────────────────────────────────
  // When the app first loads, check if there's a saved token in localStorage.
  // If so, verify it with the backend and restore the user session.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token"); // Check for saved token

      if (!token) {
        setLoading(false); // No token — user is a guest
        return;
      }

      try {
        // Verify the token is still valid and get fresh user data
        const { data } = await authAPI.getMe();
        setUser(data.user); // Restore user session
      } catch {
        // Token expired or invalid — clean up
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false); // Always stop the loading state
      }
    };

    initAuth();
  }, []); // Empty dependency array = run once when component mounts

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem("token", data.token); // Save JWT for future requests
    localStorage.setItem("user", JSON.stringify(data.user)); // Cache user data
    setUser(data.user); // Update global state — all components re-render
    return data;
  };

  // ── REGISTER ────────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Clear user from state — components will see null and show login UI
    toast.success("Logged out successfully");
  };

  // ── UPDATE USER ─────────────────────────────────────────────────────────────
  // Called after profile updates to keep context in sync
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Step 3: Provide the state and functions to all child components
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 4: Custom hook — makes it easy to consume the context
// Usage in any component: const { user, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This error fires if useAuth is called outside of <AuthProvider>
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
