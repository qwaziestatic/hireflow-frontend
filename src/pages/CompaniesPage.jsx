// src/pages/CompaniesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays a searchable, paginated grid of all company profiles.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { companiesAPI } from "../services/api";
import { Spinner, Pagination, EmptyState } from "../components/ui";
import { Search, Building2, MapPin, Briefcase } from "lucide-react";

// ── Company Card Component ────────────────────────────────────────────────────
function CompanyCard({ company }) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="card hover:border-brand-500/40 group transition-all animate-fade-in"
    >
      {/* Logo + Name */}
      <div className="flex items-center gap-4 mb-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-14 h-14 rounded-xl object-cover bg-surface-border"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-500 font-display font-bold text-xl">
            {company.name[0]}
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold group-hover:text-brand-500 transition-colors">
            {company.name}
          </h3>
          {company.industry && (
            <p className="text-gray-500 text-xs mt-0.5">{company.industry}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {company.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          {company.location && (
            <span className="flex items-center gap-1 text-gray-600 text-xs">
              <MapPin size={11} /> {company.location}
            </span>
          )}
          {company.size && (
            <span className="flex items-center gap-1 text-gray-600 text-xs">
              <Building2 size={11} /> {company.size}
            </span>
          )}
        </div>

        {/* Job count badge */}
        <span className="flex items-center gap-1 text-xs text-brand-500 font-medium">
          <Briefcase size={12} />
          {company.job_count} {parseInt(company.job_count) === 1 ? "job" : "jobs"}
        </span>
      </div>
    </Link>
  );
}

// ── Main Companies Page ───────────────────────────────────────────────────────
export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["companies", search, page],
    queryFn: () => companiesAPI.getAll({ search, page, limit: 12 }),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Explore Companies</h1>
        <p className="text-gray-500">
          {data?.pagination?.total
            ? `${data.pagination.total} companies hiring right now`
            : "Discover top companies and their open roles"}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="input pl-11"
          placeholder="Search by company name or industry..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to page 1 on new search
          }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : data?.companies?.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Try a different search term."
          action={
            <button onClick={() => setSearch("")} className="btn-outline text-sm">
              Clear search
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
