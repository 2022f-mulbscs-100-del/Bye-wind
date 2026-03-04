import { useMemo, useState } from "react";
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

type SettingsState = {
  ops: {
    businessHours: Array<{ day: string; open: string; close: string; closed: boolean }>;
    holidays: string[];
    reservationPolicy: {
      maxPartySize: number;
      advanceBookingDays: number;
      sameDayCutoff: string;
      cancellationWindowHours: number;
    };
    turnTime: {
      weekdayMinutes: number;
      weekendMinutes: number;
      largePartySize: number;
      extraMinutesForLargeParty: number;
      customRules: string[];
    };
    tableConfig: {
      minPartySize: number;
      maxPartySize: number;
      combinableTables: number;
      vipEnabled: boolean;
    };
  };
  integrations: {
    paymentGateway: {
      provider: string;
      apiKey: string;
      webhookEnabled: boolean;
    };
    communication: {
      smsApiKey: string;
      whatsappApiKey: string;
      emailProvider: string;
    };
    pos: {
      provider: string;
      locationId: string;
      autoSync: boolean;
    };
    dataImport: {
      defaultFormat: string;
      strictValidation: boolean;
    };
    widget: {
      language: string;
      timezone: string;
      minPartySize: number;
      maxPartySize: number;
    };
  };
  compliance: {
    branding: {
      logoUrl: string;
      primaryColor: string;
    };
    audit: {
      retentionDays: number;
      alertEmail: string;
    };
    goLiveChecklist: {
      hoursConfigured: boolean;
      tablesConfigured: boolean;
      paymentsConfigured: boolean;
      policiesConfigured: boolean;
    };
  };
};

const STORAGE_KEY = "admin_settings_v1";

const getStoredSettings = (): SettingsState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SettingsState;
  } catch {
    return null;
  }
};

const DEFAULT_SETTINGS: SettingsState = {
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
    reservationPolicy: {
      maxPartySize: 10,
      advanceBookingDays: 30,
      sameDayCutoff: "18:00",
      cancellationWindowHours: 12,
    },
    turnTime: {
      weekdayMinutes: 90,
      weekendMinutes: 120,
      largePartySize: 6,
      extraMinutesForLargeParty: 20,
      customRules: [],
    },
    tableConfig: {
      minPartySize: 1,
      maxPartySize: 10,
      combinableTables: 4,
      vipEnabled: true,
    },
  },
  integrations: {
    paymentGateway: {
      provider: "Stripe",
      apiKey: "",
      webhookEnabled: false,
    },
    communication: {
      smsApiKey: "",
      whatsappApiKey: "",
      emailProvider: "SendGrid",
    },
    pos: {
      provider: "Square",
      locationId: "",
      autoSync: true,
    },
    dataImport: {
      defaultFormat: "CSV",
      strictValidation: true,
    },
    widget: {
      language: "English",
      timezone: "America/Los_Angeles",
      minPartySize: 1,
      maxPartySize: 10,
    },
  },
  compliance: {
    branding: {
      logoUrl: "",
      primaryColor: "#0f172a",
    },
    audit: {
      retentionDays: 365,
      alertEmail: "",
    },
    goLiveChecklist: {
      hoursConfigured: true,
      tablesConfigured: true,
      paymentsConfigured: false,
      policiesConfigured: true,
    },
  },
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabId>("ops");
  const [settings, setSettings] = useState<SettingsState>(() => getStoredSettings() ?? DEFAULT_SETTINGS);
  const [baselineSnapshot, setBaselineSnapshot] = useState<string>(
    JSON.stringify(getStoredSettings() ?? DEFAULT_SETTINGS)
  );
  const [holidayDraft, setHolidayDraft] = useState("");
  const [ruleDraft, setRuleDraft] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const snapshot = useMemo(() => JSON.stringify(settings), [settings]);
  const hasChanges = snapshot !== baselineSnapshot;

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setBaselineSnapshot(JSON.stringify(settings));
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
    } catch {
      setSaveStatus("error");
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setBaselineSnapshot(JSON.stringify(DEFAULT_SETTINGS));
    setHolidayDraft("");
    setRuleDraft("");
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus("idle");
  };

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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs font-medium text-slate-500">
          {saveStatus === "saved" && "Settings saved successfully."}
          {saveStatus === "error" && "Failed to save settings."}
          {saveStatus === "idle" && (hasChanges ? "You have unsaved changes." : "All changes saved.")}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            disabled={!hasChanges}
          >
            Save settings
          </button>
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
              {settings.ops.businessHours.map((row) => (
                <div
                  key={row.day}
                  className="grid grid-cols-[48px_1fr_1fr_auto] items-center gap-2 rounded-xl bg-slate-50 px-4 py-2"
                >
                  <span>{row.day}</span>
                  <input
                    type="time"
                    value={row.open}
                    disabled={row.closed}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          businessHours: prev.ops.businessHours.map((item) =>
                            item.day === row.day ? { ...item, open: event.target.value } : item
                          ),
                        },
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                  <input
                    type="time"
                    value={row.close}
                    disabled={row.closed}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          businessHours: prev.ops.businessHours.map((item) =>
                            item.day === row.day ? { ...item, close: event.target.value } : item
                          ),
                        },
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={row.closed}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          ops: {
                            ...prev.ops,
                            businessHours: prev.ops.businessHours.map((item) =>
                              item.day === row.day ? { ...item, closed: event.target.checked } : item
                            ),
                          },
                        }))
                      }
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <input
                type="date"
                value={holidayDraft}
                onChange={(event) => setHolidayDraft(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Add holiday / blackout date"
              />
              <button
                type="button"
                onClick={() => {
                  if (!holidayDraft) return;
                  setSettings((prev) => ({
                    ...prev,
                    ops: {
                      ...prev.ops,
                      holidays: Array.from(new Set([...prev.ops.holidays, holidayDraft])),
                    },
                  }));
                  setHolidayDraft("");
                }}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
            {settings.ops.holidays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.ops.holidays.map((holiday) => (
                  <button
                    key={holiday}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          holidays: prev.ops.holidays.filter((item) => item !== holiday),
                        },
                      }))
                    }
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                    title="Remove holiday"
                  >
                    {holiday} x
                  </button>
                ))}
              </div>
            ) : null}
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
                {label === "Max party size" ? (
                  <input
                    type="number"
                    value={settings.ops.reservationPolicy.maxPartySize}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          reservationPolicy: {
                            ...prev.ops.reservationPolicy,
                            maxPartySize: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "Advance booking window (days)" ? (
                  <input
                    type="number"
                    value={settings.ops.reservationPolicy.advanceBookingDays}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          reservationPolicy: {
                            ...prev.ops.reservationPolicy,
                            advanceBookingDays: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "Same‑day cutoff" ? (
                  <input
                    type="time"
                    value={settings.ops.reservationPolicy.sameDayCutoff}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          reservationPolicy: {
                            ...prev.ops.reservationPolicy,
                            sameDayCutoff: event.target.value,
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "Cancellation window (hrs)" ? (
                  <input
                    type="number"
                    value={settings.ops.reservationPolicy.cancellationWindowHours}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          reservationPolicy: {
                            ...prev.ops.reservationPolicy,
                            cancellationWindowHours: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-900">
              Turn Time & Dining Duration Rules
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Weekdays: {settings.ops.turnTime.weekdayMinutes} mins · Weekends:{" "}
              {settings.ops.turnTime.weekendMinutes} mins · Parties{" "}
              {settings.ops.turnTime.largePartySize}+: +
              {settings.ops.turnTime.extraMinutesForLargeParty} mins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={settings.ops.turnTime.weekdayMinutes}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ops: {
                      ...prev.ops,
                      turnTime: {
                        ...prev.ops.turnTime,
                        weekdayMinutes: Number(event.target.value),
                      },
                    },
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Weekday mins"
              />
              <input
                type="number"
                value={settings.ops.turnTime.weekendMinutes}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ops: {
                      ...prev.ops,
                      turnTime: {
                        ...prev.ops.turnTime,
                        weekendMinutes: Number(event.target.value),
                      },
                    },
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Weekend mins"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiSliders className="text-slate-400" />
              <input
                value={ruleDraft}
                onChange={(event) => setRuleDraft(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                placeholder="Add rule (e.g., Party size > 6)"
              />
              <button
                type="button"
                onClick={() => {
                  const value = ruleDraft.trim();
                  if (!value) return;
                  setSettings((prev) => ({
                    ...prev,
                    ops: {
                      ...prev.ops,
                      turnTime: {
                        ...prev.ops.turnTime,
                        customRules: [...prev.ops.turnTime.customRules, value],
                      },
                    },
                  }));
                  setRuleDraft("");
                }}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
            {settings.ops.turnTime.customRules.length ? (
              <div className="flex flex-wrap gap-2">
                {settings.ops.turnTime.customRules.map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          turnTime: {
                            ...prev.ops.turnTime,
                            customRules: prev.ops.turnTime.customRules.filter((item) => item !== rule),
                          },
                        },
                      }))
                    }
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                    title="Remove rule"
                  >
                    {rule} x
                  </button>
                ))}
              </div>
            ) : null}
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
                {label === "Min party size" ? (
                  <input
                    type="number"
                    value={settings.ops.tableConfig.minPartySize}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          tableConfig: {
                            ...prev.ops.tableConfig,
                            minPartySize: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "Max party size" ? (
                  <input
                    type="number"
                    value={settings.ops.tableConfig.maxPartySize}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          tableConfig: {
                            ...prev.ops.tableConfig,
                            maxPartySize: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "Combinable tables" ? (
                  <input
                    type="number"
                    value={settings.ops.tableConfig.combinableTables}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        ops: {
                          ...prev.ops,
                          tableConfig: {
                            ...prev.ops.tableConfig,
                            combinableTables: Number(event.target.value),
                          },
                        },
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  />
                ) : null}
                {label === "VIP designation" ? (
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={settings.ops.tableConfig.vipEnabled}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          ops: {
                            ...prev.ops,
                            tableConfig: {
                              ...prev.ops.tableConfig,
                              vipEnabled: event.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Enabled
                  </label>
                ) : null}
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
            <input
              value={settings.integrations.paymentGateway.provider}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    paymentGateway: {
                      ...prev.integrations.paymentGateway,
                      provider: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Provider name"
            />
            <input
              value={settings.integrations.paymentGateway.apiKey}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    paymentGateway: {
                      ...prev.integrations.paymentGateway,
                      apiKey: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="API key"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiMail /> Communication Channels
            </div>
            <input
              value={settings.integrations.communication.smsApiKey}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    communication: {
                      ...prev.integrations.communication,
                      smsApiKey: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="SMS API key"
            />
            <input
              value={settings.integrations.communication.whatsappApiKey}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    communication: {
                      ...prev.integrations.communication,
                      whatsappApiKey: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="WhatsApp API key"
            />
            <input
              value={settings.integrations.communication.emailProvider}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    communication: {
                      ...prev.integrations.communication,
                      emailProvider: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Email provider"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiLink /> POS Integration Setup
            </div>
            <input
              value={settings.integrations.pos.provider}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    pos: { ...prev.integrations.pos, provider: event.target.value },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="POS provider"
            />
            <input
              value={settings.integrations.pos.locationId}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    pos: { ...prev.integrations.pos, locationId: event.target.value },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Location ID"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiDatabase /> Data Import & Migration
            </div>
            <select
              value={settings.integrations.dataImport.defaultFormat}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    dataImport: {
                      ...prev.integrations.dataImport,
                      defaultFormat: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
            >
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
              <option value="JSON">JSON</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={settings.integrations.dataImport.strictValidation}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      dataImport: {
                        ...prev.integrations.dataImport,
                        strictValidation: event.target.checked,
                      },
                    },
                  }))
                }
              />
              Strict validation
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiGlobe /> Booking Widget Configuration
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
              <input
                value={settings.integrations.widget.language}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      widget: { ...prev.integrations.widget, language: event.target.value },
                    },
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                placeholder="Language"
              />
              <input
                value={settings.integrations.widget.timezone}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      widget: { ...prev.integrations.widget, timezone: event.target.value },
                    },
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                placeholder="Timezone"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={settings.integrations.widget.minPartySize}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        widget: {
                          ...prev.integrations.widget,
                          minPartySize: Number(event.target.value),
                        },
                      },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                  placeholder="Min party"
                />
                <input
                  type="number"
                  value={settings.integrations.widget.maxPartySize}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        widget: {
                          ...prev.integrations.widget,
                          maxPartySize: Number(event.target.value),
                        },
                      },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                  placeholder="Max party"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTag /> Branding & White‑Label
            </div>
            <input
              value={settings.compliance.branding.logoUrl}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  compliance: {
                    ...prev.compliance,
                    branding: {
                      ...prev.compliance.branding,
                      logoUrl: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Logo URL"
            />
            <input
              value={settings.compliance.branding.primaryColor}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  compliance: {
                    ...prev.compliance,
                    branding: {
                      ...prev.compliance.branding,
                      primaryColor: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Primary color"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiShield /> Audit Logs & Change Tracking
            </div>
            <input
              type="number"
              value={settings.compliance.audit.retentionDays}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  compliance: {
                    ...prev.compliance,
                    audit: {
                      ...prev.compliance.audit,
                      retentionDays: Number(event.target.value),
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Retention days"
            />
            <input
              value={settings.compliance.audit.alertEmail}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  compliance: {
                    ...prev.compliance,
                    audit: {
                      ...prev.compliance.audit,
                      alertEmail: event.target.value,
                    },
                  },
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              placeholder="Alert email"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiCloud /> Go‑Live Checklist & Validation
            </div>
            <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.compliance.goLiveChecklist.hoursConfigured}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        goLiveChecklist: {
                          ...prev.compliance.goLiveChecklist,
                          hoursConfigured: event.target.checked,
                        },
                      },
                    }))
                  }
                />
                Business hours configured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.compliance.goLiveChecklist.tablesConfigured}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        goLiveChecklist: {
                          ...prev.compliance.goLiveChecklist,
                          tablesConfigured: event.target.checked,
                        },
                      },
                    }))
                  }
                />
                Tables configured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.compliance.goLiveChecklist.paymentsConfigured}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        goLiveChecklist: {
                          ...prev.compliance.goLiveChecklist,
                          paymentsConfigured: event.target.checked,
                        },
                      },
                    }))
                  }
                />
                Payments configured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.compliance.goLiveChecklist.policiesConfigured}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        goLiveChecklist: {
                          ...prev.compliance.goLiveChecklist,
                          policiesConfigured: event.target.checked,
                        },
                      },
                    }))
                  }
                />
                Policies configured
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
