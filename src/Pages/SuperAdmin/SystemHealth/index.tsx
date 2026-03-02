const SystemHealth = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          System Health & Monitoring
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Uptime & performance</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Uptime", value: "99.98%" },
          { label: "Latency", value: "220ms" },
          { label: "Error rate", value: "0.12%" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-400">{item.label}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Alerts</div>
        <div className="mt-3 text-sm text-slate-500">No critical alerts in the last 24h.</div>
        <button className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          View alert history
        </button>
      </div>
    </div>
  );
};

export default SystemHealth;
