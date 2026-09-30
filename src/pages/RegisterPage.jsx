// src/pages/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { Briefcase, Eye, EyeOff, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-select role from URL param: /register?role=employer
  const [role, setRole] = useState(searchParams.get("role") || "jobseeker");

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: searchParams.get("role") || "jobseeker" }
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await registerUser({ ...formData, role });
      toast.success("Account created! Welcome to HireFlow 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Create your account</h1>
          <p className="text-gray-500 text-sm mt-2">Join HireFlow today — it's free</p>
        </div>

        <div className="card">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setRole("jobseeker")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                role === "jobseeker"
                  ? "border-brand-500 bg-brand-500/10 text-brand-500"
                  : "border-surface-border text-gray-400 hover:border-gray-500"
              }`}
            >
              <User size={20} />
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                role === "employer"
                  ? "border-brand-500 bg-brand-500/10 text-brand-500"
                  : "border-surface-border text-gray-400 hover:border-gray-500"
              }`}
            >
              <Building2 size={20} />
              Employer
            </button>
          </div>

          {/* Google OAuth */}
{import.meta.env.VITE_GOOGLE_CLIENT_ID && (
  <>
    <button
      type="button"
      onClick={() => authAPI.googleLogin()}
      className="w-full flex items-center justify-center gap-3 border border-surface-border hover:border-gray-500 rounded-xl py-3 text-sm font-medium transition-all mb-5 hover:bg-surface-border/30"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1-584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      Continue with Google
    </button>
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-surface-border" />
      <span className="text-gray-600 text-xs">or register with email</span>
      <div className="flex-1 h-px bg-surface-border" />
    </div>
  </>
)}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="John Doe"
                autoComplete="name"
                name="name"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name too short" },
                })}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                className={`input ${errors.email ? "border-red-500" : ""}`}
                placeholder="you@example.com"
                autoComplete="email"
                name="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input pr-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  name="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  Creating account...
                </span>
              ) : `Create ${role === "employer" ? "Employer" : "Job Seeker"} Account`}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
