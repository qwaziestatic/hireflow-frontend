// src/pages/LoginPage.jsx

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { Briefcase, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Used to redirect back after login
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // react-hook-form handles form state, validation, and submission
  const { register, handleSubmit, formState: { errors } } = useForm();

  // from: the page user was trying to visit before being redirected to login
  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await login(formData);
      toast.success("Welcome back!");
      navigate(from, { replace: true }); // Go to intended page after login
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authAPI.googleLogin(); // Redirects browser to backend /api/auth/google
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your HireFlow account</p>
        </div>

        <div className="card">
          {/* Google OAuth Button */}
{import.meta.env.VITE_GOOGLE_CLIENT_ID && (
  <>
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 border border-surface-border hover:border-gray-500 rounded-xl py-3 text-sm font-medium transition-all mb-5 hover:bg-surface-border/30"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      Continue with Google
    </button>
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-surface-border" />
      <span className="text-gray-600 text-xs">or sign in with email</span>
      <div className="flex-1 h-px bg-surface-border" />
    </div>
  </>
)}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                className={`input ${errors.email ? "border-red-500" : ""}`}
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input pr-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-500 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
