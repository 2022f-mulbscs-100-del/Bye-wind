type UpcomingSlot = { name: string; status: "Available" | "Limited" | "Full" };

type BookTableCardProps = {
  slots: UpcomingSlot[];
  onStart: () => void;
};

const BookTableCard = ({ slots, onStart }: BookTableCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Book a table</div>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            No time slots available right now.
          </div>
        ) : (
          slots.map((slot) => (
            <div key={slot.name} className="flex items-center justify-between">
              <span>{slot.name}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  slot.status === "Available"
                    ? "bg-emerald-50 text-emerald-600"
                    : slot.status === "Limited"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {slot.status}
              </span>
            </div>
          ))
        )}
      </div>
      <button
        className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        onClick={onStart}
      >
        Start reservation
      </button>
    </div>
  );
};

export default BookTableCard;
