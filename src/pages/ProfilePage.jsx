// src/pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Allows users to update their name, bio, location, resume URL, and avatar.
// Uses react-hook-form for controlled form management.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { User, MapPin, FileText, Link2, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  // Populate form with current user data when component mounts
  // or when user data changes (e.g., after Google OAuth)
  useEffect(() => {
    if (user) {
      reset({
        name:       user.name       || "",
        bio:        user.bio        || "",
        location:   user.location   || "",
        resume_url: user.resume_url || "",
        avatar:     user.avatar     || "",
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.user); // Update global AuthContext with new user data
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-500 text-xs font-semibold uppercase tracking-[0.16em] mb-3">Account settings</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-1">Your profile</h1>
        <p className="text-gray-500 text-sm">Keep your information up to date</p>
      </div>

      {/* Avatar Preview */}
      <div className="card mb-6 flex items-center gap-5">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              width="80"
              height="80"
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            // Fallback: colored circle with first letter of name
            <div className="w-20 h-20 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl font-display font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          {/* Camera icon overlay hint */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-border rounded-full flex items-center justify-center">
            <Camera size={12} className="text-gray-400" />
          </div>
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge bg-brand-500/10 text-brand-500 capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h2 className="font-display font-semibold text-lg">Personal Information</h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
            <User size={14} /> Full Name
          </label>
          <input
            type="text"
            className={`input ${errors.name ? "border-red-500" : ""}`}
            autoComplete="name"
            name="name"
            placeholder="Your full name"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Name too short" },
              maxLength: { value: 100, message: "Name too long" },
            })}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
            <FileText size={14} /> Bio
          </label>
          <textarea
            rows={4}
            className="input resize-none"
            name="bio"
            placeholder="A short bio about yourself…"
            {...register("bio", {
              maxLength: { value: 500, message: "Bio cannot exceed 500 characters" },
            })}
          />
          {errors.bio && (
            <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
          )}
          <p className="text-gray-600 text-xs mt-1">Max 500 characters</p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
            <MapPin size={14} /> Location
          </label>
          <input
            type="text"
            className="input"
            name="location"
            autoComplete="address-level2"
            placeholder="e.g. Nairobi, Kenya"
            {...register("location")}
          />
        </div>

        {/* Resume URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
            <Link2 size={14} /> Resume URL
          </label>
          <input
            type="url"
            className="input"
            name="resume_url"
            placeholder="https://drive.google.com/your-resume"
            {...register("resume_url")}
          />
          <p className="text-gray-600 text-xs mt-1">
            Link to your resume on Google Drive, Dropbox, etc.
          </p>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
            <Camera size={14} /> Avatar URL
          </label>
          <input
            type="url"
            className="input"
            name="avatar"
            placeholder="https://example.com/your-photo.jpg"
            {...register("avatar")}
          />
          <p className="text-gray-600 text-xs mt-1">
            Link to a profile image. Tip: upload to imgur.com or similar.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          // isDirty: true only if form values differ from the defaultValues (reset values)
          // Disabling when not dirty prevents unnecessary API calls
          disabled={updateMutation.isPending || !isDirty}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {updateMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Info when no changes */}
        {!isDirty && (
          <p className="text-center text-gray-600 text-xs">
            Make changes above to enable saving
          </p>
        )}
      </form>
    </div>
  );
}
