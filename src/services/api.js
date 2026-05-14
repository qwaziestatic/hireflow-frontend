// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// This file creates a single Axios instance that all API calls use.
// Benefits:
//   - Automatically attaches the JWT token to every request
//   - Handles 401 errors globally (auto-logout)
//   - All requests go to the same base URL
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// Create an Axios instance with default configuration
const api = axios.create({
  // Base URL: all requests are prefixed with this.
  // e.g., api.get('/jobs') → GET http://localhost:5000/api/jobs
  baseURL: import.meta.env.VITE_API_URL || "/api",

  // Default headers sent with every request
  headers: { "Content-Type": "application/json" },

  timeout: 10000, // Cancel requests that take longer than 10 seconds
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// This runs BEFORE every request is sent.
// We use it to attach the JWT token to the Authorization header.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (stored after login/register)
    const token = localStorage.getItem("token");

    if (token) {
      // Add the Bearer token so the backend's authenticate middleware recognizes it
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return the modified config to proceed with the request
  },
  (error) => Promise.reject(error) // If config setup fails, reject the promise
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
// This runs AFTER every response is received.
// We use it to handle 401 Unauthorized globally — auto-logout the user.
api.interceptors.response.use(
  (response) => response, // If response is successful, pass it through unchanged

  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on the login page (avoid infinite loops)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error); // Always reject so the calling code can handle the error
  }
);

// ── AUTH API CALLS ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  googleLogin: () => {
    // For Google OAuth, we redirect the browser — not an API call
    window.location.href = `${import.meta.env.VITE_API_URL || "/api"}/auth/google`;
  },
};

// ── JOBS API CALLS ────────────────────────────────────────────────────────────
export const jobsAPI = {
  // params is an object like { search, category, type, page }
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get("/jobs/my-jobs"),
};

// ── COMPANIES API CALLS ───────────────────────────────────────────────────────
export const companiesAPI = {
  getAll: (params) => api.get("/companies", { params }),
  getById: (id) => api.get(`/companies/${id}`),
  getMine: () => api.get("/companies/mine"),
  create: (data) => api.post("/companies", data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// ── APPLICATIONS API CALLS ────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (data) => api.post("/applications", data),
  getMyApplications: () => api.get("/applications/my"),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

// ── SAVED JOBS API CALLS ──────────────────────────────────────────────────────
export const savedJobsAPI = {
  getAll: () => api.get("/saved-jobs"),
  toggle: (jobId) => api.post(`/saved-jobs/${jobId}`),
};

export default api;
