// src/components/ui/index.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Small reusable UI components used throughout the app.
// Kept in one file to avoid too many tiny files.
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronLeft, ChevronRight, SearchX, AlertCircle } from "lucide-react";

// ── Spinner ───────────────────────────────────────────────────────────────────
// Animated loading spinner. size: 'sm' | 'md' | 'lg'
export function Spinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div
      className={`${sizes[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`}
    />
  );
}

// ── PageLoader ────────────────────────────────────────────────────────────────
// Full-page centered spinner
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
// Shown when a list has no items to display
export function EmptyState({ title = "Nothing found", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-border flex items-center justify-center mb-4">
        <SearchX size={28} className="text-gray-600" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ── ErrorMessage ──────────────────────────────────────────────────────────────
export function ErrorMessage({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
// Props: { page, totalPages, onPageChange }
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // Don't render if only one page

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-400
                   border border-surface-border hover:border-brand-500 hover:text-white
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={15} /> Prev
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => {
          // Show: first, last, current ±1, and ellipsis placeholders
          return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
        })
        .reduce((acc, p, idx, arr) => {
          // Insert "..." when there's a gap
          if (idx > 0 && p - arr[idx - 1] > 1) {
            acc.push("...");
          }
          acc.push(p);
          return acc;
        }, [])
        .map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="text-gray-600 px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page
                  ? "bg-brand-500 text-white"
                  : "text-gray-400 border border-surface-border hover:border-brand-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          )
        )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-400
                   border border-surface-border hover:border-brand-500 hover:text-white
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
// Color-coded badge for application statuses
const statusConfig = {
  pending:     { label: "Pending",     color: "bg-yellow-500/15 text-yellow-400" },
  reviewed:    { label: "Reviewed",    color: "bg-blue-500/15 text-blue-400" },
  shortlisted: { label: "Shortlisted", color: "bg-purple-500/15 text-purple-400" },
  rejected:    { label: "Rejected",    color: "bg-red-500/15 text-red-400" },
  hired:       { label: "Hired",       color: "bg-green-500/15 text-green-400" },
  active:      { label: "Active",      color: "bg-green-500/15 text-green-400" },
  closed:      { label: "Closed",      color: "bg-gray-500/15 text-gray-400" },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: "bg-gray-500/15 text-gray-400" };
  return <span className={`badge ${config.color}`}>{config.label}</span>;
}
