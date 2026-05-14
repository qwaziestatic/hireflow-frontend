// src/components/layout/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Top navigation bar. Shows different links based on auth state and user role.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Menu, X, ChevronDown, User, LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);   // Mobile menu toggle
  const [dropdownOpen, setDropdownOpen] = useState(false); // User dropdown toggle

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect home after logout
  };

  // NavLink automatically adds "active" class when the route matches
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-brand-500 font-medium text-sm"
      : "text-gray-400 hover:text-white text-sm transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-surface-card/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span>HireFlow</span>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/jobs" className={linkClass}>Find Jobs</NavLink>
            <NavLink to="/companies" className={linkClass}>Companies</NavLink>
            {user?.role === "employer" && (
              <NavLink to="/post-job" className={linkClass}>Post a Job</NavLink>
            )}
          </div>

          {/* ── Right Side: Auth Buttons or User Menu ── */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                {/* Guest: show login and register buttons */}
                <Link to="/login" className="btn-outline text-sm py-2 px-4">Log In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            ) : (
              // Logged in: show avatar dropdown
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-surface-border/50 rounded-xl px-3 py-2 transition-colors"
                >
                  {/* Avatar: show image if available, otherwise initial */}
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-surface-card border border-surface-border rounded-2xl shadow-xl overflow-hidden animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-surface-border">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-border/50 hover:text-white transition-colors"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-border/50 hover:text-white transition-colors"
                      >
                        <User size={15} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-surface-border space-y-2 animate-slide-up">
            <NavLink to="/jobs" className="block py-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Find Jobs</NavLink>
            <NavLink to="/companies" className="block py-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Companies</NavLink>
            {user?.role === "employer" && (
              <NavLink to="/post-job" className="block py-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Post a Job</NavLink>
            )}
            {!user ? (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-outline text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            ) : (
              <div className="pt-2 space-y-1">
                <Link to="/dashboard" className="block py-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="block py-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Log Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
