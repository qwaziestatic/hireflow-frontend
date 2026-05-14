// src/components/jobs/JobFilters.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sidebar filter panel for the Jobs listing page.
// Controlled component — parent passes filters state and setFilters handler.
// ─────────────────────────────────────────────────────────────────────────────

import { SlidersHorizontal, X } from "lucide-react";

// Available filter options — match what the backend accepts
const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const CATEGORIES = [
  "Engineering", "Design", "Marketing", "Sales",
  "Finance", "HR", "Product", "DevOps", "Data Science", "Other"
];
const EXPERIENCE_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

export default function JobFilters({ filters, setFilters, onClear }) {
  // Generic handler: updates any filter field by name
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "" : value, // Toggle: clicking same value clears it
      page: 1, // Reset to page 1 whenever filters change
    }));
  };

  const hasActiveFilters =
    filters.type || filters.category || filters.experience || filters.location;

  return (
    <div className="card space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-500" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-brand-500 hover:underline flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ── Location Input ── */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Location
        </label>
        <input
          type="text"
          className="input text-sm"
          placeholder="City, country, or Remote"
          value={filters.location}
          onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value, page: 1 }))}
        />
      </div>

      {/* ── Job Type ── */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Job Type
        </label>
        <div className="space-y-1.5">
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleChange("type", type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                filters.type === type
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "text-gray-400 hover:bg-surface-border/50 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category ── */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Category
        </label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleChange("category", cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.category === cat
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "text-gray-400 hover:bg-surface-border/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Experience Level ── */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Experience
        </label>
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map((exp) => (
            <button
              key={exp}
              onClick={() => handleChange("experience", exp)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.experience === exp
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "text-gray-400 hover:bg-surface-border/50 hover:text-white"
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
