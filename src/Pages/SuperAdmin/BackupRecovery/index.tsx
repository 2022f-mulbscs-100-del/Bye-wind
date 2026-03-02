const BackupRecovery = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Backup & Disaster Recovery
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Backups & restore points</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Backup schedule</div>
          <div className="mt-3 text-sm text-slate-500">Daily snapshots · 30-day retention</div>
          <button className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Configure backups
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">RTO / RPO</div>
          <div className="mt-3 text-sm text-slate-500">RTO 2h · RPO 15m</div>
          <button className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Review targets
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupRecovery;
