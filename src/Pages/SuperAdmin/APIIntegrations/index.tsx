const APIIntegrations = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          API & Integration Management
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Keys, scopes, rate limits</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["Public API", "Partner API", "Webhooks", "POS Integrations"].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">{item}</div>
            <div className="mt-2 text-xs text-slate-500">Usage: 62% of limit</div>
            <button className="mt-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIIntegrations;
