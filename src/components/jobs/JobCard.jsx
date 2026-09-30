// src/components/jobs/JobCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable card displayed in the job listings page.
// Shows key info: title, company, location, salary, type, tags.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Converts dates to "3 days ago" format
import { useAuth } from "../../context/AuthContext";
import { savedJobsAPI } from "../../services/api";
import { useState } from "react";
import toast from "react-hot-toast";

// ── Helper: format salary range ───────────────────────────────────────────────
const formatSalary = (min, max) => {
  if (!min && !max) return null;
  const fmt = (n) => `$${(n / 1000).toFixed(0)}k`; // e.g. 80000 → "$80k"
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
};

// ── Job type badge color ──────────────────────────────────────────────────────
const typeColors = {
  "full-time":  "bg-green-500/15 text-green-400",
  "part-time":  "bg-yellow-500/15 text-yellow-400",
  "contract":   "bg-blue-500/15 text-blue-400",
  "internship": "bg-purple-500/15 text-purple-400",
  "freelance":  "bg-orange-500/15 text-orange-400",
};

export default function JobCard({ job, savedIds = [], onSaveToggle }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(savedIds.includes(job.id));
  const [savingLoading, setSavingLoading] = useState(false);

  const salary = formatSalary(job.salary_min, job.salary_max);
  const postedAgo = formatDistanceToNow(new Date(job.created_at), { addSuffix: true });

  // Toggle saved state — optimistic UI update
  const handleSave = async (e) => {
    e.preventDefault(); // Prevent Link navigation when clicking the bookmark
    if (!user) return toast.error("Please log in to save jobs");
    if (user.role !== "jobseeker") return;

    setSavingLoading(true);
    try {
      const { data } = await savedJobsAPI.toggle(job.id);
      setIsSaved(data.saved); // Update local state based on API response
      toast.success(data.message);
      onSaveToggle?.(); // Notify parent to refresh saved list if needed
    } catch {
      toast.error("Failed to update saved jobs");
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    // The whole card is a Link — clicking anywhere navigates to job detail
    <Link
      to={`/jobs/${job.id}`}
      className="card hover:-translate-y-0.5 hover:border-brand-500/60 hover:shadow-xl hover:shadow-black/20 group block animate-fade-in"
    >
      {/* ── Top Row: Company Logo + Save Button ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Company logo or initial placeholder */}
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={job.company_name}
              width="48"
              height="48"
              className="w-12 h-12 rounded-lg object-cover bg-surface-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 font-display font-bold text-lg">
              {job.company_name?.[0] || "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {job.company_name}
            </p>
            <p className="text-xs text-gray-600">{job.company_industry}</p>
          </div>
        </div>

        {/* Bookmark button — only shown to jobseekers */}
        {user?.role === "jobseeker" && (
          <button
            onClick={handleSave}
            disabled={savingLoading}
            aria-label={isSaved ? "Remove saved job" : "Save job"}
            className="text-gray-600 hover:text-brand-500 transition-colors p-2 -m-1 rounded-lg hover:bg-brand-500/10"
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            {isSaved
              ? <BookmarkCheck size={18} className="text-brand-500" />
              : <Bookmark size={18} />
            }
          </button>
        )}
      </div>

      {/* ── Job Title ── */}
      <h3 className="font-display font-semibold text-lg mb-3 group-hover:text-brand-500 transition-colors line-clamp-2">
        {job.title}
      </h3>

      {/* ── Meta Info Row ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        {job.location && (
          <span className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin size={13} />
            {job.location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1.5 text-gray-500 text-xs">
            <DollarSign size={13} />
            {salary}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-gray-600 text-xs">
          <Clock size={13} />
          {postedAgo}
        </span>
      </div>

      {/* ── Bottom Row: Type Badge + Tags ── */}
      <div className="flex flex-wrap items-center gap-2">
        {job.type && (
          <span className={`badge ${typeColors[job.type] || "bg-gray-500/15 text-gray-400"}`}>
            {job.type}
          </span>
        )}
        {job.category && (
          <span className="badge bg-surface text-gray-400">
            {job.category}
          </span>
        )}
        {/* Show first 2 tags only */}
        {job.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="badge bg-brand-500/10 text-brand-500">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
