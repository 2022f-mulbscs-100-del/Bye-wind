import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getJson, putJson, postJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useBranchContext } from "@/context/BranchContext";
import {
  FiCreditCard,
  FiGlobe,
  FiMail,
  FiMessageSquare,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

const tabs = [
  { id: "ops", label: "Operations" },
  { id: "integrations", label: "Integrations" },
  { id: "compliance", label: "Branding & Audit" },
] as const;

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  staff?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

type Severity = "Low" | "Medium" | "High";

const severityClassMap: Record<Severity, string> = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-slate-100 text-slate-600",
};

const severityByAction = (action: string): Severity => {
  const normalized = action.toUpperCase();
  if (["DELETE", "STATUS_CHANGE", "EXPORT"].includes(normalized)) return "High";
  if (["UPDATE", "CREATE"].includes(normalized)) return "Medium";
  return "Low";
};

const formatRelativeTime = (value: string) => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "just now";
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const getActorName = (entry: AuditLogEntry) => {
  const { staff } = entry;
  if (!staff) return "System";
  const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return staff.email ?? "System";
};

type TabId = (typeof tabs)[number]["id"];

type SettingsState = {
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  integrations: {
    stripeId?: string;
    stripeKey: string;
    stripeSecret: string;
    stripeWebhook: string;
    smsId?: string;
    smsProvider: string;
    smsKey: string;
    whatsappId?: string;
    whatsappProvider: string;
    whatsappKey: string;
    emailId?: string;
    emailProvider: string;
    emailKey: string;
    posId?: string;
    posProvider: string;
    posKey: string;
  };
  ops: {
    businessHours: Array<{ day: string; open: string; close: string; closed: boolean }>;
    holidays: string[];
  };
  reservationPolicy: {
    minPartySize: number;
    maxPartySize: number;
    advanceBookingDays: number;
    sameDayCutoffMins: number;
    cancellationWindowHours: number;
    autoConfirm: boolean;
  };
  turnTime: {
    defaultDuration: number;
    rules: Array<{ partySize: string; duration: number }>;
  };
  compliance: {
    goLiveChecklist: {
      hoursConfigured: boolean;
      tablesConfigured: boolean;
      paymentsConfigured: boolean;
      policiesConfigured: boolean;
    };
  };
};

const DEFAULT_SETTINGS: SettingsState = {
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    accentColor: "#FF5733",
    fontFamily: "Inter",
  },
  integrations: {
    stripeId: undefined,
    stripeKey: "",
    stripeSecret: "",
    stripeWebhook: "",
    smsId: undefined,
    smsProvider: "",
    smsKey: "",
    whatsappId: undefined,
    whatsappProvider: "",
    whatsappKey: "",
    emailId: undefined,
    emailProvider: "",
    emailKey: "",
    posId: undefined,
    posProvider: "",
    posKey: "",
  },
  ops: {
    businessHours: [
      { day: "Mon", open: "10:00", close: "22:00", closed: false },
      { day: "Tue", open: "10:00", close: "22:00", closed: false },
      { day: "Wed", open: "10:00", close: "22:00", closed: false },
      { day: "Thu", open: "10:00", close: "22:00", closed: false },
      { day: "Fri", open: "10:00", close: "22:00", closed: false },
      { day: "Sat", open: "10:00", close: "22:00", closed: false },
      { day: "Sun", open: "10:00", close: "22:00", closed: false },
    ],
    holidays: [],
  },
  reservationPolicy: {
    minPartySize: 1,
    maxPartySize: 20,
    advanceBookingDays: 30,
    sameDayCutoffMins: 60,
    cancellationWindowHours: 24,
    autoConfirm: true,
  },
  turnTime: {
    defaultDuration: 90,
    rules: [],
  },
  compliance: {
    goLiveChecklist: {
      hoursConfigured: false,
      tablesConfigured: false,
      paymentsConfigured: false,
      policiesConfigured: false,
    },
  },
};

const Settings = () => {
  const { selectedBranchId } = useBranchContext();
  const restaurantId = getStoredRestaurantId();

  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>(selectedBranchId ? "ops" : "integrations");
  const [holidayDraft, setHolidayDraft] = useState("");
  const [baselineSnapshot, setBaselineSnapshot] = useState<string>(
    JSON.stringify(DEFAULT_SETTINGS)
  );

  const snapshot = useMemo(() => JSON.stringify(settings), [settings]);
  const hasChanges = snapshot !== baselineSnapshot;

  // Unified Fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;
      setIsLoading(true);
      try {
        const globalPromises = [
          getJson<any>("/branding"),
          getJson<any>("/payment-gateways"),
          getJson<any>("/communication-channels"),
          getJson<any>("/pos-integrations"),
          getJson<any>(`/go-live/${restaurantId}`),
        ];
        
        const branchPromises = selectedBranchId ? [
          getJson<any>(`/business-hours?branchId=${selectedBranchId}`),
          getJson<any>(`/reservation-policies?branchId=${selectedBranchId}`),
          getJson<any>(`/turn-times?branchId=${selectedBranchId}`),
          getJson<any>(`/business-hours/holidays?branchId=${selectedBranchId}`),
        ] : [];

        const responses = await Promise.all([...globalPromises, ...branchPromises]);
        
        const [brandingRes, paymentRes, commsRes, posRes, goLiveRes] = responses.slice(0, 5);
        const branchRes = responses.slice(5);

        const branding = brandingRes.data || {};
        const payments = paymentRes.data?.[0] || {};
        const comms = commsRes.data || [];
        const pos = posRes.data?.[0] || {};
        const goLive = goLiveRes.data || {};

        const sms = comms.find((c: any) => c.channel === 'SMS') || {};
        const whatsapp = comms.find((c: any) => c.channel === 'WHATSAPP') || {};
        const email = comms.find((c: any) => c.channel === 'EMAIL') || {};

        let newSettings = {
          ...DEFAULT_SETTINGS,
          branding: {
            logoUrl: branding.logoUrl || "",
            faviconUrl: branding.faviconUrl || "",
            primaryColor: branding.primaryColor || "#000000",
            secondaryColor: branding.secondaryColor || "#FFFFFF",
            accentColor: branding.accentColor || "#FF5733",
            fontFamily: branding.fontFamily || "Inter",
          },
          integrations: {
            stripeId: payments.id,
            stripeKey: payments.apiKey || "",
            stripeSecret: payments.secretKey || "",
            stripeWebhook: payments.webhookSecret || "",
            smsId: sms.id,
            smsProvider: sms.provider || "",
            smsKey: sms.apiKey || "",
            whatsappId: whatsapp.id,
            whatsappProvider: whatsapp.provider || "",
            whatsappKey: whatsapp.apiKey || "",
            emailId: email.id,
            emailProvider: email.provider || "",
            emailKey: email.apiKey || "",
            posId: pos.id,
            posProvider: pos.provider || "",
            posKey: pos.apiKey || "",
          },
          compliance: {
            goLiveChecklist: {
              hoursConfigured: goLive.hoursConfigured || false,
              tablesConfigured: goLive.tablesConfigured || false,
              paymentsConfigured: goLive.paymentsConfigured || false,
              policiesConfigured: goLive.policiesConfigured || false,
            }
          }
        };

        if (selectedBranchId && branchRes.length > 0) {
          const [hoursRes, policyRes, turnRes, holidayRes] = branchRes;
          const hours = hoursRes.data || [];
          const policy = policyRes.data || {};
          const turns = turnRes.data || [];
          const defaultTurn = turns.find((t: any) => t.isDefault);

          newSettings = {
            ...newSettings,
            ops: {
              businessHours: hours.length > 0 ? hours.map((h: any) => ({
                day: h.dayOfWeek,
                open: h.openTime,
                close: h.closeTime,
                closed: !h.isOpen,
              })) : DEFAULT_SETTINGS.ops.businessHours,
              holidays: Array.isArray(holidayRes.data) ? holidayRes.data.map((h: any) => h.date) : [],
            },
            reservationPolicy: {
              minPartySize: policy.minPartySize || 1,
              maxPartySize: policy.maxPartySize || 20,
              advanceBookingDays: policy.advanceBookingDays || 30,
              sameDayCutoffMins: policy.sameDayCutoffMins || 60,
              cancellationWindowHours: policy.cancellationWindowHours || 24,
              autoConfirm: policy.autoConfirm ?? true,
            },
            turnTime: {
              defaultDuration: defaultTurn?.durationMins || 90,
              rules: turns.filter((t: any) => !t.isDefault).map((t: any) => ({
                partySize: `${t.partySizeMin}-${t.partySizeMax}`,
                duration: t.durationMins
              })),
            },
          };
        }

        setSettings(newSettings);
        setBaselineSnapshot(JSON.stringify(newSettings));
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, selectedBranchId]);

  // Fetch Logs
  useEffect(() => {
    if (activeTab !== "compliance" || !restaurantId) return;
    
    setLoadingLogs(true);
    getJson<{ data: AuditLogEntry[] }>(`/audit-logs?page=1&limit=5`, {
      headers: { "x-restaurant-id": restaurantId }
    })
      .then(res => setLogs(res.data.data))
      .catch(err => console.error("Error fetching logs:", err))
      .finally(() => setLoadingLogs(false));
  }, [activeTab, restaurantId]);

  const saveSettings = async () => {
    const toastId = toast.loading("Saving settings...");
    try {
      if (activeTab === "ops") {
        if (!selectedBranchId) throw new Error("Please select a branch.");
        
        await Promise.all([
          postJson("/business-hours", {
            branchId: selectedBranchId,
            hours: settings.ops.businessHours.map(h => ({
              dayOfWeek: h.day,
              openTime: h.open,
              closeTime: h.close,
              isOpen: !h.closed
            })),
            holidays: settings.ops.holidays
          }),
          postJson("/reservation-policies", {
            branchId: selectedBranchId,
            ...settings.reservationPolicy
          }),
          postJson("/turn-times", {
            branchId: selectedBranchId,
            defaultDuration: settings.turnTime.defaultDuration,
            rules: settings.turnTime.rules.map(r => {
              const [min, max] = r.partySize.split('-').map(Number);
              return { partySizeMin: min, partySizeMax: max, durationMins: r.duration };
            })
          })
        ]);
      } else if (activeTab === "integrations") {
        if (selectedBranchId) throw new Error("Global settings can only be saved at the root level.");
        
        await Promise.all([
          postJson("/payment-gateways", {
            provider: "STRIPE",
            apiKey: settings.integrations.stripeKey,
            secretKey: settings.integrations.stripeSecret,
            webhookSecret: settings.integrations.stripeWebhook,
            isActive: true
          }),
          postJson("/communication-channels/bulk", {
            channels: [
              { channel: "SMS", provider: "TWILIO", apiKey: settings.integrations.smsKey, isActive: !!settings.integrations.smsKey },
              { channel: "WHATSAPP", provider: "META", apiKey: settings.integrations.whatsappKey, isActive: !!settings.integrations.whatsappKey },
              { channel: "EMAIL", provider: "SENDGRID", apiKey: settings.integrations.emailKey, isActive: !!settings.integrations.emailKey }
            ]
          }),
          settings.integrations.posProvider && postJson("/pos-integrations", {
            provider: settings.integrations.posProvider,
            apiKey: settings.integrations.posKey,
            isActive: true
          })
        ]);
      } else if (activeTab === "compliance") {
        if (selectedBranchId) throw new Error("Global settings can only be saved at the root level.");
        await putJson("/branding", settings.branding);
      }

      setBaselineSnapshot(snapshot);
      toast.success("Settings saved successfully!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings.", { id: toastId });
    }
  };

  const resetSettings = () => {
    setSettings(JSON.parse(baselineSnapshot));
    toast.info("Changes discarded.");
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Settings</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Restaurant Configuration</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs font-medium text-slate-500">
          {hasChanges ? "You have unsaved changes." : "All changes saved."}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSettings}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          if (tab.id === "ops" && !selectedBranchId) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "ops" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Business Hours */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Business Hours</h3>
            <div className="space-y-2">
              {settings.ops.businessHours.map((row) => (
                <div key={row.day} className="grid grid-cols-4 items-center gap-2 rounded-xl bg-slate-50 p-2 px-3 text-xs">
                  <span className="font-medium">{row.day}</span>
                  <input
                    type="time"
                    value={row.open}
                    disabled={row.closed}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, open: e.target.value } : d) }
                    }))}
                    className="rounded border border-slate-200 p-1"
                  />
                  <input
                    type="time"
                    value={row.close}
                    disabled={row.closed}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, close: e.target.value } : d) }
                    }))}
                    className="rounded border border-slate-200 p-1"
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={row.closed}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ops: { ...prev.ops, businessHours: prev.ops.businessHours.map(d => d.day === row.day ? { ...d, closed: e.target.checked } : d) }
                      }))}
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Holidays & Blackout Dates</h4>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={holidayDraft}
                  onChange={(e) => setHolidayDraft(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                />
                <button
                  onClick={() => {
                    if (!holidayDraft) return;
                    setSettings(prev => ({ ...prev, ops: { ...prev.ops, holidays: [...prev.ops.holidays, holidayDraft] } }));
                    setHolidayDraft("");
                  }}
                  className="rounded-lg bg-slate-100 px-3 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.ops.holidays.map(h => (
                  <span key={h} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-600">
                    {h} <button onClick={() => setSettings(prev => ({ ...prev, ops: { ...prev.ops, holidays: prev.ops.holidays.filter(x => x !== h) } }))} className="ml-1 text-slate-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reservation Policy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Reservation Policy</h3>
            <div className="space-y-4 text-sm text-slate-600">
              {[
                { label: "Min Party Size", key: "minPartySize" },
                { label: "Max Party Size", key: "maxPartySize" },
                { label: "Advance Booking (Days)", key: "advanceBookingDays" },
                { label: "Same-Day Cutoff (Mins)", key: "sameDayCutoffMins" },
                { label: "Cancellation Window (Hrs)", key: "cancellationWindowHours" },
              ].map(field => (
                <div key={field.key} className="flex items-center justify-between">
                  <span>{field.label}</span>
                  <input
                    type="number"
                    value={(settings.reservationPolicy as any)[field.key]}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      reservationPolicy: { ...prev.reservationPolicy, [field.key]: Number(e.target.value) }
                    }))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={settings.reservationPolicy.autoConfirm}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    reservationPolicy: { ...prev.reservationPolicy, autoConfirm: e.target.checked }
                  }))}
                />
                Auto-confirm reservations
              </label>
            </div>
          </div>

          {/* Turn Times */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 xl:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">Turn Times</h3>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-600">Default Duration</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.turnTime.defaultDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, turnTime: { ...prev.turnTime, defaultDuration: Number(e.target.value) } }))}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center"
                />
                <span className="text-xs text-slate-500">minutes</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Custom Rules by Party Size</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {settings.turnTime.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 px-3 text-xs">
                    <span>Parties of <strong>{rule.partySize}</strong></span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{rule.duration}m</span>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, turnTime: { ...prev.turnTime, rules: prev.turnTime.rules.filter((_, i) => i !== idx) } }))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-100 p-2">
                <input type="text" placeholder="Size (e.g. 6-8)" id="newRuleSize" className="flex-1 rounded border-none bg-transparent px-2 py-1 text-xs focus:ring-0" />
                <input type="number" placeholder="Mins" id="newRuleMins" className="w-16 rounded border-none bg-transparent px-2 py-1 text-xs focus:ring-0" />
                <button
                  onClick={() => {
                    const s = (document.getElementById('newRuleSize') as HTMLInputElement).value;
                    const m = (document.getElementById('newRuleMins') as HTMLInputElement).value;
                    if (!s || !m) return;
                    setSettings(prev => ({ ...prev, turnTime: { ...prev.turnTime, rules: [...prev.turnTime.rules, { partySize: s, duration: Number(m) }] } }));
                    (document.getElementById('newRuleSize') as HTMLInputElement).value = "";
                    (document.getElementById('newRuleMins') as HTMLInputElement).value = "";
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Payment Gateway */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><FiCreditCard className="text-blue-500" /> Stripe Integration</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Publishable Key</label>
                <input
                  type="text"
                  value={settings.integrations.stripeKey}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, stripeKey: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 disabled:opacity-50"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Secret Key</label>
                <input
                  type="password"
                  value={settings.integrations.stripeSecret}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, stripeSecret: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 disabled:opacity-50"
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Webhook Secret</label>
                <input
                  type="text"
                  value={settings.integrations.stripeWebhook}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, stripeWebhook: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 disabled:opacity-50"
                  placeholder="whsec_..."
                />
              </div>
            </div>
            {selectedBranchId && <div className="text-[10px] italic text-slate-400">Global setting - read-only while in branch context</div>}
          </div>

          {/* POS Integration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><FiZap className="text-amber-500" /> POS Integration</div>
            <div className="space-y-3">
              <select
                value={settings.integrations.posProvider}
                disabled={!!selectedBranchId}
                onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, posProvider: e.target.value } }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
              >
                <option value="">Select Provider</option>
                <option value="SQUARE">Square</option>
                <option value="CLOVER">Clover</option>
                <option value="TOAST">Toast</option>
              </select>
              <input
                type="text"
                value={settings.integrations.posKey}
                disabled={!!selectedBranchId}
                onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, posKey: e.target.value } }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 disabled:opacity-50"
                placeholder="POS API Key"
              />
            </div>
          </div>

          {/* Communications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6 xl:col-span-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><FiMessageSquare className="text-purple-500" /> Communication Channels</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><FiSmartphone /> SMS (Twilio)</div>
                <input
                  type="text"
                  value={settings.integrations.smsKey}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, smsKey: e.target.value } }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  placeholder="Twilio API Key"
                />
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><FiGlobe /> WhatsApp (Meta)</div>
                <input
                  type="text"
                  value={settings.integrations.whatsappKey}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, whatsappKey: e.target.value } }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  placeholder="Meta Access Token"
                />
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><FiMail /> Email (SendGrid)</div>
                <input
                  type="text"
                  value={settings.integrations.emailKey}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, emailKey: e.target.value } }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  placeholder="SendGrid API Key"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Branding */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight">Theme & Branding</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Logo URL</label>
                <input
                  type="text"
                  value={settings.branding.logoUrl}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, logoUrl: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['primaryColor', 'secondaryColor', 'accentColor'].map(color => (
                  <div key={color}>
                    <label className="text-[10px] font-medium text-slate-400 uppercase">{color.replace('Color', '')}</label>
                    <input
                      type="color"
                      value={(settings.branding as any)[color]}
                      disabled={!!selectedBranchId}
                      onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, [color]: e.target.value } }))}
                      className="mt-1 h-10 w-full cursor-pointer rounded-lg border-none bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Go-Live Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight">Go-Live Readiness</h3>
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              {Object.entries(settings.compliance.goLiveChecklist).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 xl:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight">Recent Activity Stream</h3>
            <div className="space-y-2">
              {loadingLogs ? (
                <div className="flex justify-center py-4 text-xs text-slate-400 italic">Updating stream...</div>
              ) : logs.length > 0 ? (
                logs.map(log => {
                  const severity = severityByAction(log.action);
                  return (
                    <div key={log.id} className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 text-xs transition-hover hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${severity === 'High' ? 'bg-rose-500' : severity === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <div>
                          <div className="font-bold text-slate-900">{log.action} <span className="font-normal text-slate-400">on</span> {log.entity}</div>
                          <div className="text-[10px] text-slate-500">{getActorName(log)} · {formatRelativeTime(log.createdAt)}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severityClassMap[severity]}`}>
                        {severity}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Settings;
