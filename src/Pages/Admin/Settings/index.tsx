import { useState } from "react";
import {
  FiCalendar,
  FiCloud,
  FiCreditCard,
  FiDatabase,
  FiGlobe,
  FiLink,
  FiMail,
  FiShield,
  FiSliders,
  FiTag,
} from "react-icons/fi";

const tabs = [
  { id: "ops", label: "Operations" },
  { id: "integrations", label: "Integrations" },
  { id: "compliance", label: "Compliance" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabId>("ops");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Settings
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">
          Onboarding & Configuration
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ops" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-900">Business Hours & Holidays</div>
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-600">
              {[
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun",
              ].map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
                >
                  <span>{day}</span>
                  <span className="text-xs text-slate-500">10:00 AM - 10:00 PM</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Add holiday / blackout date"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-900">
              Reservation Policy Configuration
            </div>
            {[
              "Max party size",
              "Advance booking window (days)",
              "Same‑day cutoff",
              "Cancellation window (hrs)",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
              >
                <span className="text-sm text-slate-600">{label}</span>
                <input
                  className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  placeholder="Set"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-900">
              Turn Time & Dining Duration Rules
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Weekdays: 90 mins · Weekends: 120 mins · Parties 6+: +20 mins
            </div>
            <div className="flex items-center gap-2">
              <FiSliders className="text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Add rule (e.g., Party size > 6)"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-900">Table Configuration Rules</div>
            {[
              "Min party size",
              "Max party size",
              "Combinable tables",
              "VIP designation",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
              >
                <span className="text-sm text-slate-600">{label}</span>
                <input
                  className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  placeholder="Set"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiCreditCard /> Payment Gateway Setup
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Stripe · Square · Multi‑currency
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              Connect gateway
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiMail /> Communication Channels
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              SMS · WhatsApp · Email
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Add API keys
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiLink /> POS Integration Setup
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Sync reservations, walk‑ins, orders
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Configure POS
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiDatabase /> Data Import & Migration
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              CSV / Excel import with validation
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Import data
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiGlobe /> Booking Widget Configuration
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-4 py-2">Language: English</div>
              <div className="rounded-xl bg-slate-50 px-4 py-2">Timezone: America/Los_Angeles</div>
              <div className="rounded-xl bg-slate-50 px-4 py-2">Party size limits: 1‑10</div>
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Edit widget
            </button>
          </div>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTag /> Branding & White‑Label
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Logo, colors, booking widget theme
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Customize
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiShield /> Audit Logs & Change Tracking
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Track all changes with user + timestamp
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              View logs
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiCloud /> Go‑Live Checklist & Validation
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Ensure hours, tables, payments, and policies are complete
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              Review checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
