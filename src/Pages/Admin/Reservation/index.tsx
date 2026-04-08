import { useState } from "react";
import { useBranchContext } from "@/context/BranchContext";
import {
  FiCalendar,
  FiFilter,
  FiPlus,
  FiShuffle,
  FiUserPlus,
  FiXCircle,
  FiMoreHorizontal,
} from "react-icons/fi";
import { useEffect } from "react";
import { getJson, postJson } from "@/lib/api";
import { toast } from "sonner";

const heatmap = [
  { time: "5 PM", indoor: 40, outdoor: 20, bar: 15 },
  { time: "6 PM", indoor: 70, outdoor: 40, bar: 35 },
  { time: "7 PM", indoor: 90, outdoor: 55, bar: 45 },
  { time: "8 PM", indoor: 75, outdoor: 30, bar: 25 },
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

const Reservation = () => {
  const { selectedBranchId, branches } = useBranchContext();
  const [view, setView] = useState("Day");
  const [reservations, setReservations] = useState<any[]>([]);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    party: 2,
    tableId: "",
    source: "Web",
  });

  const fetchReservations = async () => {
    if (!selectedBranchId) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await getJson<any[]>(`/reservations/by-date?branchId=${selectedBranchId}&date=${today}`);
      setReservations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedBranchId]);

  const openReservationModal = (source: "Web" | "App" | "Phone" | "Walk-in" = "Web") => {
    setNewReservation((prev) => ({ ...prev, source }));
    setIsNewReservationOpen(true);
  };

  const addReservation = async () => {
    const trimmedName = newReservation.name.trim();
    if (!trimmedName || !newReservation.date || !newReservation.time || !selectedBranchId) {
      toast.error("Please fill all required fields");
      return;
    }

    const toastId = toast.loading("Adding reservation...");
    try {
      await postJson("/reservations", {
        branchId: selectedBranchId,
        guestName: trimmedName,
        partySize: Number(newReservation.party),
        reservationDate: `${newReservation.date}T00:00:00.000Z`,
        timeSlot: newReservation.time,
        source: newReservation.source,
        tableId: newReservation.tableId || undefined,
      });

      toast.success("Reservation added successfully", { id: toastId });
      fetchReservations();
      setNewReservation({
        name: "",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        party: 2,
        tableId: "",
        source: "Web",
      });
      setIsNewReservationOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add reservation", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {!selectedBranchId ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Select a Branch</h2>
          <p className="mt-2 text-sm text-slate-500">
            Please select a specific branch from the sidebar to view and manage reservations.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reservations
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-semibold text-slate-900">Reservation Dashboard</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {branches.find(b => b.id === selectedBranchId)?.name}
                </span>
              </div>
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
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${view === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
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
                    {reservations.length > 0 ? (
                      reservations.map((item: any) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="py-3 font-medium text-slate-900">#{item.id.slice(0, 8)}</td>
                          <td className="py-3 font-medium text-slate-900">{item.guestName}</td>
                          <td className="py-3">{item.timeSlot}</td>
                          <td className="py-3">{item.partySize}</td>
                          <td className="py-3">{item.tableId || "Unassigned"}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                              }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                              >
                                <FiMoreHorizontal />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          No reservations found for today.
                        </td>
                      </tr>
                    )}
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
                    value={newReservation.tableId}
                    onChange={(event) =>
                      setNewReservation((prev) => ({ ...prev, tableId: event.target.value }))
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
        </>
      )}
    </div>
  );
};

export default Reservation;
