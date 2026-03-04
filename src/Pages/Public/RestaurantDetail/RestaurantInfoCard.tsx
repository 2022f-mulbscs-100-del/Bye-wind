import { FiCalendar, FiMapPin, FiPhone, FiStar } from "react-icons/fi";

type RestaurantInfo = {
  name: string;
  cuisine: string;
  rating: number;
  description: string;
  location: string;
  phone: string;
  hours: string;
};

type RestaurantInfoCardProps = {
  restaurant: RestaurantInfo;
  onWriteReview: () => void;
};

const RestaurantInfoCard = ({ restaurant, onWriteReview }: RestaurantInfoCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Restaurant
          </div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">
            {restaurant.name}
          </div>
          <div className="mt-2 text-sm text-slate-500">{restaurant.cuisine}</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          <FiStar /> {restaurant.rating}
        </span>
      </div>
      <div className="mt-4">
        <button
          onClick={onWriteReview}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Write a review
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-500">{restaurant.description}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-slate-400" /> {restaurant.location}
        </div>
        <div className="flex items-center gap-2">
          <FiPhone className="text-slate-400" /> {restaurant.phone}
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-400" /> {restaurant.hours}
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfoCard;
