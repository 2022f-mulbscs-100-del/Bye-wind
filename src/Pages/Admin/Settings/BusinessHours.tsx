import { useState } from "react";
import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import { FiSave, FiRotateCcw } from "react-icons/fi";

export default function BusinessHours() {
   const { 
    settings, setSettings, isLoading, hasChanges, 
    saveSettings, resetSettings, selectedBranchId,
    saveHoliday, deleteHoliday 
  } = useSettingsData();
  const [holidayDraft, setHolidayDraft] = useState("");

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size={40} /></div>;

  if (!selectedBranchId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Select a Branch</h2>
        <p className="mt-2 text-slate-500 text-sm">Please select a specific branch from the sidebar to manage business hours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Operations Control</div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Hours</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <FiRotateCcw /> Reset Changes
          </button>
          <button
            onClick={() => saveSettings("ops")}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-30 shadow-xl shadow-slate-200 transition-all"
          >
            <FiSave /> Update Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Schedule</h3>
          <div className="space-y-3">
            {settings.ops.businessHours.map((row) => (
              <div key={row.day} className={`grid grid-cols-[80px_1fr_1fr_80px] items-center gap-4 rounded-2xl p-4 text-sm border transition-all ${
                row.closed ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <span className="font-black text-slate-900">{row.day}</span>
                <input
                  type="time"
                  value={row.open}
                  disabled={row.closed}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, open: e.target.value } : d) }
                  }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white disabled:opacity-50"
                />
                <input
                  type="time"
                  value={row.close}
                  disabled={row.closed}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, close: e.target.value } : d) }
                  }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white disabled:opacity-50"
                />
                <label className="flex items-center gap-2 cursor-pointer group">
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
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-slate-600">Off</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Blackout Dates</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Add specific dates when this branch will be closed entirely.</p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="date"
              value={holidayDraft}
              onChange={(e) => setHolidayDraft(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
            />
            <button
              onClick={() => {
                if (!holidayDraft) return;
                saveHoliday(holidayDraft);
                setHolidayDraft("");
              }}
              className="rounded-xl bg-indigo-600 px-6 text-xs font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {settings.ops.holidays.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No dates set</p>
              </div>
            ) : (
              settings.ops.holidays.map(h => (
                <div key={h.id} className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-4 shadow-sm group hover:border-indigo-200 transition-all">
                  <span className="text-sm font-bold text-slate-700">
                    {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => deleteHoliday(h.id)} 
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
