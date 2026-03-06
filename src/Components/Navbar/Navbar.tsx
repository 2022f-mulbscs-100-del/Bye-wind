import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
};

const Navbar = ({ showMenuButton = false, onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_name");
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center gap-3 sm:w-auto">
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
            aria-label="Open Sidebar"
          >
            <FiMenu />
          </button>
        )}
        <div className="hidden text-sm font-medium text-slate-500 md:block">Admin Panel</div>
        <div className="relative flex-1 sm:flex-none">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full max-w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none sm:w-[260px] lg:w-[360px]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Notifications"
          title="Notifications"
        >
          <FiBell />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://i.pravatar.cc/40?img=12"
            alt="Profile"
            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
          />
          <a
            href="/dashboard/profile"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 hidden sm:inline-flex"
          >
            Profile
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FiLogOut />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
