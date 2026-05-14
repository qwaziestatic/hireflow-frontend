// src/pages/JobsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// The main job browsing page with search, filters sidebar, and paginated results.
// URL query params are used so filters are shareable/bookmarkable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
// keepPreviousData: in TanStack Query v5 this is imported as a function, NOT a boolean flag.
// It prevents the UI from flashing empty state while loading the next page.
import { Search, SlidersHorizontal, X } from "lucide-react";
import { jobsAPI } from "../services/api";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import { Spinner, Pagination, EmptyState } from "../components/ui";

export default function JobsPage() {
  // useSearchParams reads/writes ?key=value in the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filter state FROM URL params (so direct links work)
  const [filters, setFilters] = useState({
    search:   searchParams.get("search")   || "",
    category: searchParams.get("category") || "",
    type:     searchParams.get("type")     || "",
    location: searchParams.get("location") || "",
    sort:     searchParams.get("sort")     || "newest",
    page:     parseInt(searchParams.get("page")) || 1,
  });

  // Sync filter state → URL whenever filters change
  // This makes filters bookmarkable and shareable
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== "" && val !== 1) params[key] = val;
    });
    setSearchParams(params, { replace: true }); // replace: true avoids polluting browser history
  }, [filters]);

  // Fetch jobs from API — React Query re-fetches whenever queryKey changes (i.e., filters change)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs", filters], // Unique key for this specific combination of filters
    queryFn: () => jobsAPI.getAll(filters),
    select: (res) => res.data,
    placeholderData: keepPreviousData, // v5 API: keeps old page visible while next page loads
  });

  const clearFilters = () => {
    setFilters({ search: "", category: "", type: "", location: "", sort: "newest", page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Find Your Next Job</h1>
        <p className="text-gray-500">
          {data?.pagination?.total
            ? `${data.pagination.total.toLocaleString()} jobs available`
            : "Browse thousands of opportunities"}
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="input pl-11 pr-4 py-3.5 text-sm"
          placeholder="Search by title, skill, or keyword..."
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
        />
      </div>

      {/* ── Sort + Mobile Filter Toggle ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value, page: 1 }))}
            className="input w-auto py-2 text-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Mobile filter toggle button */}
          <button
            className="lg:hidden flex items-center gap-2 btn-outline py-2 text-sm"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <button
              onClick={() => setFilters((p) => ({ ...p, category: "", page: 1 }))}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-500/20 text-brand-500 hover:bg-brand-500/30"
            >
              {filters.category} <X size={11} />
            </button>
          )}
          {filters.type && (
            <button
              onClick={() => setFilters((p) => ({ ...p, type: "", page: 1 }))}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-500/20 text-brand-500 hover:bg-brand-500/30"
            >
              {filters.type} <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Desktop Filters Sidebar ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <JobFilters filters={filters} setFilters={setFilters} onClear={clearFilters} />
        </aside>

        {/* ── Mobile Filters Overlay ── */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-card overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <JobFilters filters={filters} setFilters={setFilters} onClear={clearFilters} />
            </div>
          </div>
        )}

        {/* ── Job Results ── */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : isError ? (
            <div className="text-center py-20 text-red-400">Failed to load jobs. Please try again.</div>
          ) : data?.jobs?.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description="Try adjusting your search terms or filters."
              action={
                <button onClick={clearFilters} className="btn-outline text-sm">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <>
              {/* Job Cards Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={filters.page}
                totalPages={data.pagination.totalPages}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
