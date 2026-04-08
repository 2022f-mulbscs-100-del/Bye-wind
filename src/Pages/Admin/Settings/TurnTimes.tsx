import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import {
  FiClock,
  FiEdit3,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

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
    const size = sizeInput.value.trim();
    const mins = Number(minsInput.value);

    // Validate inputs
    if (!size || !mins) {
      return; // Silently ignore incomplete inputs
    }

    // Validate party size format (should be "min-max")
    const parts = size.split('-').map(s => Number(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      alert(`Invalid party size format: "${size}"\n\nExpected format: "min-max" (e.g., "6-8")`);
      return;
    }

    const [min, max] = parts;
    if (min <= 0 || max <= 0 || min > max) {
      alert(`Invalid party size range:\nmin=${min}, max=${max}\n\nBoth must be positive and min must be ≤ max`);
      return;
    }

    if (mins <= 0 || mins > 1440) {
      alert(`Invalid duration: ${mins} minutes\n\nMust be between 1 and 1440 minutes (1 day)`);
      return;
    }

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
    <div className="max-w-6xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <FiClock className="text-slate-500" />
              Operations
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Turn Times
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Manage standard reservation duration and create party-size-based overrides for longer or shorter dining windows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SummaryCard
              label="Default duration"
              value={`${settings.turnTime.defaultDuration} mins`}
            />
            <SummaryCard
              label="Custom rules"
              value={String(settings.turnTime.rules.length)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={resetSettings}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={() => saveSettings("ops", "turnTimes")}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FiClock size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Default Turn Duration</h2>
              <p className="text-sm text-slate-500">Standard time allocated for a reservation when no custom rule applies.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <input
                type="number"
                value={settings.turnTime.defaultDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, turnTime: { ...prev.turnTime, defaultDuration: Number(e.target.value) } }))}
                className="h-11 w-24 rounded-lg border border-slate-200 bg-white px-3 text-center font-semibold text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
              <span className="pr-2 text-sm font-semibold text-slate-500">minutes</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Default Policy
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              All parties use a standard dining time of{" "}
              <span className="font-semibold text-slate-900">{settings.turnTime.defaultDuration} minutes</span>
              {" "}unless a custom size-based override is configured.
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FiEdit3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Custom Rules by Party Size</h2>
              <p className="mt-1 text-sm text-slate-500">
                Override the default duration for specific group sizes, such as larger parties that need longer seating windows.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-[1.2fr_1fr_auto] gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Party Size Range
                </label>
                <input
                  id="newRuleSize"
                  type="text"
                  placeholder="e.g. 6-8"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Duration
                </label>
                <input
                  id="newRuleMins"
                  type="number"
                  placeholder="Minutes"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddRule}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FiPlus /> Add Rule
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.4fr_1fr_88px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <div>Party Size</div>
              <div>Duration</div>
              <div className="text-right">Actions</div>
            </div>

            {settings.turnTime.rules.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-slate-500">
                No custom rules yet. Add a party-size range to create an override.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 bg-white">
                {settings.turnTime.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1.4fr_1fr_88px] items-center gap-4 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <FiUsers size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{rule.partySize}</div>
                        <div className="text-xs text-slate-500">Guests</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{rule.duration} minutes</div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveRule(idx)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        aria-label={`Remove ${rule.partySize} rule`}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
