// src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Landing page with hero section, search bar, stats, and featured jobs.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../services/api";
import JobCard from "../components/jobs/JobCard";
import { Spinner } from "../components/ui";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
      <Icon size={22} className="text-brand-500" />
    </div>
    <p className="font-display font-bold text-2xl">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  // Fetch 6 latest jobs for the "Featured Jobs" section
  // useQuery from React Query handles loading, caching, and error states
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "featured"],  // Cache key — React Query uses this to avoid duplicate fetches
    queryFn: () => jobsAPI.getAll({ limit: 6, sort: "newest" }),
    select: (res) => res.data,       // Extract data from Axios response
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to /jobs page with search terms as URL query params
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-sm font-medium">
              <TrendingUp size={14} />
              1,200+ jobs added this week
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-center leading-tight mb-6">
            Find Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-400">
              Dream Role
            </span>
          </h1>

          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-10">
            Browse thousands of job opportunities from top companies. 
            Apply in minutes, land your next career move.
          </p>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 bg-surface-card border border-surface-border rounded-2xl p-2">
              {/* Job search input */}
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={18} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none py-2"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-surface-border" />

              {/* Location input */}
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin size={18} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none py-2"
                />
              </div>

              <button type="submit" className="btn-primary px-8 whitespace-nowrap">
                Search Jobs
              </button>
            </div>
          </form>

          {/* Quick category links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Engineering", "Design", "Marketing", "Product", "DevOps"].map((cat) => (
              <Link
                key={cat}
                to={`/jobs?category=${cat}`}
                className="px-3 py-1.5 rounded-full bg-surface-border/50 text-gray-400 hover:text-white hover:bg-surface-border text-xs transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="border-y border-surface-border bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={Briefcase}  value="12,400+" label="Active Jobs" />
            <StatCard icon={Building2}  value="850+"    label="Companies" />
            <StatCard icon={Users}      value="45,000+" label="Job Seekers" />
            <StatCard icon={TrendingUp} value="3,200+"  label="Hires This Month" />
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl">Latest Opportunities</h2>
            <p className="text-gray-500 text-sm mt-1">Freshly posted jobs across all categories</p>
          </div>
          <Link
            to="/jobs"
            className="hidden sm:flex items-center gap-2 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
          >
            View all jobs <ArrowRight size={15} />
          </Link>
        </div>

        {/* Job grid — 3 columns on desktop */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.jobs?.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/jobs" className="btn-outline inline-flex items-center gap-2">
            Browse All Jobs <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/50 to-brand-700/20 border border-brand-500/20 p-10 md:p-16 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Hiring top talent?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Post your job and reach thousands of qualified candidates actively looking for their next opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register?role=employer" className="btn-primary inline-flex items-center gap-2 justify-center">
              Post a Job <ArrowRight size={15} />
            </Link>
            <Link to="/companies" className="btn-outline inline-flex items-center gap-2 justify-center">
              Browse Companies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
