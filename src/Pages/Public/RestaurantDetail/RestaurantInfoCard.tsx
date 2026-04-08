import { FiCalendar, FiMapPin, FiPhone, FiStar, FiChevronDown } from "react-icons/fi";
import { useState } from "react";

type BusinessHour = {
  dayOfWeek?: string;
  openTime?: string;
  closeTime?: string;
  isOpen?: boolean;
};

type RestaurantInfo = {
  name: string;
  cuisine: string;
  rating: number;
  description: string;
  location: string;
  phone: string;
  hours: string;
  businessHours?: BusinessHour[];
};

type RestaurantInfoCardProps = {
  restaurant: RestaurantInfo;
  onWriteReview: () => void;
};

const RestaurantInfoCard = ({ restaurant, onWriteReview }: RestaurantInfoCardProps) => {
  const [showDetailedHours, setShowDetailedHours] = useState(false);

  // Format day name
  const formatDayName = (day?: string) => {
    if (!day) return "";
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  };

  // Get ordered days of week
  const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const sortedHours = restaurant.businessHours
    ? [...restaurant.businessHours].sort((a, b) => {
        const aIndex = daysOrder.indexOf(a.dayOfWeek?.toUpperCase() || "");
        const bIndex = daysOrder.indexOf(b.dayOfWeek?.toUpperCase() || "");
        return aIndex - bIndex;
      })
    : [];

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
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => setShowDetailedHours(!showDetailedHours)}
        >
          <FiCalendar className="text-slate-400" /> 
          <span className="flex items-center gap-1">
            {restaurant.hours}
            {sortedHours.length > 0 && (
              <FiChevronDown 
                size={16} 
                className={`transition-transform ${showDetailedHours ? "rotate-180" : ""}`}
              />
            )}
          </span>
        </div>
      </div>

      {/* Detailed Hours Section */}
      {showDetailedHours && sortedHours.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Weekly Hours
          </div>
          <div className="space-y-2">
            {sortedHours.map((hour, idx) => {
              const openTime = hour.openTime || "00:00";
              const closeTime = hour.closeTime || "00:00";
              
              return (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium min-w-24">
                    {formatDayName(hour.dayOfWeek)}
                  </span>
                  <span className="text-slate-700">
                    {hour.isOpen === false ? (
                      <span className="text-red-600 font-medium">Closed</span>
                    ) : (
                      `${openTime} - ${closeTime}`
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInfoCard;
