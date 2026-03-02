import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import type { Booking } from "./types";

type UpcomingReservationsProps = {
  bookings: Booking[];
  formatDate: (date: string) => string;
  onSelect: (booking: Booking) => void;
};

const UpcomingReservations = ({ bookings, formatDate, onSelect }: UpcomingReservationsProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-slate-900">Upcoming Reservations</div>
        <div className="text-sm text-slate-500">{bookings.length} bookings</div>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No upcoming reservations
          </div>
        ) : (
          bookings.map((booking) => (
            <button
              key={booking.id}
              className="w-full text-left rounded-2xl bg-slate-50 p-4 hover:bg-slate-100 "
              onClick={() => onSelect(booking)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {booking.restaurantName}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-slate-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiClock className="text-slate-400" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiUser className="text-slate-400" />
                      {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingReservations;
