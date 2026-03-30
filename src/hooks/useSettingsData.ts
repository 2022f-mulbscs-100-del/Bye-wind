import { useState, useEffect, useMemo } from "react";
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
    holidays: Array<{ id: string; date: string }>;
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

export function useSettingsData() {
  const { selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const restaurantId = getStoredRestaurantId();

  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [baselineSnapshot, setBaselineSnapshot] = useState<string>(JSON.stringify(DEFAULT_SETTINGS));

  const snapshot = useMemo(() => JSON.stringify(settings), [settings]);
  const hasChanges = snapshot !== baselineSnapshot;

  const fetchData = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const globalPromises = [
        getJson<BrandingResponse>("/branding"),
        getJson<{ data: PaymentResponse[] }>("/payment-gateways"),
        getJson<{ data: CommunicationChannel[] }>("/communication-channels"),
        getJson<{ data: PosResponse[] }>("/pos-integrations"),
        getJson<GoLiveResponse>(`/go-live/${restaurantId}`),
      ];
      
      const branchPromises = selectedBranchId ? [
        getJson<{ data: BusinessHoursResponse[] }>(`/business-hours?branchId=${selectedBranchId}`),
        getJson<{ data: ReservationPolicyResponse }>(`/reservation-policies?branchId=${selectedBranchId}`),
        getJson<{ data: TurnTimeResponse[] }>(`/turn-times?branchId=${selectedBranchId}`),
        getJson<{ data: HolidayResponse[] }>(`/business-hours/holidays?branchId=${selectedBranchId}`),
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
          emailId: email.id,
          emailProvider: email.provider || "SENDGRID",
          emailKey: email.apiKey || "",
          emailSender: email.senderId || "noreply@restaurant.com",
          smsId: sms.id,
          smsProvider: sms.provider || "TWILIO",
          smsKey: sms.apiKey || "",
          smsSender: sms.senderId || "+1234567890",
          whatsappId: whatsapp.id,
          whatsappProvider: whatsapp.provider || "META",
          whatsappKey: whatsapp.apiKey || "",
          whatsappSender: whatsapp.senderId || "+1234567890",
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
            holidays: Array.isArray(holidayRes.data) ? holidayRes.data.map((h: any) => ({
              id: h.id,
              date: h.date
            })) : [],
          },
          reservationPolicy: {
            id: policy.id,
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
              id: t.id,
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

  useEffect(() => {
    fetchData();
  }, [restaurantId, selectedBranchId]);

  const saveSettings = async (tab: 'ops' | 'integrations' | 'compliance') => {
    const toastId = toast.loading("Saving settings...");
    try {
      if (tab === "ops") {
        if (!selectedBranchId) throw new Error("Please select a branch.");
        
        await Promise.all([
          putJson("/business-hours/bulk", {
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
          }),
          settings.reservationPolicy.id 
            ? putJson(`/reservation-policies/${settings.reservationPolicy.id}`, settings.reservationPolicy)
            : postJson("/reservation-policies", {
                branchId: selectedBranchId,
                ...settings.reservationPolicy
              }),
          // Turn times Default
          postJson("/turn-times", {
            branchId: selectedBranchId,
            partySizeMin: 1,
            partySizeMax: 100,
            durationMins: settings.turnTime.defaultDuration,
            isDefault: true
          }),
          ...settings.turnTime.rules.map(r => {
            const [min, max] = r.partySize.split('-').map(Number);
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
          })
        ]);
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
        ]);
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
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings.", { id: toastId });
      return false;
    }
  };

  const resetSettings = () => {
    setSettings(JSON.parse(baselineSnapshot));
    toast.info("Changes discarded.");
  };

  const saveHoliday = async (date: string) => {
    if (!selectedBranchId) return;
    try {
      await postJson("/business-hours/holidays", { 
        branchId: selectedBranchId, 
        name: "Blackout Date", 
        startDate: new Date(date).toISOString(),
        type: "ADHOC_BLACKOUT"
      });
      await refreshGoLiveStatus();
      await fetchData(); // Refresh to get the new holiday ID
      toast.success("Holiday added.");
    } catch (error) {
      toast.error("Failed to add holiday.");
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await deleteJson(`/business-hours/holidays/${id}`); 
      await refreshGoLiveStatus();
      await fetchData();
      toast.success("Holiday removed.");
    } catch (error) {
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
    deleteHoliday,
    selectedBranchId,
    fetchData
  };
}
