import { useEffect, useState } from "react";

type FeatureFlag = {
  name: string;
  enabled: boolean;
  rollout: string;
};

type FeatureResponse = {
  features: FeatureFlag[];
};

const STORAGE_KEY = "super_admin_feature_flags_v1";

const FeatureManagement = () => {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/DummyApis/feature-management.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: FeatureResponse | null) => {
        if (!mounted || !json) return;

        try {
          const overrideRaw = localStorage.getItem(STORAGE_KEY);
          const overrides = overrideRaw ? (JSON.parse(overrideRaw) as Record<string, boolean>) : {};
          const merged = json.features.map((feature) => ({
            ...feature,
            enabled:
              Object.prototype.hasOwnProperty.call(overrides, feature.name)
                ? Boolean(overrides[feature.name])
                : feature.enabled,
          }));
          setFeatures(merged);
        } catch {
          setFeatures(json.features);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleFeature = (name: string) => {
    setFeatures((prev) => {
      const next = prev.map((feature) =>
        feature.name === name ? { ...feature, enabled: !feature.enabled } : feature
      );

      const overrides = next.reduce<Record<string, boolean>>((acc, feature) => {
        acc[feature.name] = feature.enabled;
        return acc;
      }, {});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      return next;
    });
  };

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
          {loading ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading feature flags...</div>
          ) : (
            features.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{feature.name}</div>
                  <div className="text-xs text-slate-500">Rollout: {feature.rollout}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeature(feature.name)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    feature.enabled
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {feature.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
