// src/pages/NotFoundPage.jsx

import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Large 404 */}
      <p className="font-display font-extrabold text-[120px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-brand-500/60 to-brand-900/20 mb-4 select-none">
        404
      </p>

      <h1 className="font-display font-bold text-2xl mb-3">Page not found</h1>
      <p className="text-gray-500 text-sm max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
          <Home size={15} /> Go Home
        </Link>
        <Link to="/jobs" className="btn-outline flex items-center gap-2 justify-center">
          <Search size={15} /> Browse Jobs
        </Link>
      </div>
    </div>
  );
}
