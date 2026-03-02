const ReleaseManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Environment & Release Management
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Deployments & rollbacks</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Release pipeline</div>
        <div className="mt-3 text-sm text-slate-500">Production · v4.2.8 · Stable</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Deploy hotfix
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Rollback
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseManagement;
