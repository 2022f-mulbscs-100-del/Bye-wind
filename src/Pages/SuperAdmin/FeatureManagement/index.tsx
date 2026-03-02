const features = [
  { name: "AI Waitlist", status: "Enabled", rollout: "100%" },
  { name: "VIP Insights", status: "Enabled", rollout: "60%" },
  { name: "Smart Pricing", status: "Disabled", rollout: "0%" },
];

const FeatureManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Feature & Configuration Management
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Feature flags</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Feature toggles</div>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">{feature.name}</div>
                <div className="text-xs text-slate-500">Rollout: {feature.rollout}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                feature.status === "Enabled" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
              }`}>
                {feature.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
