import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { getJson, postJson, putJson, deleteJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";

type BrandingResponse = {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
};

type PaymentResponse = {
  id?: string;
  provider?: string;
  apiKey?: string;
};

type CommunicationChannel = {
  id?: string;
  channel: string;
  provider?: string;
  apiKey?: string;
  senderId?: string;
};

type PosResponse = {
  id?: string;
  provider?: string;
  apiKey?: string;
};

type GoLiveResponse = {
  hoursConfigured?: boolean;
  tablesConfigured?: boolean;
  paymentsConfigured?: boolean;
  policiesConfigured?: boolean;
};

type BusinessHoursResponse = {
  dayOfWeek?: string;
  openTime?: string;
  closeTime?: string;
  isOpen?: boolean;
};

type ReservationPolicyResponse = {
  id?: string;
  minPartySize?: number;
  maxPartySize?: number;
  advanceBookingDays?: number;
  sameDayCutoffMins?: number;
  cancellationWindowHours?: number;
  autoConfirm?: boolean;
};

type TurnTimeResponse = {
  id?: string;
  partySizeMin?: number;
  partySizeMax?: number;
  durationMins?: number;
  isDefault?: boolean;
};

type HolidayResponse = {
  id?: string;
  date?: string;
  name?: string;
  startDate?: string;
  type?: string;
  isRecurring?: boolean;
};

export type SettingsState = {
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
    emailProvider: string;
    emailKey: string;
    emailSender: string;
    smsId?: string;
    smsProvider: string;
    smsKey: string;
    smsSender: string;
    whatsappId?: string;
    whatsappProvider: string;
    whatsappKey: string;
    whatsappSender: string;
    posId?: string;
    posProvider: string;
    posKey: string;
  };
  ops: {
    businessHours: Array<{ day: string; open: string; close: string; closed: boolean }>;
    holidays: Array<{
      id: string;
      name: string;
      date: string;
      startDate: string;
      type?: string;
      isRecurring?: boolean;
    }>;
  };
  reservationPolicy: {
    minPartySize: number;
    maxPartySize: number;
    advanceBookingDays: number;
    sameDayCutoffMins: number;
    cancellationWindowHours: number;
    autoConfirm: boolean;
    id?: string; // Backend ID for updates
    turnTimesDone?: boolean; // UI helper
  };
  turnTime: {
    defaultDuration: number;
    rules: Array<{ id?: string; partySize: string; duration: number }>;
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

export const DEFAULT_SETTINGS: SettingsState = {
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    accentColor: "#FF5733",
    fontFamily: "Inter",
  },
  integrations: {
    emailProvider: "SENDGRID",
    emailKey: "",
    emailSender: "noreply@restaurant.com",
    smsProvider: "TWILIO",
    smsKey: "",
    smsSender: "+1234567890",
    whatsappProvider: "META",
    whatsappKey: "",
    whatsappSender: "+1234567890",
    posProvider: "",
    posKey: "",
  },
  ops: {
    businessHours: [
      { day: "Mon", open: "00:00", close: "00:00", closed: true },
      { day: "Tue", open: "00:00", close: "00:00", closed: true },
      { day: "Wed", open: "00:00", close: "00:00", closed: true },
      { day: "Thu", open: "00:00", close: "00:00", closed: true },
      { day: "Fri", open: "00:00", close: "00:00", closed: true },
      { day: "Sat", open: "00:00", close: "00:00", closed: true },
      { day: "Sun", open: "00:00", close: "00:00", closed: true },
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

export function useSettingsData() {
  const { selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const restaurantId = getStoredRestaurantId();

  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [baselineSnapshot, setBaselineSnapshot] = useState<string>(JSON.stringify(DEFAULT_SETTINGS));

  const snapshot = useMemo(() => JSON.stringify(settings), [settings]);
  const hasChanges = snapshot !== baselineSnapshot;

  const fetchData = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const globalPromises = [
        getJson<BrandingResponse>("/branding"),
        getJson<PaymentResponse[]>("/payment-gateways"),
        getJson<CommunicationChannel[]>("/communication-channels"),
        getJson<PosResponse[]>("/pos-integrations"),
        getJson<GoLiveResponse>(`/go-live/${restaurantId}`),
      ];
      
      const branchPromises = selectedBranchId ? [
        getJson<BusinessHoursResponse[]>(`/business-hours?branchId=${selectedBranchId}`),
        getJson<ReservationPolicyResponse>(`/reservation-policies?branchId=${selectedBranchId}`),
        getJson<TurnTimeResponse[]>(`/turn-times?branchId=${selectedBranchId}`),
        getJson<HolidayResponse[]>(`/business-hours/holidays?branchId=${selectedBranchId}`),
      ] : [];

      const responses = await Promise.all([...globalPromises, ...branchPromises]);
      
      const [brandingRes, , commsRes, posRes, goLiveRes] = responses.slice(0, 5) as unknown as [
        { data: BrandingResponse },
        { data: PaymentResponse[] },
        { data: CommunicationChannel[] },
        { data: PosResponse[] },
        { data: GoLiveResponse }
      ];
      // Only get branch responses if selected
      const branchResponses = selectedBranchId ? (responses.slice(5) as unknown as [
        { data: BusinessHoursResponse[] },
        { data: ReservationPolicyResponse },
        { data: TurnTimeResponse[] },
        { data: HolidayResponse[] }
      ]) : null;

      const branding = (brandingRes?.data as BrandingResponse) || ({} as BrandingResponse);
      const comms = (commsRes && Array.isArray(commsRes.data)) ? (commsRes.data as CommunicationChannel[]) : [];
      const pos = (posRes && Array.isArray(posRes.data) && posRes.data.length > 0) ? (posRes.data[0] as PosResponse) : ({} as PosResponse);
      const goLive = (goLiveRes?.data as GoLiveResponse) || ({} as GoLiveResponse);

      const sms = (comms.find((c) => c.channel === 'SMS') as CommunicationChannel | undefined) || ({} as CommunicationChannel);
      const whatsapp = (comms.find((c) => c.channel === 'WHATSAPP') as CommunicationChannel | undefined) || ({} as CommunicationChannel);
      const email = (comms.find((c) => c.channel === 'EMAIL') as CommunicationChannel | undefined) || ({} as CommunicationChannel);

      let newSettings: SettingsState = {
        ...DEFAULT_SETTINGS,
        branding: {
          logoUrl: branding?.logoUrl || "",
          faviconUrl: branding?.faviconUrl || "",
          primaryColor: branding?.primaryColor || "#000000",
          secondaryColor: branding?.secondaryColor || "#FFFFFF",
          accentColor: branding?.accentColor || "#FF5733",
          fontFamily: branding?.fontFamily || "Inter",
        },
        integrations: {
          emailProvider: email?.provider || "SENDGRID",
          emailKey: email?.apiKey || "",
          emailSender: email?.senderId || "noreply@restaurant.com",
          smsProvider: sms?.provider || "TWILIO",
          smsKey: sms?.apiKey || "",
          smsSender: sms?.senderId || "+1234567890",
          whatsappProvider: whatsapp?.provider || "META",
          whatsappKey: whatsapp?.apiKey || "",
          whatsappSender: whatsapp?.senderId || "+1234567890",
          posProvider: pos?.provider || "",
          posKey: pos?.apiKey || "",
        },
        compliance: {
          goLiveChecklist: {
            hoursConfigured: goLive?.hoursConfigured || false,
            tablesConfigured: goLive?.tablesConfigured || false,
            paymentsConfigured: goLive?.paymentsConfigured || false,
            policiesConfigured: goLive?.policiesConfigured || false,
          }
        }
      };

      if (selectedBranchId && branchResponses) {
        const [hoursRes, policyRes, turnRes, holidayRes] = branchResponses;
        const hours = (hoursRes?.data as BusinessHoursResponse[]) || [];
        const policy = (policyRes?.data as ReservationPolicyResponse) || {};
        const turns = (turnRes?.data as TurnTimeResponse[]) || [];
        const holidays = (holidayRes?.data as HolidayResponse[]) || [];
        const defaultTurn = turns.find((t: TurnTimeResponse) => t.isDefault);

        newSettings = {
          ...newSettings,
          ops: {
            businessHours: hours.length > 0 ? hours.map((h: BusinessHoursResponse) => ({
              day: h.dayOfWeek || "",
              open: h.openTime || "00:00",
              close: h.closeTime || "00:00",
              closed: !h.isOpen,
            })) : DEFAULT_SETTINGS.ops.businessHours,
            holidays: Array.isArray(holidays) ? holidays.map((h: HolidayResponse) => ({
              id: h.id || "",
              name: h.name || "Blackout Date",
              date: h.startDate || h.date || "",
              startDate: h.startDate || h.date || "",
              type: h.type,
              isRecurring: h.isRecurring,
            })) : [],
          },
          reservationPolicy: {
            id: policy?.id,
            minPartySize: policy?.minPartySize || 1,
            maxPartySize: policy?.maxPartySize || 20,
            advanceBookingDays: policy?.advanceBookingDays || 30,
            sameDayCutoffMins: policy?.sameDayCutoffMins || 60,
            cancellationWindowHours: policy?.cancellationWindowHours || 24,
            autoConfirm: policy?.autoConfirm ?? true,
          },
          turnTime: {
            defaultDuration: defaultTurn && typeof defaultTurn.durationMins === 'number' ? defaultTurn.durationMins : 90,
            rules: turns.filter((t: TurnTimeResponse) => !t.isDefault).map((t: TurnTimeResponse) => ({
              id: t.id,
              partySize: `${t.partySizeMin}-${t.partySizeMax}`,
              duration: t.durationMins || 90
            })),
          },
        };
      }

      setSettings(newSettings);
      setBaselineSnapshot(JSON.stringify(newSettings));
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, selectedBranchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveSettings = async (tab: 'ops' | 'integrations' | 'compliance') => {
    const toastId = toast.loading("Saving settings...");
    try {
      if (tab === "ops") {
        if (!selectedBranchId) throw new Error("Please select a branch.");
        
        // Save business hours
        await putJson("/business-hours/bulk", {
          branchId: selectedBranchId,
          schedule: settings.ops.businessHours.map(h => ({
            dayOfWeek: h.day.toUpperCase() === "SUN" ? "SUNDAY" : 
                       h.day.toUpperCase() === "MON" ? "MONDAY" :
                       h.day.toUpperCase() === "TUE" ? "TUESDAY" :
                       h.day.toUpperCase() === "WED" ? "WEDNESDAY" :
                       h.day.toUpperCase() === "THU" ? "THURSDAY" :
                       h.day.toUpperCase() === "FRI" ? "FRIDAY" : "SATURDAY",
            openTime: h.open,
            closeTime: h.close,
            isOpen: !h.closed,
            shifts: []
          }))
        });

        // Save reservation policy
        if (settings.reservationPolicy.id) {
          await putJson(`/reservation-policies/${settings.reservationPolicy.id}`, settings.reservationPolicy);
        } else {
          await postJson("/reservation-policies", {
            branchId: selectedBranchId,
            ...settings.reservationPolicy
          });
        }

        // Fetch existing turn time rules to find default
        const existingRulesRes = await getJson<TurnTimeResponse[]>(`/turn-times?branchId=${selectedBranchId}`);
        const existingRules = existingRulesRes.data || [];
        const defaultRule = existingRules.find((t: TurnTimeResponse) => t.isDefault);

        // Save or update default turn time rule
        if (defaultRule) {
          await putJson(`/turn-times/${defaultRule.id}`, {
            durationMins: settings.turnTime.defaultDuration,
            isDefault: true
          });
        } else {
          await postJson("/turn-times", {
            branchId: selectedBranchId,
            partySizeMin: 1,
            partySizeMax: 100,
            durationMins: settings.turnTime.defaultDuration,
            isDefault: true
          });
        }

        // Save custom turn time rules
        const rulePromises = settings.turnTime.rules.map(r => {
          // Validate partySize format
          const parts = r.partySize.split('-').map(s => Number(s.trim()));
          if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            throw new Error(`Invalid party size format: "${r.partySize}". Expected format: "min-max" (e.g., "6-8")`);
          }
          
          const [min, max] = parts;
          if (min <= 0 || max <= 0 || min > max) {
            throw new Error(`Invalid party size range: min=${min}, max=${max}. Both must be positive and min must be <= max`);
          }

          const payload = {
            branchId: selectedBranchId,
            partySizeMin: min,
            partySizeMax: max,
            durationMins: r.duration,
            isDefault: false
          };
          
          return r.id 
            ? putJson(`/turn-times/${r.id}`, payload)
            : postJson("/turn-times", payload);
        });

        await Promise.all(rulePromises);

      } else if (tab === "integrations") {
        await Promise.all([
          postJson("/communication-channels/bulk", {
            channels: [
              { channel: "SMS", provider: settings.integrations.smsProvider, apiKey: settings.integrations.smsKey, senderId: settings.integrations.smsSender, isActive: !!settings.integrations.smsKey },
              { channel: "WHATSAPP", provider: settings.integrations.whatsappProvider, apiKey: settings.integrations.whatsappKey, senderId: settings.integrations.whatsappSender, isActive: !!settings.integrations.whatsappKey },
              { channel: "EMAIL", provider: settings.integrations.emailProvider, apiKey: settings.integrations.emailKey, senderId: settings.integrations.emailSender, isActive: !!settings.integrations.emailKey }
            ]
          }),
          settings.integrations.posProvider && postJson("/pos-integrations", {
            provider: settings.integrations.posProvider,
            apiKey: settings.integrations.posKey,
            isActive: true
          })
        ].filter(Boolean));
      } else if (tab === "compliance") {
        await putJson("/branding", {
          ...settings.branding,
          restaurantId
        });
      }

      await refreshGoLiveStatus();
      setBaselineSnapshot(snapshot);
      toast.success("Settings saved successfully!", { id: toastId });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings.";
      toast.error(errorMessage, { id: toastId });
      return false;
    }
  };

  const resetSettings = () => {
    setSettings(JSON.parse(baselineSnapshot));
    toast.info("Changes discarded.");
  };

  const saveHoliday = async (data: { name: string; startDate: string }) => {
    if (!selectedBranchId) return;
    try {
      await postJson("/business-hours/holidays", { 
        branchId: selectedBranchId, 
        name: data.name,
        startDate: `${data.startDate}T00:00:00.000Z`,
        type: "ADHOC_BLACKOUT"
      });
      await refreshGoLiveStatus();
      await fetchData(); // Refresh to get the new holiday ID
      toast.success("Holiday added.");
    } catch {
      toast.error("Failed to add holiday.");
    }
  };

  const updateHoliday = async (
    id: string,
    data: { name: string; startDate: string }
  ) => {
    try {
      await putJson(`/business-hours/holidays/${id}`, {
        name: data.name,
        startDate: `${data.startDate}T00:00:00.000Z`,
        type: "ADHOC_BLACKOUT",
      });
      await refreshGoLiveStatus();
      await fetchData();
      toast.success("Holiday updated.");
    } catch {
      toast.error("Failed to update holiday.");
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await deleteJson(`/business-hours/holidays/${id}`); 
      await refreshGoLiveStatus();
      await fetchData();
      toast.success("Holiday removed.");
    } catch {
      toast.error("Failed to remove holiday.");
    }
  };

  return {
    settings,
    setSettings,
    isLoading,
    hasChanges,
    saveSettings,
    resetSettings,
    saveHoliday,
    updateHoliday,
    deleteHoliday,
    selectedBranchId,
    fetchData
  };
}
