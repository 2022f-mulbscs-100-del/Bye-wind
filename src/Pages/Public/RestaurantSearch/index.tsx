import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import type { RestaurantsData } from "../Restaurants/types";

const RestaurantSearch = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<RestaurantsData>({
    filters: [],
    restaurants: [],
    featuredAreas: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<"top-rated" | "name">("top-rated");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    let mounted = true;

    fetch("/DummyApis/restaurants.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((restaurantsJson) => {
        if (!mounted || !restaurantsJson) return;
        setData(restaurantsJson);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cuisines = useMemo(() => {
    const unique = new Set(data.restaurants.map((item) => item.cuisine));
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [data.restaurants]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = data.restaurants.filter((item) => {
      const matchesCuisine = selectedCuisine === "All" || item.cuisine === selectedCuisine;
      if (!matchesCuisine) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.cuisine.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (b.rating === a.rating) return a.name.localeCompare(b.name);
      return b.rating - a.rating;
    });
  }, [data.restaurants, query, selectedCuisine, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none space-y-6 px-6 py-6 md:px-10 md:py-8">
        <PublicNavbar />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Restaurant Search</h1>
            <p className="text-sm text-slate-500">Use the top bar search. Refine results with filters below.</p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-xs font-medium text-slate-500">
              Active query: <span className="font-semibold text-slate-700">{query || "All restaurants"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 sm:w-[220px]"
              >
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "top-rated" | "name")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 sm:w-[180px]"
              >
                <option value="top-rated">Sort: Top Rated</option>
                <option value="name">Sort: Name A-Z</option>
              </select>

              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
                    layoutMode === "grid" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("list")}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
                    layoutMode === "list" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium text-slate-600">
            {loading ? "Loading results..." : `${results.length} result(s)`}
          </div>

          <div className={layoutMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid grid-cols-1 gap-4"}>
            {!loading &&
              results.map((restaurant) => (
                <article
                  key={restaurant.id}
                  className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
                    layoutMode === "list" ? "sm:grid sm:grid-cols-[220px_1fr]" : ""
                  }`}
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className={
                      layoutMode === "list"
                        ? "h-44 w-full object-cover sm:h-full sm:min-h-[176px] sm:w-[220px]"
                        : "h-40 w-full object-cover"
                    }
                  />
                  <div
                    className={`space-y-2 p-4 ${
                      layoutMode === "list" ? "sm:flex sm:min-h-[176px] sm:flex-col sm:justify-between" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-slate-900">{restaurant.name}</h2>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {restaurant.cuisine} • {restaurant.location}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-sm">
                      <span className="font-medium text-slate-700">Next slot: {restaurant.nextSlot}</span>
                      <Link
                        to={`/restaurants/${restaurant.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
          </div>

          {!loading && results.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No restaurants matched your search.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RestaurantSearch;
