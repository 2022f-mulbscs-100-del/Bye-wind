import { Link } from "react-router-dom";
import { FiClock, FiHeart, FiMapPin, FiStar, FiTag } from "react-icons/fi";
import type { Restaurant } from "./types";
import Placeholder from "@/Components/placeholder";

type RestaurantGridProps = {
  restaurants: Restaurant[];
  loading: boolean;
  favoriteIds: Set<string>;
  onToggleFavorite: (restaurant: Restaurant) => void;
};

const RestaurantGrid = ({
  restaurants,
  loading,
  favoriteIds,
  onToggleFavorite,
}: RestaurantGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={`placeholder-${idx}`}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-5 space-y-3"
          >
            <Placeholder height={176} />
            <Placeholder width="60%" height={18} />
            <Placeholder width="40%" height={14} />
            <Placeholder width="70%" height={14} />
            <div className="flex gap-2">
              <Placeholder width={60} height={22} />
              <Placeholder width={80} height={22} />
            </div>
            <div className="flex items-center justify-between">
              <Placeholder width={90} height={28} />
              <Placeholder width={70} height={28} />
            </div>
          </div>
        ))
      ) : (
        restaurants.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-44 w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-900">{item.name}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                  <FiStar /> {item.rating}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-500">{item.cuisine}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FiMapPin className="text-slate-400" /> {item.location}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  <FiTag /> {item.price}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  <FiClock /> Next: {item.nextSlot}
                </span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  to={`/restaurants/${item.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  View details
                </Link>
                <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  Book now
                </button>
                <button
                  onClick={() => onToggleFavorite(item)}
                  className={`inline-flex items-center justify-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold ${
                    favoriteIds.has(item.id)
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <FiHeart />
                  {favoriteIds.has(item.id) ? "Saved" : "Favorite"}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RestaurantGrid;
