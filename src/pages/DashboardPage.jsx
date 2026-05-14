// src/pages/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shows different content depending on user role:
//   - Jobseeker: My Applications + Saved Jobs
//   - Employer: My Job Listings + Application counts
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { applicationsAPI, jobsAPI, savedJobsAPI } from "../services/api";
import { PageLoader, StatusBadge, EmptyState } from "../components/ui";
import {
  Briefcase, BookmarkCheck, Plus, Eye, Users,
  FileText, ArrowRight, TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Jobseeker Dashboard ────────────────────────────────────────────────────────
function JobseekerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("applications");

  // Fetch applications
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => applicationsAPI.getMyApplications(),
    select: (res) => res.data.applications,
  });

  // Fetch saved jobs
  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => savedJobsAPI.getAll(),
    select: (res) => res.data.savedJobs,
  });

  const tabs = [
    { id: "applications", label: "My Applications", icon: FileText, count: applicationsData?.length },
    { id: "saved", label: "Saved Jobs", icon: BookmarkCheck, count: savedData?.length },
  ];

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Applied", value: applicationsData?.length || 0, icon: FileText, color: "text-brand-500" },
          { label: "Saved", value: savedData?.length || 0, icon: BookmarkCheck, color: "text-yellow-400" },
          { label: "Shortlisted", value: applicationsData?.filter(a => a.status === "shortlisted").length || 0, icon: TrendingUp, color: "text-purple-400" },
          { label: "Hired", value: applicationsData?.filter(a => a.status === "hired").length || 0, icon: Briefcase, color: "text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className="font-display font-bold text-2xl">{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6 w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-brand-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20" : "bg-surface-border"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        appsLoading ? <PageLoader /> :
        applicationsData?.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Start applying to jobs to track your progress here."
            action={<Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>}
          />
        ) : (
          <div className="space-y-3">
            {applicationsData.map((app) => (
              <div key={app.id} className="card hover:border-surface-border/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {app.company_logo ? (
                    <img src={app.company_logo} alt={app.company_name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 font-bold flex-shrink-0">
                      {app.company_name?.[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{app.job_title}</p>
                    <p className="text-gray-500 text-xs">{app.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={app.status} />
                  <span className="text-gray-600 text-xs hidden sm:block">
                    {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  </span>
                  <Link to={`/jobs/${app.job_id}`} className="text-gray-600 hover:text-brand-500">
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Saved Jobs Tab */}
      {activeTab === "saved" && (
        savedLoading ? <PageLoader /> :
        savedData?.length === 0 ? (
          <EmptyState
            title="No saved jobs"
            description="Bookmark jobs you're interested in to find them here."
            action={<Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>}
          />
        ) : (
          <div className="space-y-3">
            {savedData.map((item) => (
              <div key={item.saved_id} className="card flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.company_name} • {item.location}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.status !== "active" && <StatusBadge status={item.status} />}
                  <Link to={`/jobs/${item.job_id}`} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    Apply <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Employer Dashboard ─────────────────────────────────────────────────────────
function EmployerDashboard({ user }) {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["myJobs"],
    queryFn: () => jobsAPI.getMyJobs(),
    select: (res) => res.data.jobs,
  });

  const totalApplications = jobs?.reduce((sum, j) => sum + parseInt(j.application_count || 0), 0) || 0;
  const activeJobs = jobs?.filter(j => j.status === "active").length || 0;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-brand-500" },
          { label: "Total Applicants", value: totalApplications, icon: Users, color: "text-green-400" },
          { label: "Total Listings", value: jobs?.length || 0, icon: FileText, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className="font-display font-bold text-2xl">{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold">Your Job Listings</h2>
        <Link to="/post-job" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={14} /> Post New Job
        </Link>
      </div>

      {isLoading ? <PageLoader /> :
       jobs?.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Post your first job listing to start receiving applications."
          action={<Link to="/post-job" className="btn-primary text-sm">Post a Job</Link>}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-gray-500 text-xs">{job.company_name} • {job.location}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center hidden sm:block">
                  <p className="font-bold text-lg">{job.application_count}</p>
                  <p className="text-gray-600 text-xs">applicants</p>
                </div>
                {/* Link to the new ApplicantsPage for this specific job */}
                <Link
                  to={`/jobs/${job.id}/applicants`}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Users size={13} /> Review
                </Link>
                <Link to={`/jobs/${job.id}`} className="text-gray-500 hover:text-white" title="View public listing">
                  <Eye size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 capitalize">
          {user?.role} Dashboard
        </p>
      </div>

      {/* Render different dashboard based on role */}
      {user?.role === "employer"
        ? <EmployerDashboard user={user} />
        : <JobseekerDashboard user={user} />
      }
    </div>
  );
}
