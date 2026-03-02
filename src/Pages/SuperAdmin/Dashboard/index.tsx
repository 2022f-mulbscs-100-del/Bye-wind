import {
  FiAlertTriangle,
  FiBarChart2,
  FiDatabase,
  FiServer,
  FiUsers,
} from "react-icons/fi";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Super Admin
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">
          Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active tenants", value: "128", icon: FiUsers },
          { label: "Bookings today", value: "8,430", icon: FiBarChart2 },
          { label: "Revenue", value: "$284k", icon: FiDatabase },
          { label: "Alerts", value: "6", icon: FiAlertTriangle },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase text-slate-400">{item.label}</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <item.icon />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">System health</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>API uptime</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                99.98%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Queue latency</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                220ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database load</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                Moderate
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FiServer />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Release status</div>
              <p className="text-xs text-slate-500">v4.2.8 · 2 hours ago</p>
            </div>
          </div>
          <button className="mt-4 w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            View release notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
