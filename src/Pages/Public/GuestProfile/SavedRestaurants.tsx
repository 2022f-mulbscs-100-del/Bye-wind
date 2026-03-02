import { Link } from "react-router-dom";
import { FiHeart, FiStar } from "react-icons/fi";
import type { SavedRestaurant } from "./types";

type SavedRestaurantsProps = {
  restaurants: SavedRestaurant[];
};

const SavedRestaurants = ({ restaurants }: SavedRestaurantsProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
        <FiHeart className="text-slate-400" /> Saved Restaurants
      </div>
      <div className="space-y-2">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/restaurants/${restaurant.restaurantId}`}
            className="block w-full rounded-2xl border border-transparent bg-slate-50 p-3 text-left  hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">
                  {restaurant.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{restaurant.cuisine}</div>
                <div className="mt-2 text-xs text-slate-500">{restaurant.priceRange}</div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiStar className="text-yellow-500 fill-yellow-500" />
                <span className="text-slate-600">{restaurant.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SavedRestaurants;
