import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiInfo,
  FiRotateCcw,
  FiSave,
  FiUsers,
} from "react-icons/fi";

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
    {
      label: "Minimum Party Size",
      key: "minPartySize",
      help: "The smallest group size allowed for an online booking.",
      icon: <FiUsers className="text-slate-400" />,
    },
    {
      label: "Maximum Party Size",
      key: "maxPartySize",
      help: "The largest group size allowed for an online booking.",
      icon: <FiUsers className="text-slate-400" />,
    },
    {
      label: "Advance Booking (Days)",
      key: "advanceBookingDays",
      help: "How many days in advance a guest can book a table.",
      icon: <FiCalendar className="text-slate-400" />,
    },
    {
      label: "Same-Day Cutoff (Minutes)",
      key: "sameDayCutoffMins",
      help: "Minutes before the booking time to stop accepting same-day reservations.",
      icon: <FiClock className="text-slate-400" />,
    },
    {
      label: "Cancellation Window (Hours)",
      key: "cancellationWindowHours",
      help: "Hours before the booking time to allow free cancellations or modifications.",
      icon: <FiAlertCircle className="text-slate-400" />,
    },
  ];

  type ReservationPolicyKey =
    | "minPartySize"
    | "maxPartySize"
    | "advanceBookingDays"
    | "sameDayCutoffMins"
    | "cancellationWindowHours";

  return (
    <div className="max-w-6xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <FiCalendar className="text-slate-500" />
              Operations
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Reservation Rules
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Define booking guardrails, guest limits, confirmation behavior, and same-day reservation controls for the selected branch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SummaryCard
              label="Party range"
              value={`${settings.reservationPolicy.minPartySize}-${settings.reservationPolicy.maxPartySize}`}
            />
            <SummaryCard
              label="Advance window"
              value={`${settings.reservationPolicy.advanceBookingDays} days`}
            />
            <SummaryCard
              label="Auto-confirm"
              value={settings.reservationPolicy.autoConfirm ? "Enabled" : "Manual"}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={() => saveSettings("ops", "policy")}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-lg font-semibold text-slate-900">Booking Controls</h2>
            <p className="mt-1 text-sm text-slate-500">
              Adjust reservation limits and operational thresholds that shape guest booking access.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map(field => (
              <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      {field.icon}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">{field.label}</label>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {field.help}
                      </p>
                    </div>
                  </div>
                  <div className="group relative">
                    <FiInfo className="cursor-help text-slate-400" />
                    <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-52 rounded-lg bg-slate-900 p-2 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {field.help}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={settings.reservationPolicy[field.key as ReservationPolicyKey]}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    reservationPolicy: { ...prev.reservationPolicy, [field.key]: Number(e.target.value) }
                  }))}
                  className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FiSave />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Confirmation Policy</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose whether reservations are confirmed automatically or reviewed manually by staff.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={settings.reservationPolicy.autoConfirm}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    reservationPolicy: { ...prev.reservationPolicy, autoConfirm: e.target.checked }
                  }))}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Auto-confirm reservations</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  When enabled, bookings that fit within your availability rules will be confirmed automatically without manual host approval.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Current Summary
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Guest party size</span>
                <span className="font-semibold text-slate-900">
                  {settings.reservationPolicy.minPartySize} to {settings.reservationPolicy.maxPartySize}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Advance booking</span>
                <span className="font-semibold text-slate-900">
                  {settings.reservationPolicy.advanceBookingDays} days
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Same-day cutoff</span>
                <span className="font-semibold text-slate-900">
                  {settings.reservationPolicy.sameDayCutoffMins} minutes
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Cancellation window</span>
                <span className="font-semibold text-slate-900">
                  {settings.reservationPolicy.cancellationWindowHours} hours
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
