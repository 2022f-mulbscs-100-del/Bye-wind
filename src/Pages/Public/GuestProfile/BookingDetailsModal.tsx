import type { Booking } from "./types";

type BookingDetailsModalProps = {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  formatDate: (date: string) => string;
};

const BookingDetailsModal = ({ booking, open, onClose, formatDate }: BookingDetailsModalProps) => {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Booking details
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {booking.restaurantName}
            </div>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm text-slate-600">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-400">Date</div>
              <div className="font-semibold text-slate-900">{formatDate(booking.date)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-400">Time</div>
              <div className="font-semibold text-slate-900">{booking.time}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-400">Guests</div>
              <div className="font-semibold text-slate-900">{booking.guests}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-400">Table</div>
              <div className="font-semibold text-slate-900">{booking.table}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  booking.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {booking.status === "confirmed" ? "Confirmed" : "Pending"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Payment</span>
              <span className="font-semibold text-slate-900">${booking.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Method</span>
              <span className="text-slate-700">{booking.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Payment status</span>
              <span className="text-slate-700">
                {booking.paymentStatus === "paid" ? "Paid" : "Pay at restaurant"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Reference</span>
              <span className="text-slate-700">{booking.reference}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
