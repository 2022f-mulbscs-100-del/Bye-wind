import { CiDark } from "react-icons/ci";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";


const PublicNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";


  return (
    <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm
    sm:flex-row flex-col
    ">
      <Link to="/" className="text-lg font-semibold text-slate-900">
        ByeWind
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={`rounded-full border px-3 py-2 text-sm shadow-sm hover:bg-slate-50 cursor-pointer ${isDark
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-600"
            }`}
          aria-label="Dark Mode"
          title="Dark Mode"
        >
          <CiDark />
        </button>
        <Link
          to="/restaurants"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Restaurants
        </Link>


        {isAuthenticated && <Link
          to="/guest-profile"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Profile
        </Link>}

      </div>

    </nav>
  );
};

export default PublicNavbar;
