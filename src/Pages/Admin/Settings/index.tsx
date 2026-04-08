import { useState, useEffect } from "react";
import { useSettingsData } from "@/hooks/useSettingsData";
import Loader from "@/Components/loader";
import {
  FiZap, FiMessageSquare, FiSmartphone,
  FiGlobe, FiMail, FiSave, FiShield
} from "react-icons/fi";
import { getJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useBranchContext } from "@/context/BranchContext";

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

export default function RestaurantSettings() {
  const { setSelectedBranchId } = useBranchContext();
  const { settings, setSettings, isLoading, hasChanges, saveSettings, resetSettings, selectedBranchId } = useSettingsData();
  const [activeTab, setActiveTab] = useState<"integrations" | "branding" | "audit">("integrations");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const restaurantId = getStoredRestaurantId();

  useEffect(() => {
    // Auto-switch to Master Level (All Branches) when entering settings
    setSelectedBranchId(null);
  }, [setSelectedBranchId]);

  useEffect(() => {
    if (activeTab !== "audit" || !restaurantId) return;
    setLoadingLogs(true);
    getJson<AuditLogEntry[]>(`/audit-logs?page=1&limit=10`, {
      headers: { "x-restaurant-id": restaurantId }
    })
      .then(res => setLogs(res.data))
      .catch(err => console.error("Error fetching logs:", err))
      .finally(() => setLoadingLogs(false));
  }, [activeTab, restaurantId]);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size={40} /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Master Config</div>
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Settings</h1>
        </div>
      </div>

      {selectedBranchId && (activeTab === "integrations" || activeTab === "branding") && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <FiShield className="shrink-0" />
          <p>These settings are <strong>global</strong>. Modifications can only be made from the <strong>All Branches</strong> view.</p>
        </div>
      )}

      <div className="flex gap-2">
        {(["integrations", "branding", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all uppercase tracking-wider ${activeTab === tab
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-500">
        {activeTab === "integrations" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Comms */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
                  <div className="h-10 w-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <FiMessageSquare size={20} />
                  </div>
                  Communication Channels
                </div>
                {!selectedBranchId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetSettings}
                      disabled={!hasChanges}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => saveSettings("integrations")}
                      disabled={!hasChanges}
                      className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-30 shadow-lg shadow-slate-100 transition-all flex items-center gap-2"
                    >
                      <FiSave size={14} /> Update Channels
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500">Configure your API keys for automated guest communications via SMS, WhatsApp, and Email.</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: "smsKey", senderKey: "smsSender", label: "SMS (Twilio)", Icon: FiSmartphone, placeholder: "API Key", senderPlaceholder: "Sender Phone (e.g. +1234567890)" },
                  { key: "whatsappKey", senderKey: "whatsappSender", label: "WhatsApp (Meta)", Icon: FiGlobe, placeholder: "Access Token", senderPlaceholder: "Phone Number ID" },
                  { key: "emailKey", senderKey: "emailSender", label: "Email (SendGrid)", Icon: FiMail, placeholder: "API Key", senderPlaceholder: "Sender Email (e.g. hello@rest.com)" },
                ].map(({ key, senderKey, label, Icon, placeholder, senderPlaceholder }) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Icon size={12} /> {label} Key
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-200 transition-all">
                        <input
                          type="password"
                          value={(settings.integrations as any)[key]}
                          disabled={!!selectedBranchId}
                          onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, [key]: e.target.value } }))}
                          className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-300 disabled:opacity-50"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Sender ID
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-200 transition-all">
                        <input
                          type="text"
                          value={(settings.integrations as any)[senderKey]}
                          disabled={!!selectedBranchId}
                          onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, [senderKey]: e.target.value } }))}
                          className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-300 disabled:opacity-50"
                          placeholder={senderPlaceholder}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6 text-sm text-blue-800 flex items-start gap-3">
              <FiZap className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Looking for Payments or POS?</p>
                <p className="mt-1 opacity-80">Payment gateways and POS integrations have moved to their own dedicated pages in the sidebar for better management.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-inter">Theme & Branding</h3>
              {!selectedBranchId && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetSettings}
                    disabled={!hasChanges}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => saveSettings("compliance")}
                    disabled={!hasChanges}
                    className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-30 shadow-lg shadow-slate-100 transition-all flex items-center gap-2"
                  >
                    <FiSave size={14} /> Update Theme
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Logo URL</label>
                <input
                  type="text"
                  value={settings.branding.logoUrl}
                  disabled={!!selectedBranchId}
                  onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, logoUrl: e.target.value } }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white disabled:opacity-50 font-medium"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { key: "primaryColor", label: "Primary" },
                  { key: "secondaryColor", label: "Secondary" },
                  { key: "accentColor", label: "Accent" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">{label}</label>
                    <div className="relative h-16 w-full rounded-2xl border border-slate-200 overflow-hidden shadow-inner group transition-transform hover:scale-105">
                      <input
                        type="color"
                        value={(settings.branding as any)[key]}
                        disabled={!!selectedBranchId}
                        onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, [key]: e.target.value } }))}
                        className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="mt-2 text-center text-[10px] font-mono font-bold text-slate-400">
                      {(settings.branding as any)[key].toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Activity Audit Stream</h3>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 Actions</div>
            </div>

            {loadingLogs ? (
              <div className="flex justify-center py-12"><Loader size={30} /></div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No activity recorded for this restaurant.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {log.action} <span className="font-normal text-slate-400">on</span> {log.entity}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-tight">
                          {log.staff ? `${log.staff.firstName} ${log.staff.lastName}` : "System"} · {formatRelativeTime(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
