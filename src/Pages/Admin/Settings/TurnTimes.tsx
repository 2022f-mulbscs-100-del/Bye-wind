import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import { FiSave, FiRotateCcw, FiPlus, FiTrash2, FiClock } from "react-icons/fi";

export default function TurnTimes() {
  const { settings, setSettings, isLoading, hasChanges, saveSettings, resetSettings, selectedBranchId } = useSettingsData();

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size={40} /></div>;

  if (!selectedBranchId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Select a Branch</h2>
        <p className="mt-2 text-slate-500 text-sm">Please select a specific branch from the sidebar to manage turn times.</p>
      </div>
    );
  }

  const handleAddRule = () => {
    const sizeInput = document.getElementById('newRuleSize') as HTMLInputElement;
    const minsInput = document.getElementById('newRuleMins') as HTMLInputElement;
    const size = sizeInput.value;
    const mins = Number(minsInput.value);

    if (!size || !mins) return;

    setSettings(prev => ({
      ...prev,
      turnTime: {
        ...prev.turnTime,
        rules: [...prev.turnTime.rules, { partySize: size, duration: mins }]
      }
    }));

    sizeInput.value = "";
    minsInput.value = "";
  };

  const handleRemoveRule = (idx: number) => {
    setSettings(prev => ({
      ...prev,
      turnTime: {
        ...prev.turnTime,
        rules: prev.turnTime.rules.filter((_, i) => i !== idx)
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Operations</div>
          <h1 className="text-2xl font-bold text-slate-900">Turn Times</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={() => saveSettings("ops")}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200 transition-all"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Default Duration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FiClock size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Default Turn Duration</h3>
              <p className="text-sm text-slate-500">Standard time allocated for a reservation if no custom rules apply.</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <input
                type="number"
                value={settings.turnTime.defaultDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, turnTime: { ...prev.turnTime, defaultDuration: Number(e.target.value) } }))}
                className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-sm font-semibold text-slate-500 pr-2">minutes</span>
            </div>
          </div>
        </div>

        {/* Custom Rules */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Custom Rules by Party Size</h3>
            <p className="text-sm text-slate-500 mt-1">Override the default duration for specific group sizes (e.g., Parties of 6+ might need 120 minutes).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.turnTime.rules.map((rule, idx) => (
              <div key={idx} className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-md animate-in zoom-in-50">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Party Size</div>
                  <div className="text-sm font-bold text-slate-900">{rule.partySize} Guests</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Duration</div>
                  <div className="text-sm font-bold text-indigo-600">{rule.duration}m</div>
                </div>
                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="absolute -top-2 -right-2 hidden h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg group-hover:flex hover:scale-110 transition-transform"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Size (e.g. 6-8)</label>
                  <input
                    id="newRuleSize"
                    type="text"
                    placeholder="Size"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Mins</label>
                  <input
                    id="newRuleMins"
                    type="number"
                    placeholder="Mins"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleAddRule}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              >
                <FiPlus /> Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
