// src/components/layout/Footer.jsx

import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-card mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl mb-3">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              HireFlow
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Connecting talented professionals with exceptional companies. 
              Find your next opportunity or hire top talent.
            </p>
            <div className="flex gap-3 mt-4">
              {/* Social icons */}
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-surface-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-500 transition-all">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 font-display">For Job Seekers</h4>
            <ul className="space-y-2">
              {[["Browse Jobs", "/jobs"], ["Companies", "/companies"], ["Sign Up", "/register"]].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-gray-500 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 font-display">For Employers</h4>
            <ul className="space-y-2">
              {[["Post a Job", "/post-job"], ["Dashboard", "/dashboard"], ["Get Started", "/register"]].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-gray-500 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} HireFlow. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Built with React · Node.js · PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
