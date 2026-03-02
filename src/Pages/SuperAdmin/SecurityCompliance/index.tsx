const SecurityCompliance = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Security & Compliance
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Policies & controls</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "MFA enforcement", status: "Enabled" },
          { title: "IP allowlist", status: "Review" },
          { title: "Encryption", status: "Enabled" },
          { title: "GDPR", status: "Compliant" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
            <div className="mt-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.status === "Enabled" || item.status === "Compliant" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityCompliance;
