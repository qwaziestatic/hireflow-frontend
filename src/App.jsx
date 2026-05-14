// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root component. Wraps the entire app with AuthProvider and defines all routes.
// React Router v6 uses <Routes> and <Route> for declarative routing.
// ─────────────────────────────────────────────────────────────────────────────

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import PostJobPage from "./pages/PostJobPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicantsPage from "./pages/ApplicantsPage";
import NotFoundPage from "./pages/NotFoundPage";

// ── ProtectedRoute ────────────────────────────────────────────────────────────
// Wraps routes that require authentication.
// If not logged in → redirect to /login, saving where they wanted to go
// If logged in but wrong role → redirect to dashboard
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  // useLocation gives us the current URL so we can redirect back after login
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Save the page they tried to visit — after login we send them there
    // state={{ from: location }} is read in LoginPage to redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ── GuestRoute ────────────────────────────────────────────────────────────────
// Wraps routes that should NOT be accessible when already logged in.
// If a logged-in user visits /login or /register, redirect them to dashboard.
// Without this, a logged-in user can navigate back to login and get confused.
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in — send them to the dashboard instead
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

// ── App Layout ────────────────────────────────────────────────────────────────
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* OAuth callback — handles the redirect from Google */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected routes — any logged-in user */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />

          {/* Employer only */}
          <Route
            path="/post-job"
            element={
              <ProtectedRoute roles={["employer"]}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/applicants"
            element={
              <ProtectedRoute roles={["employer"]}>
                <ApplicantsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Root App wraps everything in AuthProvider so context is available everywhere
export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
