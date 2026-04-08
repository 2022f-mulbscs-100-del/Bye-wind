import { useState } from "react";
import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

export default function BusinessHours() {
  const {
    settings, setSettings, isLoading, hasChanges, 
    saveSettings, resetSettings, selectedBranchId,
    saveHoliday, updateHoliday, deleteHoliday
  } = useSettingsData();
  const [holidayDraft, setHolidayDraft] = useState({ name: "", startDate: "" });
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size={40} /></div>;

  if (!selectedBranchId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Select a Branch</h2>
        <p className="mt-2 text-slate-500 text-sm">Please select a specific branch from the sidebar to manage business hours.</p>
      </div>
    );
  }

  const resetHolidayForm = () => {
    setHolidayDraft({ name: "", startDate: "" });
    setEditingHolidayId(null);
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      await saveSettings("ops", "hours");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHolidaySubmit = async () => {
    if (!holidayDraft.name.trim() || !holidayDraft.startDate) return;

    if (editingHolidayId) {
      await updateHoliday(editingHolidayId, {
        name: holidayDraft.name.trim(),
        startDate: holidayDraft.startDate,
      });
    } else {
      await saveHoliday({
        name: holidayDraft.name.trim(),
        startDate: holidayDraft.startDate,
      });
    }

    resetHolidayForm();
  };

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-500">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <FiClock className="text-slate-500" />
              Operations Control
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Business Hours
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Maintain your weekly opening schedule and manage branch blackout dates from one structured operations workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MetricCard
              label="Open days"
              value={String(settings.ops.businessHours.filter((row) => !row.closed).length)}
            />
            <MetricCard
              label="Blackout dates"
              value={String(settings.ops.holidays.length)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
          >
            <FiRotateCcw /> Reset Changes
          </button>
          <button
            onClick={handleSaveSchedule}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-30"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave /> Update Schedule
              </>
            )}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">Weekly Schedule</h2>
            <p className="mt-1 text-sm text-slate-500">
              Set opening and closing hours for each day and mark closed days when needed.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[96px_1fr_1fr_110px] border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <div>Day</div>
                <div>Open</div>
                <div>Close</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-slate-200">
            {settings.ops.businessHours.map((row) => (
                  <div
                    key={row.day}
                    className={`grid grid-cols-[96px_1fr_1fr_110px] items-center gap-4 px-6 py-4 ${
                      row.closed ? "bg-slate-50/70" : "bg-white"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{row.day}</div>
                    <div>
                      <input
                        type="time"
                        value={row.open}
                        disabled={row.closed}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, open: e.target.value } : d) }
                        }))}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={row.close}
                        disabled={row.closed}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, close: e.target.value } : d) }
                        }))}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={row.closed}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, closed: e.target.checked } : d) }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="h-6 w-10 rounded-full bg-slate-200 transition-colors peer-checked:bg-rose-500"></div>
                          <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
                        </div>
                        <span className={`text-xs font-semibold ${row.closed ? "text-rose-500" : "text-emerald-600"}`}>
                          {row.closed ? "Off" : "On"}
                        </span>
                      </label>
                    </div>
                  </div>
            ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FiCalendar />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Blackout Dates</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add and edit named blackout dates when this branch is fully closed.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="text"
              value={holidayDraft.name}
              onChange={(e) => setHolidayDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Blackout name"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={holidayDraft.startDate}
                onChange={(e) => setHolidayDraft((prev) => ({ ...prev, startDate: e.target.value }))}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
              <button
                onClick={handleHolidaySubmit}
                disabled={!holidayDraft.name.trim() || !holidayDraft.startDate}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
              >
                {editingHolidayId ? <FiSave /> : <FiPlus />}
                {editingHolidayId ? "Save" : "Add"}
              </button>
            </div>
            {editingHolidayId && (
              <button
                type="button"
                onClick={resetHolidayForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {settings.ops.holidays.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No dates set</p>
              </div>
            ) : (
              settings.ops.holidays.map(h => (
                <div key={h.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{h.name}</div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        Blackout Date
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {new Date(h.startDate || h.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHolidayId(h.id);
                          setHolidayDraft({
                            name: h.name,
                            startDate: (h.startDate || h.date).slice(0, 10),
                          });
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        aria-label={`Edit ${h.name}`}
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                      <button 
                        onClick={() => deleteHoliday(h.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                        aria-label={`Delete ${h.name}`}
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
