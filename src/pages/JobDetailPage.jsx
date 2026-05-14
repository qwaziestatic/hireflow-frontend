// src/pages/JobDetailPage.jsx

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI, applicationsAPI, savedJobsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PageLoader, StatusBadge } from "../components/ui";
import {
  MapPin, Clock, DollarSign, Briefcase, Users, ExternalLink,
  Bookmark, BookmarkCheck, ArrowLeft, CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const formatSalary = (min, max) => {
  if (!min && !max) return "Not specified";
  const fmt = (n) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / year`;
  if (min) return `From ${fmt(min)} / year`;
  return `Up to ${fmt(max)} / year`;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Fetch job details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsAPI.getById(id),
    select: (res) => res.data.job,
  });

  // Apply mutation — useMutation is for POST/PUT/DELETE (data-changing operations)
const applyMutation = useMutation({
    mutationFn: (data) => applicationsAPI.apply(data),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply");
    },
  });

  const handleApply = () => {
    if (!user) return navigate("/login");
    if (user.role !== "jobseeker") return toast.error("Only job seekers can apply");
    setShowApplyModal(true);
  };

  const submitApplication = () => {
    applyMutation.mutate({ job_id: id, cover_letter: coverLetter });
  };

  const handleSave = async () => {
    if (!user) return navigate("/login");
    try {
      const { data: res } = await savedJobsAPI.toggle(id);
      setIsSaved(res.saved);
      toast.success(res.message);
    } catch {
      toast.error("Failed to save job");
    }
  };

  if (isLoading) return <PageLoader />;
  if (isError || !data) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 mb-4">Job not found or has been removed.</p>
      <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="card">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                {data.logo_url ? (
                  <img src={data.logo_url} alt={data.company_name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 font-display font-bold text-2xl">
                    {data.company_name?.[0]}
                  </div>
                )}
                <div>
                  <Link to={`/companies/${data.company_id}`} className="text-brand-500 hover:underline font-medium">
                    {data.company_name}
                  </Link>
                  <h1 className="font-display font-bold text-2xl mt-1">{data.title}</h1>
                </div>
              </div>
              <button onClick={handleSave} className="text-gray-500 hover:text-brand-500 transition-colors flex-shrink-0">
                {isSaved ? <BookmarkCheck size={22} className="text-brand-500" /> : <Bookmark size={22} />}
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-surface-border mb-6">
              {[
                { icon: MapPin, label: "Location", value: data.location || "Not specified" },
                { icon: Briefcase, label: "Type", value: data.type || "Not specified" },
                { icon: DollarSign, label: "Salary", value: formatSalary(data.salary_min, data.salary_max) },
                { icon: Users, label: "Experience", value: data.experience || "Not specified" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><Icon size={12} />{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {data.category && <span className="badge bg-surface text-gray-400">{data.category}</span>}
              {data.tags?.map((tag) => (
                <span key={tag} className="badge bg-brand-500/10 text-brand-500">{tag}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="font-display font-semibold text-lg mb-4">Job Description</h2>
            {/* whitespace-pre-wrap preserves newlines from the database */}
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.description}</div>
          </div>

          {/* Requirements */}
          {data.requirements && (
            <div className="card">
              <h2 className="font-display font-semibold text-lg mb-4">Requirements</h2>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.requirements}</div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Apply Card */}
          <div className="card sticky top-24">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={data.status} />
              <span className="text-gray-600 text-xs flex items-center gap-1">
                <Clock size={12} />
                {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
              </span>
            </div>
            {data.deadline && (
              <p className="text-xs text-yellow-400 mb-4">
                ⏰ Deadline: {new Date(data.deadline).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-gray-500 mb-4">{data.views} views</p>

            <button
              onClick={handleApply}
              disabled={data.status !== "active"}
              className="btn-primary w-full mb-3"
            >
              Apply Now
            </button>
            <button onClick={handleSave} className="btn-outline w-full flex items-center justify-center gap-2">
              {isSaved ? <><BookmarkCheck size={15} /> Saved</> : <><Bookmark size={15} /> Save Job</>}
            </button>
          </div>

          {/* Company Card */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">About the Company</h3>
            <p className="text-gray-400 text-sm mb-1 font-medium">{data.company_name}</p>
            {data.company_industry && <p className="text-gray-600 text-xs mb-3">{data.company_industry}</p>}
            {data.company_description && (
              <p className="text-gray-400 text-sm mb-4 line-clamp-4">{data.company_description}</p>
            )}
            {data.website && (
              <a href={data.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-brand-500 hover:underline text-sm">
                Visit website <ExternalLink size={13} />
              </a>
            )}
            <Link to={`/companies/${data.company_id}`} className="btn-outline w-full mt-3 text-center text-sm block">
              View Company Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl p-6 animate-slide-up">
            <h2 className="font-display font-bold text-xl mb-1">Apply for this role</h2>
            <p className="text-gray-400 text-sm mb-5">{data.title} at {data.company_name}</p>

            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cover Letter <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              rows={6}
              className="input resize-none mb-5"
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={applyMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {applyMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle size={15} /> Submit Application</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
