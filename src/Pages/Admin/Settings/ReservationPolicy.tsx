import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import { FiSave, FiRotateCcw, FiInfo } from "react-icons/fi";

export default function ReservationPolicy() {
  const { settings, setSettings, isLoading, hasChanges, saveSettings, resetSettings, selectedBranchId } = useSettingsData();

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size={40} /></div>;

  if (!selectedBranchId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Select a Branch</h2>
        <p className="mt-2 text-slate-500 text-sm">Please select a specific branch from the sidebar to manage reservation rules.</p>
      </div>
    );
  }

  const fields = [
    { label: "Minimum Party Size", key: "minPartySize", help: "The smallest group size allowed for an online booking." },
    { label: "Maximum Party Size", key: "maxPartySize", help: "The largest group size allowed for an online booking." },
    { label: "Advance Booking (Days)", key: "advanceBookingDays", help: "How many days in advance a guest can book a table." },
    { label: "Same-Day Cutoff (Minutes)", key: "sameDayCutoffMins", help: "Minutes before the booking time to stop accepting same-day reservations." },
    { label: "Cancellation Window (Hours)", key: "cancellationWindowHours", help: "Hours before the booking time to allow free cancellations or modifications." },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Operations</div>
          <h1 className="text-2xl font-bold text-slate-900">Reservation Rules</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={() => saveSettings("ops")}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {fields.map(field => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">{field.label}</label>
                <div className="group relative">
                  <FiInfo className="text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-900 p-2 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                    {field.help}
                  </div>
                </div>
              </div>
              <input
                type="number"
                value={(settings.reservationPolicy as any)[field.key]}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reservationPolicy: { ...prev.reservationPolicy, [field.key]: Number(e.target.value) }
                }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={settings.reservationPolicy.autoConfirm}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reservationPolicy: { ...prev.reservationPolicy, autoConfirm: e.target.checked }
                }))}
                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Auto-confirm reservations</div>
              <p className="text-xs text-slate-500 mt-0.5">When enabled, all bookings that fit within your availability rules will be automatically confirmed without manual host approval.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
