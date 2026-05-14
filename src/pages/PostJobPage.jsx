// src/pages/PostJobPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Employers use this page to post a new job listing.
// If the employer hasn't created a company yet, they're prompted to do so first.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI, companiesAPI } from "../services/api";
import { PageLoader } from "../components/ui";
import { Plus, Briefcase, Building2, X } from "lucide-react";
import toast from "react-hot-toast";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const CATEGORIES = [
  "Engineering", "Design", "Marketing", "Sales",
  "Finance", "HR", "Product", "DevOps", "Data Science", "Other",
];
const EXPERIENCE_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

export default function PostJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Used to invalidate cached data after posting

  // Tags state — managed separately because react-hook-form doesn't handle array input well
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch employer's company — they need one before posting a job
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["myCompany"],
    queryFn: () => companiesAPI.getMine(),
    select: (res) => res.data.company,
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (data) => jobsAPI.create(data),
    onSuccess: (res) => {
      toast.success("Job posted successfully!");
      // Invalidate the myJobs cache so the dashboard shows the new job
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
      navigate(`/jobs/${res.data.job.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to post job");
    },
  });

  // Add tag on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const onSubmit = (formData) => {
    if (!company) return toast.error("Please create a company profile first");
    createJobMutation.mutate({
      ...formData,
      company_id: company.id,
      tags,
      // Convert salary strings to integers (form inputs return strings)
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
    });
  };

  if (companyLoading) return <PageLoader />;

  // ── No Company Yet ────────────────────────────────────────────────────────────
  if (!company) {
    return <CreateCompanyFirst />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Briefcase size={18} className="text-brand-500" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Post a Job</h1>
            <p className="text-gray-500 text-sm">Posting for: <span className="text-white">{company.name}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Basic Info ── */}
        <div className="card space-y-5">
          <h2 className="font-display font-semibold text-lg">Job Details</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className={`input ${errors.title ? "border-red-500" : ""}`}
              placeholder="e.g. Senior React Developer"
              {...register("title", { required: "Job title is required" })}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Type + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Type</label>
              <select className="input cursor-pointer" {...register("type")}>
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface-card capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select className="input cursor-pointer" {...register("category")}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-surface-card">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Remote, New York, NY"
                {...register("location")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Experience Level</label>
              <select className="input cursor-pointer" {...register("experience")}>
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((e) => (
                  <option key={e} value={e} className="bg-surface-card">{e}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Salary Range <span className="text-gray-600">(USD / year)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                className="input"
                placeholder="Min e.g. 60000"
                {...register("salary_min", {
                  min: { value: 0, message: "Must be positive" },
                })}
              />
              <input
                type="number"
                className="input"
                placeholder="Max e.g. 90000"
                {...register("salary_max", {
                  min: { value: 0, message: "Must be positive" },
                })}
              />
            </div>
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Application Deadline <span className="text-gray-600">(optional)</span>
            </label>
            <input type="date" className="input" {...register("deadline")} />
          </div>
        </div>

        {/* ── Description & Requirements ── */}
        <div className="card space-y-5">
          <h2 className="font-display font-semibold text-lg">Description & Requirements</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={8}
              className={`input resize-y ${errors.description ? "border-red-500" : ""}`}
              placeholder="Describe the role, responsibilities, and what the ideal candidate will be doing..."
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Requirements <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              rows={5}
              className="input resize-y"
              placeholder="List required skills, qualifications, education..."
              {...register("requirements")}
            />
          </div>
        </div>

        {/* ── Tags ── */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-4">Skills / Tags</h2>
          <p className="text-gray-500 text-xs mb-3">Press Enter or comma to add a tag (max 10)</p>

          {/* Tag input */}
          <input
            type="text"
            className="input mb-3"
            placeholder="e.g. React, TypeScript, AWS..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />

          {/* Tag chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-500 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createJobMutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
        >
          {createJobMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Plus size={18} />
              Publish Job Listing
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ── Prompt to create company first ────────────────────────────────────────────
function CreateCompanyFirst() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const createCompanyMutation = useMutation({
    mutationFn: (data) => companiesAPI.create(data),
    onSuccess: () => {
      toast.success("Company created! You can now post jobs.");
      queryClient.invalidateQueries({ queryKey: ["myCompany"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create company");
    },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-5">
        <Building2 size={28} className="text-brand-500" />
      </div>
      <h2 className="font-display font-bold text-2xl mb-2">Create Your Company Profile</h2>
      <p className="text-gray-500 text-sm mb-8">
        Before posting jobs, set up your company profile so candidates know who they're applying to.
      </p>

      <form
        onSubmit={handleSubmit((data) => createCompanyMutation.mutate(data))}
        className="card text-left space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name *</label>
          <input
            type="text"
            className={`input ${errors.name ? "border-red-500" : ""}`}
            placeholder="Acme Inc."
            {...register("name", { required: "Company name is required" })}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Industry</label>
          <input type="text" className="input" placeholder="e.g. Software, Finance" {...register("industry")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
          <input type="text" className="input" placeholder="e.g. San Francisco, CA" {...register("location")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
          <input type="url" className="input" placeholder="https://yourcompany.com" {...register("website")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Size</label>
          <select className="input cursor-pointer" {...register("size")}>
            <option value="">Select size</option>
            {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
              <option key={s} value={s} className="bg-surface-card">{s} employees</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">About the Company</label>
          <textarea rows={3} className="input resize-none" placeholder="Brief description..." {...register("description")} />
        </div>
        <button
          type="submit"
          disabled={createCompanyMutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {createCompanyMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Plus size={15} /> Create Company & Continue</>
          )}
        </button>
      </form>
    </div>
  );
}
