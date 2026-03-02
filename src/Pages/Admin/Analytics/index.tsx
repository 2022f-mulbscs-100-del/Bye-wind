import {
  FiArrowUpRight,
  FiBarChart2,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const traffic = [
  { week: "W1", value: 120 },
  { week: "W2", value: 180 },
  { week: "W3", value: 160 },
  { week: "W4", value: 210 },
  { week: "W5", value: 260 },
  { week: "W6", value: 240 },
];

const channelData = [
  { label: "Direct", value: "42%" },
  { label: "Google", value: "28%" },
  { label: "Instagram", value: "18%" },
  { label: "Partners", value: "12%" },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Analytics
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Analytics</div>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          Last 6 weeks
          <FiArrowUpRight className="text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Total visits",
            value: "18,420",
            change: "+12.4%",
            icon: FiTrendingUp,
          },
          {
            label: "New guests",
            value: "4,250",
            change: "+8.1%",
            icon: FiUsers,
          },
          {
            label: "Churn",
            value: "2.8%",
            change: "-0.6%",
            icon: FiTrendingDown,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase text-slate-400">{metric.label}</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <metric.icon />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {metric.value}
            </div>
            <div className="mt-2 text-xs text-emerald-600">{metric.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Traffic trend</div>
              <p className="mt-1 text-sm text-slate-500">
                Weekly visits across all channels.
              </p>
            </div>
            <FiBarChart2 className="text-slate-400" />
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    background: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Channel mix</div>
            <div className="mt-4 space-y-3">
              {channelData.map((channel) => (
                <div key={channel.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{channel.label}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {channel.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Insights</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Peak bookings happen between 6-8 PM.</li>
              <li>Weekend traffic increased by 18%.</li>
              <li>VIP guest retention improved by 7%.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
