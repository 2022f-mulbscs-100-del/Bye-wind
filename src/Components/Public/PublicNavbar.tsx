import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, isSessionActive } from "@/lib/auth";


const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = isSessionActive();
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(location.search).get("q") ?? ""
  );

  const handleSignOut = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <nav className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <Link to="/" className="shrink-0 text-lg font-semibold text-slate-900">
          ByeWind
        </Link>
        <div className="hidden h-6 w-px bg-slate-200 lg:block" />
        <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 lg:max-w-md">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or cuisine"
            className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                navigate(
                  `/restaurant-search${searchTerm.trim() ? `?q=${encodeURIComponent(searchTerm.trim())}` : ""}`
                );
              }
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
        <Link
          to="/restaurants"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
        >
          Restaurants
        </Link>
        {/* <Link
          to="/cart"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
        >
          Cart
        </Link> */}
        {isAuthenticated && <Link
          to="/guest-profile"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
        >
          Profile
        </Link>}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
          >
            <FiLogOut />
            Sign out
          </button>
        )}

      </div>

    </nav>
  );
};

export default PublicNavbar;
