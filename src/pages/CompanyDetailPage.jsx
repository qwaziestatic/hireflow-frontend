// src/pages/CompanyDetailPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shows a company's full profile and all their active job listings.
// ─────────────────────────────────────────────────────────────────────────────

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companiesAPI } from "../services/api";
import { PageLoader, EmptyState, StatusBadge } from "../components/ui";
import {
  ArrowLeft, Globe, MapPin, Building2, Users,
  Briefcase, Calendar, ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CompanyDetailPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company", id],
    queryFn: () => companiesAPI.getById(id),
    // The API returns { company, jobs } — extract both from the response
    select: (res) => res.data,
  });

  if (isLoading) return <PageLoader />;

  if (isError || !data?.company) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-4">Company not found.</p>
        <Link to="/companies" className="btn-primary">Browse Companies</Link>
      </div>
    );
  }

  const { company, jobs } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to="/companies"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to companies
      </Link>

      {/* ── Company Header Card ── */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Logo */}
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              width="80"
              height="80"
              className="w-20 h-20 rounded-xl object-cover bg-surface-border flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-500 font-display font-bold text-3xl flex-shrink-0">
              {company.name[0]}
            </div>
          )}

          {/* Details */}
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-1">{company.name}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-4">
              {company.industry && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Briefcase size={14} className="text-brand-500" />
                  {company.industry}
                </span>
              )}
              {company.location && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <MapPin size={14} className="text-brand-500" />
                  {company.location}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Users size={14} className="text-brand-500" />
                  {company.size} employees
                </span>
              )}
              <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Calendar size={14} className="text-brand-500" />
                Since {new Date(company.created_at).getFullYear()}
              </span>
            </div>

            {/* Description */}
            {company.description && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{company.description}</p>
            )}

            {/* Website link */}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-brand-500 hover:underline text-sm"
              >
                <Globe size={14} />
                {company.website.replace(/^https?:\/\//, "")} {/* Remove http:// for display */}
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:flex-col text-center sm:text-right">
            <div>
              <p className="font-display font-bold text-3xl text-brand-500">{jobs?.length || 0}</p>
              <p className="text-gray-500 text-xs">Open Roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Job Listings ── */}
      <div>
        <h2 className="font-display font-bold text-xl mb-5">
          Open Positions ({jobs?.length || 0})
        </h2>

        {jobs?.length === 0 ? (
          <EmptyState
            title="No open positions"
            description="This company doesn't have any active job listings right now."
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="card flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:border-brand-500/50 group transition-[border-color,transform]"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-brand-500 transition-colors truncate mb-1">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {job.location && (
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <MapPin size={11} /> {job.location}
                      </span>
                    )}
                    {job.type && (
                      <span className="text-gray-500 text-xs capitalize">{job.type}</span>
                    )}
                    {job.experience && (
                      <span className="text-gray-500 text-xs">{job.experience}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {job.category && (
                    <span className="badge bg-surface text-gray-400 hidden sm:inline-flex">
                      {job.category}
                    </span>
                  )}
                  <span className="text-gray-600 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
