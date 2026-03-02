const logs = [
  { action: "Updated booking policy", actor: "Ava Collins", time: "2m ago", severity: "Low" },
  { action: "Suspended tenant", actor: "Liam Patel", time: "1h ago", severity: "High" },
  { action: "API key rotated", actor: "Maya Brooks", time: "3h ago", severity: "Medium" },
];

const AuditLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Audit Logs & Activity Tracking
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Compliance logs</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Recent activity</div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {logs.map((log) => (
            <div key={log.action} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{log.action}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  log.severity === "High" ? "bg-rose-50 text-rose-600" : log.severity === "Medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"
                }`}>
                  {log.severity}
                </span>
              </div>
              <div className="text-xs text-slate-500">{log.actor} · {log.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
