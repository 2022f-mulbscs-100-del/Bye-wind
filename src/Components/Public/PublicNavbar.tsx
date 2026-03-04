import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";


const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("q") ?? "");
  }, [location.search]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("guest_cart");
      const items = stored
        ? (JSON.parse(stored) as { quantity: number }[])
        : [];
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, [location.pathname]);


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
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
        >
          <FiShoppingCart />
          Cart {cartCount > 0 ? `(${cartCount})` : ""}
        </Link>
        {isAuthenticated && <Link
          to="/guest-profile"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
        >
          Profile
        </Link>}

      </div>

    </nav>
  );
};

export default PublicNavbar;
