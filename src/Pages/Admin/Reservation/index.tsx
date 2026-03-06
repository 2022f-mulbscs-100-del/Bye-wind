import { useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiShuffle,
  FiUserPlus,
  FiXCircle,
  FiMoreHorizontal,
} from "react-icons/fi";

const initialReservations = [
  {
    id: "R-2041",
    name: "Maya Carter",
    time: "Today, 7:30 PM",
    party: 4,
    status: "Confirmed",
    table: "T-08",
    source: "Web",
  },
  {
    id: "R-2042",
    name: "Liam Nguyen",
    time: "Today, 8:15 PM",
    party: 2,
    status: "Pending",
    table: "T-03",
    source: "App",
  },
  {
    id: "R-2043",
    name: "Ava Diaz",
    time: "Tomorrow, 6:00 PM",
    party: 6,
    status: "Reserved",
    table: "T-12",
    source: "Phone",
  },
];

const waitlist = [
  { id: "W-01", name: "Jade Kim", size: 2, preference: "Outdoor", eta: "10 min" },
  { id: "W-02", name: "Rafael Ortiz", size: 4, preference: "Indoor", eta: "20 min" },
];

const availability = ["5:30 PM", "6:00 PM", "6:30 PM", "7:30 PM"];

const tableStatus = [
  { table: "T-01", status: "Available" },
  { table: "T-02", status: "Reserved" },
  { table: "T-03", status: "Occupied" },
  { table: "T-04", status: "Cleaning" },
];

const heatmap = [
  { time: "5 PM", indoor: 40, outdoor: 20, bar: 15 },
  { time: "6 PM", indoor: 70, outdoor: 40, bar: 35 },
  { time: "7 PM", indoor: 90, outdoor: 55, bar: 45 },
  { time: "8 PM", indoor: 75, outdoor: 30, bar: 25 },
];

const Reservation = () => {
  const [view, setView] = useState("Day");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reservations, setReservations] = useState(initialReservations);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    name: "",
    date: "",
    time: "",
    party: 2,
    table: "",
    source: "Web",
  });

  const openReservationModal = (source: "Web" | "App" | "Phone" | "Walk-in" = "Web") => {
    setNewReservation((prev) => ({ ...prev, source }));
    setIsNewReservationOpen(true);
  };

  const addReservation = () => {
    const trimmedName = newReservation.name.trim();
    if (!trimmedName || !newReservation.date || !newReservation.time || !newReservation.table.trim()) {
      return;
    }

    const nextIdNumber =
      Math.max(
        ...reservations.map((item) => {
          const parsed = Number(item.id.replace("R-", ""));
          return Number.isFinite(parsed) ? parsed : 0;
        }),
        2040
      ) + 1;

    const dateObj = new Date(newReservation.date);
    const todayObj = new Date();
    const tomorrowObj = new Date();
    tomorrowObj.setDate(todayObj.getDate() + 1);
    const normalized = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const today = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());
    const tomorrow = new Date(tomorrowObj.getFullYear(), tomorrowObj.getMonth(), tomorrowObj.getDate());

    const dateLabel =
      normalized.getTime() === today.getTime()
        ? "Today"
        : normalized.getTime() === tomorrow.getTime()
        ? "Tomorrow"
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const [hourRaw, minuteRaw] = newReservation.time.split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    const timeLabel = `${twelveHour}:${String(minute).padStart(2, "0")} ${period}`;

    const created = {
      id: `R-${nextIdNumber}`,
      name: trimmedName,
      time: `${dateLabel}, ${timeLabel}`,
      party: Number(newReservation.party),
      status: "Confirmed",
      table: newReservation.table.trim(),
      source: newReservation.source,
    };

    setReservations((prev) => [created, ...prev]);
    setNewReservation({
      name: "",
      date: "",
      time: "",
      party: 2,
      table: "",
      source: "Web",
    });
    setIsNewReservationOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Reservations
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Reservation Dashboard</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            <FiFilter /> Filters
          </button>
          <button
            type="button"
            onClick={() => openReservationModal("Web")}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            <FiPlus /> New Reservation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Online booking form</div>
              <p className="mt-1 text-sm text-slate-500">Web & App booking widget</p>
            </div>
            <FiCalendar className="text-slate-400" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              "Reservation date",
              "Preferred time slot",
              "Party size",
              "Seating preferences",
              "Guest name",
              "Phone number",
              "Email address",
              "Special requests",
            ].map((label) => (
              <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {label}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {availability.map((slot) => (
              <span key={slot} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {slot}
              </span>
            ))}
            <span className="text-xs text-slate-500">Real‑time availability</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiUserPlus /> Walk‑in entry
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {[
              "Party size",
              "Arrival time",
              "Seating preference",
              "Guest name",
              "Contact details",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-2">
                {item}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openReservationModal("Walk-in")}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            Add walk‑in
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Calendar dashboard</div>
          <div className="flex gap-2">
            {["Day", "Week", "Month"].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  view === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 px-4 py-2">Filter: Location</div>
          <div className="rounded-xl bg-slate-50 px-4 py-2">Filter: Status</div>
          <div className="rounded-xl bg-slate-50 px-4 py-2">Filter: Source</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Active reservations</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Party</th>
                  <th className="pb-3 font-medium">Table</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {reservations.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{item.id}</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.time}</td>
                    <td className="py-3">{item.party}</td>
                    <td className="py-3">{item.table}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                          }
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                        >
                          <FiMoreHorizontal />
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                              <FiEdit2 /> Modify
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                              <FiXCircle /> Cancel
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                              <FiCheckCircle /> No‑show
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Waitlist queue</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {waitlist.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2">
                  <span>{item.name} · {item.size}</span>
                  <span className="text-xs text-slate-500">{item.eta}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Auto table allocation</div>
            <div className="mt-3 text-sm text-slate-500">Assign best table based on preferences & capacity.</div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              <FiShuffle /> Run allocation
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Table status</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
            {tableStatus.map((item) => (
              <div key={item.table} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2">
                <span>{item.table}</span>
                <span className="text-xs text-slate-500">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Table merge / split</div>
          <div className="mt-3 text-sm text-slate-500">Merge tables for large parties or split back.</div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Merge tables
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Split tables
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Occupancy heatmap</div>
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600">
          {heatmap.map((row) => (
            <div key={row.time} className="flex items-center gap-2">
              <span className="w-12 text-xs text-slate-500">{row.time}</span>
              {[row.indoor, row.outdoor, row.bar].map((value, index) => (
                <div
                  key={index}
                  className="h-3 flex-1 rounded-full"
                  style={{ backgroundColor: `rgba(14,165,233,${value / 100})` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {isNewReservationOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">
                {newReservation.source === "Walk-in" ? "Add Walk-in" : "Create New Reservation"}
              </div>
              <button
                type="button"
                onClick={() => setIsNewReservationOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Close new reservation modal"
              >
                <FiXCircle />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={newReservation.name}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Guest name"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                type="date"
                value={newReservation.date}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, date: event.target.value }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                type="time"
                value={newReservation.time}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, time: event.target.value }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                type="number"
                min={1}
                value={newReservation.party}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, party: Number(event.target.value) }))
                }
                placeholder="Party size"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                value={newReservation.table}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, table: event.target.value }))
                }
                placeholder="Table (e.g. T-08)"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <select
                value={newReservation.source}
                onChange={(event) =>
                  setNewReservation((prev) => ({ ...prev, source: event.target.value }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <option value="Web">Web</option>
                <option value="App">App</option>
                <option value="Phone">Phone</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewReservationOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addReservation}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Save reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
