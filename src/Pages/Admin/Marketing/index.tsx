import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiCloud,
  FiDollarSign,
  FiGlobe,
  FiRefreshCw,
  FiRepeat,
  FiSearch,
  FiSettings,
  FiSliders,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const campaigns = [
  { name: "Weekend Seafood", channel: "Meta", spend: "$1,280", roas: "3.4x" },
  { name: "Lunch Specials", channel: "Google", spend: "$840", roas: "2.6x" },
  { name: "VIP Winback", channel: "Meta", spend: "$520", roas: "4.1x" },
];

const Marketing = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Marketing & Campaigns
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            AI Marketing Performance
          </div>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Generate report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {["Spend", "Reservations", "CPA", "ROAS"].map((label, idx) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-400">{label}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">
              {idx === 0 ? "$8.4k" : idx === 1 ? "1,280" : idx === 2 ? "$6.6" : "3.1x"}
            </div>
            <div className="mt-2 text-xs text-emerald-600">+8% vs last week</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Unified ad account integration</div>
              <p className="mt-1 text-sm text-slate-500">
                Meta Ads + Google Ads synced with campaign, ad set, and ad‑level data.
              </p>
            </div>
            <FiCloud className="text-slate-400" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-4 py-2">Meta Ads · Connected</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Google Ads · Connected</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Sync cadence · 15 min</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">UTM Tracking · Enabled</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiTarget /> Attribution model
          </div>
          <div className="mt-3 text-sm text-slate-600">
            AI multi‑touch with fallback to last‑touch.
          </div>
          <button className="mt-4 w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Change model
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Campaign comparison</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Spend</th>
                  <th className="pb-3 font-medium">ROAS</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {campaigns.map((item) => (
                  <tr key={item.name} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3">{item.channel}</td>
                    <td className="py-3">{item.spend}</td>
                    <td className="py-3">{item.roas}</td>
                    <td className="py-3">
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiBarChart2 /> AI insights
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-4 py-2">ROAS dropped on Google Lunch Specials</div>
              <div className="rounded-xl bg-slate-50 px-4 py-2">VIP Winback has highest LTV</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTrendingUp /> Budget optimization
            </div>
            <div className="mt-3 text-sm text-slate-600">Shift $300 from low ROAS to high ROAS campaigns.</div>
            <button className="mt-4 w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              Apply suggestion
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">AI cohort & retention</div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-4 py-2">Meta cohort · 42% repeat visits</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Google cohort · 31% repeat visits</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">AI demand forecast</div>
          <div className="mt-2 text-sm text-slate-600">Expect +18% demand next weekend.</div>
          <button className="mt-4 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Launch campaign
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">AI marketing copilot</div>
          <div className="text-xs text-slate-500">Ask anything</div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <FiSearch /> Which campaign brought the highest‑value guests last month?
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Automated AI reporting</div>
        <div className="mt-2 text-sm text-slate-600">Daily · Weekly · Monthly delivery</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs">Email</button>
          <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs">PDF</button>
          <button className="rounded-full bg-slate-900 px-3 py-2 text-xs text-white">Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
