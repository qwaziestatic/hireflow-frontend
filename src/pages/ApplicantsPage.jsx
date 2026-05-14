// src/pages/ApplicantsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Employer-only page to review all applicants for a specific job.
// Accessible at: /jobs/:jobId/applicants
// Features:
//   - List all applicants with their profile info and cover letter
//   - Update application status (reviewed / shortlisted / rejected / hired)
//   - Add private notes about a candidate
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsAPI, jobsAPI } from "../services/api";
import { PageLoader, EmptyState, StatusBadge } from "../components/ui";
import {
  ArrowLeft, FileText, MapPin, ExternalLink,
  ChevronDown, Check, X, MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

// Available status transitions an employer can set
const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     color: "text-yellow-400" },
  { value: "reviewed",    label: "Reviewed",    color: "text-blue-400" },
  { value: "shortlisted", label: "Shortlisted", color: "text-purple-400" },
  { value: "rejected",    label: "Rejected",    color: "text-red-400" },
  { value: "hired",       label: "Hired",       color: "text-green-400" },
];

// ── Single Applicant Card ─────────────────────────────────────────────────────
function ApplicantCard({ application, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);  // Expand to show cover letter
  const [note, setNote] = useState(application.notes || "");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <div className="card space-y-4">
      {/* ── Header Row ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {application.avatar ? (
            <img
              src={application.avatar}
              alt={application.applicant_name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 font-display font-bold text-lg flex-shrink-0">
              {application.applicant_name?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Name + Meta */}
          <div>
            <p className="font-semibold">{application.applicant_name}</p>
            <p className="text-gray-500 text-xs">{application.applicant_email}</p>
            {application.location && (
              <span className="flex items-center gap-1 text-gray-600 text-xs mt-0.5">
                <MapPin size={11} /> {application.location}
              </span>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border hover:border-brand-500/50 text-sm transition-all"
          >
            <StatusBadge status={application.status} />
            <ChevronDown size={13} className={`text-gray-500 transition-transform ${statusOpen ? "rotate-180" : ""}`} />
          </button>

          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-card border border-surface-border rounded-xl shadow-xl z-10 overflow-hidden animate-fade-in">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onStatusUpdate(application.id, opt.value, note);
                    setStatusOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-border/50 transition-colors ${opt.color}`}
                >
                  {opt.label}
                  {/* Show a checkmark next to the currently active status */}
                  {application.status === opt.value && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bio ── */}
      {application.bio && (
        <p className="text-gray-400 text-sm border-l-2 border-surface-border pl-3 line-clamp-2">
          {application.bio}
        </p>
      )}

      {/* ── Resume Link ── */}
      {application.resume_url && (
        <a
          href={application.resume_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-brand-500 hover:underline text-sm"
        >
          <FileText size={14} /> View Resume <ExternalLink size={12} />
        </a>
      )}

      {/* ── Cover Letter Toggle ── */}
      {application.cover_letter && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <MessageSquare size={14} />
            {expanded ? "Hide" : "Show"} Cover Letter
            <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {expanded && (
            <div className="mt-3 p-4 bg-surface rounded-xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-surface-border">
              {application.cover_letter}
            </div>
          )}
        </div>
      )}

      {/* ── Private Notes ── */}
      <div>
        {application.notes && !showNoteInput && (
          <div className="text-xs text-gray-500 italic mb-2">
            📝 Note: {application.notes}
          </div>
        )}

        {showNoteInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              className="input text-sm flex-1"
              placeholder="Private note about this candidate..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => {
                onStatusUpdate(application.id, application.status, note);
                setShowNoteInput(false);
              }}
              className="btn-primary text-xs px-3 flex items-center gap-1"
            >
              <Check size={13} /> Save
            </button>
            <button
              onClick={() => setShowNoteInput(false)}
              className="btn-outline text-xs px-3"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNoteInput(true)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {application.notes ? "✏️ Edit note" : "+ Add private note"}
          </button>
        )}
      </div>

      {/* ── Footer: Applied Time ── */}
      <p className="text-gray-700 text-xs border-t border-surface-border pt-3">
        Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
      </p>
    </div>
  );
}

// ── Main Applicants Page ──────────────────────────────────────────────────────
export default function ApplicantsPage() {
  const { jobId } = useParams(); // Job ID from URL /jobs/:jobId/applicants
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch the job details for the page title
  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsAPI.getById(jobId),
    select: (res) => res.data.job,
  });

  // Fetch all applications for this job
  const { data: applications, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => applicationsAPI.getJobApplications(jobId),
    select: (res) => res.data.applications,
  });

  // Mutation to update an applicant's status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      applicationsAPI.updateStatus(id, { status, notes }),
    onSuccess: () => {
      // Refresh applications list so the UI reflects the new status
      queryClient.invalidateQueries({ queryKey: ["jobApplications", jobId] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleStatusUpdate = (applicationId, status, notes) => {
    updateStatusMutation.mutate({ id: applicationId, status, notes });
  };

  // Filter applications by status tab
  const filtered = applications?.filter((a) =>
    filterStatus === "all" ? true : a.status === filterStatus
  );

  // Count by status for the tab badges
  const countByStatus = (status) =>
    applications?.filter((a) => a.status === status).length || 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Applicants</h1>
        {job && (
          <p className="text-gray-500 text-sm">
            {job.title} ·{" "}
            <span className="text-white">{applications?.length || 0} total applicants</span>
          </p>
        )}
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex flex-wrap gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6">
        {[
          { id: "all", label: "All", count: applications?.length || 0 },
          { id: "pending", label: "Pending", count: countByStatus("pending") },
          { id: "reviewed", label: "Reviewed", count: countByStatus("reviewed") },
          { id: "shortlisted", label: "Shortlisted", count: countByStatus("shortlisted") },
          { id: "rejected", label: "Rejected", count: countByStatus("rejected") },
          { id: "hired", label: "Hired", count: countByStatus("hired") },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilterStatus(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterStatus === id
                ? "bg-brand-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === id ? "bg-white/20" : "bg-surface-border"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Applicants List ── */}
      {filtered?.length === 0 ? (
        <EmptyState
          title={filterStatus === "all" ? "No applicants yet" : `No ${filterStatus} applicants`}
          description={
            filterStatus === "all"
              ? "Applications will appear here as candidates apply to this job."
              : "Try selecting a different status filter."
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered?.map((application) => (
            <ApplicantCard
              key={application.id}
              application={application}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
