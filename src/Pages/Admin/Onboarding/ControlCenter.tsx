import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiGlobe,
  FiLink,
  FiMail,
  FiShield,
  FiTag,
  FiZap,
} from "react-icons/fi";
import Loader from "@/Components/loader";
import { getJson, postJson, putJson, deleteJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useBranchContext } from "@/context/BranchContext";

const DAYS = [
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
  { label: "Sun", value: "SUNDAY" },
] as const;

const HOLIDAY_TYPES = ["PUBLIC_HOLIDAY", "SEASONAL_CLOSURE", "ADHOC_BLACKOUT"] as const;
const CHANNEL_TYPES = ["SMS", "WHATSAPP", "EMAIL"] as const;
const POS_SYNC_DIRECTIONS = ["INBOUND", "OUTBOUND", "BIDIRECTIONAL"] as const;
const BOOKING_WIDGET_LANGUAGES = ["en", "es", "fr", "pt"];

const DEFAULT_TABLE_CONFIG = {
  minPartySize: 1,
  maxPartySize: 4,
  isCombinable: false,
  isAccessible: false,
  isVIP: false,
  isSmoking: false,
  notes: "",
};

const DEFAULT_WIDGET = {
  name: "Website Widget",
  language: BOOKING_WIDGET_LANGUAGES[0],
  timezone: "",
  minPartySize: 1,
  maxPartySize: 8,
  availableZones: [],
  isActive: true,
};

type DayOfWeek = (typeof DAYS)[number]["value"];

type BusinessHoursPayload = {
  id?: string;
  dayOfWeek: DayOfWeek;
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type Holiday = {
  id: string;
  name: string;
  startDate: string;
  type: (typeof HOLIDAY_TYPES)[number];
  isRecurring: boolean;
};

type ReservationPolicyPayload = {
  id?: string;
  minPartySize: number;
  maxPartySize: number;
  advanceBookingDays: number;
  sameDayCutoffMins: number;
  cancellationWindowHours: number;
  autoConfirm: boolean;
  maxBookingsPerSlot?: number | null;
};

type TurnTimeRule = {
  id: string;
  durationMins: number;
  isDefault: boolean;
  partySizeMin?: number | null;
  partySizeMax?: number | null;
  name?: string | null;
};

type TableSummary = {
  id: string;
  label: string;
  tableNumber: string;
};

type TableConfigPayload = typeof DEFAULT_TABLE_CONFIG & { id?: string };

type CommunicationPayload = {
  id?: string;
  channel: (typeof CHANNEL_TYPES)[number];
  provider: string;
  apiKey: string;
  senderId: string;
  fromName?: string | null;
  isActive: boolean;
};

type PosPayload = {
  id?: string;
  provider: string;
  apiKey: string;
  endpointUrl?: string | null;
  syncFrequencyMins: number;
  syncDirection: (typeof POS_SYNC_DIRECTIONS)[number];
  isActive: boolean;
};

type DataImportItem = {
  id: string;
  importType: string;
  fileName: string;
  status: string;
};

type BrandingPayload = {
  logoUrl?: string | null;
  primaryColor?: string | null;
  customCSSUrl?: string | null;
  isWhiteLabel: boolean;
  customDomain?: string | null;
};

type BookingWidgetPayload = typeof DEFAULT_WIDGET & { id?: string };

type GoLiveStatus = {
  completionPercentage: number;
  isLive: boolean;
  restaurantProfileDone: boolean;
  branchSetupDone: boolean;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  turnTimesDone: boolean;
  reservationPolicyDone: boolean;
  staffSetupDone: boolean;
  paymentConfiguredDone: boolean;
  communicationDone: boolean;
  brandingDone: boolean;
};

const Onboarding = () => {
  const restaurantId = getStoredRestaurantId();
  const { branches, selectedBranchId, setSelectedBranchId, isLoadingBranches: branchesLoading } = useBranchContext();
  const branchError = ""; // Assuming no branch error if context loaded fine, or we could pass it down too.

  const [businessHours, setBusinessHours] = useState<BusinessHoursPayload[]>([]);
  const [businessHoursLoading, setBusinessHoursLoading] = useState(false);

  const [holidayDraft, setHolidayDraft] = useState({
    name: "",
    startDate: "",
    type: HOLIDAY_TYPES[0],
    isRecurring: false,
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [reservationPolicy, setReservationPolicy] = useState<ReservationPolicyPayload>({
    minPartySize: 1,
    maxPartySize: 6,
    advanceBookingDays: 30,
    sameDayCutoffMins: 60,
    cancellationWindowHours: 12,
    autoConfirm: true,
  });
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);

  const [turnTimeRules, setTurnTimeRules] = useState<TurnTimeRule[]>([]);
  const [turnTimeLoading, setTurnTimeLoading] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(90);
  const [defaultRuleId, setDefaultRuleId] = useState<string | null>(null);
  const [newTurnRule, setNewTurnRule] = useState({
    name: "",
    durationMins: 90,
    partySizeMin: 1,
    partySizeMax: 4,
  });

  const [tables, setTables] = useState<TableSummary[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableConfig, setTableConfig] = useState<TableConfigPayload>(DEFAULT_TABLE_CONFIG);
  const [tableConfigId, setTableConfigId] = useState<string | undefined>(undefined);
  const [tableConfigSaving, setTableConfigSaving] = useState(false);

  const [communicationDrafts, setCommunicationDrafts] = useState<
    Record<CommunicationPayload["channel"], CommunicationPayload>
  >(
    CHANNEL_TYPES.reduce((acc, channel) => {
      acc[channel] = { channel, provider: "", apiKey: "", senderId: "", isActive: false } as CommunicationPayload;
      return acc;
    }, {} as Record<CommunicationPayload["channel"], CommunicationPayload>)
  );
  const [communicationLoading, setCommunicationLoading] = useState(false);

  const [posDraft, setPosDraft] = useState<PosPayload>({
    provider: "",
    apiKey: "",
    syncFrequencyMins: 15,
    syncDirection: POS_SYNC_DIRECTIONS[2],
    isActive: true,
  });
  const [posLoading, setPosLoading] = useState(false);

  const [dataImports, setDataImports] = useState<DataImportItem[]>([]);
  const [dataImportsLoading, setDataImportsLoading] = useState(false);

  const [branding, setBranding] = useState<BrandingPayload>({
    isWhiteLabel: false,
  });
  const [brandingLoading, setBrandingLoading] = useState(false);

  const [widgets, setWidgets] = useState<BookingWidgetPayload[]>([]);
  const [widgetDraft, setWidgetDraft] = useState<BookingWidgetPayload>(DEFAULT_WIDGET);
  const [widgetLoading, setWidgetLoading] = useState(false);

  const [goLiveStatus, setGoLiveStatus] = useState<GoLiveStatus | null>(null);
  const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [goLiveActivating, setGoLiveActivating] = useState(false);

  // Fetch branches logic removed, handled by global context

  const loadBusinessHours = async (branchId: string) => {
    setBusinessHoursLoading(true);
    try {
      const response = await getJson<{ data: BusinessHoursPayload[] }>(`/business-hours?branchId=${branchId}`);
      const raw = response.data?.data ?? response.data ?? [];
      const normalized = DAYS.map((day) => {
        const match = raw.find((item) => item.dayOfWeek === day.value);
        return {
          id: match?.id,
          dayOfWeek: day.value,
          label: day.label,
          isOpen: match?.isOpen ?? true,
          openTime: match?.openTime ?? "10:00",
          closeTime: match?.closeTime ?? "22:00",
        };
      });
      setBusinessHours(normalized);
    } catch (error) {
      // silenced as background fetch
    } finally {
      setBusinessHoursLoading(false);
    }
  };

  const loadHolidays = async (branchId: string) => {
    try {
      const response = await getJson<{ data: Holiday[] }>(`/business-hours/holidays?branchId=${branchId}`);
      setHolidays(response.data?.data ?? response.data as unknown as Holiday[] ?? []);
    } catch {
      setHolidays([]);
    }
  };

  const loadReservationPolicy = async (branchId: string) => {
    try {
      const response = await getJson<{ data: ReservationPolicyPayload }>(`/reservation-policies?branchId=${branchId}`);
      const data = response.data?.data ?? response.data as unknown as ReservationPolicyPayload;
      if (data) {
        setReservationPolicy({
          minPartySize: data.minPartySize,
          maxPartySize: data.maxPartySize,
          advanceBookingDays: data.advanceBookingDays,
          sameDayCutoffMins: data.sameDayCutoffMins,
          cancellationWindowHours: data.cancellationWindowHours,
          autoConfirm: data.autoConfirm,
          maxBookingsPerSlot: data.maxBookingsPerSlot ?? undefined,
        });
        setPolicyId(data.id);
      }
    } catch {
      // keep defaults
    }
  };

  const loadTurnTimes = async (branchId: string) => {
    setTurnTimeLoading(true);
    try {
      const response = await getJson<{ data: TurnTimeRule[] }>(`/turn-times?branchId=${branchId}`);
      const rules = response.data?.data ?? response.data as unknown as TurnTimeRule[] ?? [];
      setTurnTimeRules(rules);
      const defaultRule = rules.find((rule) => rule.isDefault);
      setDefaultRuleId(defaultRule?.id ?? null);
      setDefaultDuration(defaultRule?.durationMins ?? 90);
    } catch {
      setTurnTimeRules([]);
    } finally {
      setTurnTimeLoading(false);
    }
  };

  const loadTables = async (branchId: string) => {
    setTablesLoading(true);
    try {
      const response = await getJson<{ data: Array<{ tables: Array<{ id: string; tableNumber: string; label?: string | null }> }> }>(
        `/floor-plans?branchId=${branchId}`
      );
      const payload = response.data?.data ?? response.data as unknown as Array<{ tables: Array<{ id: string; tableNumber: string; label?: string | null }> }> ?? [];
      const flatten = payload.flatMap((plan) =>
        plan.tables.map((table) => ({
          id: table.id,
          label: table.label ?? table.tableNumber,
          tableNumber: table.tableNumber,
        }))
      );
      setTables(flatten);
      if (!selectedTableId && flatten.length) {
        setSelectedTableId(flatten[0].id);
      }
    } catch {
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBranchId) return;
    void loadBusinessHours(selectedBranchId);
    void loadHolidays(selectedBranchId);
    void loadReservationPolicy(selectedBranchId);
    void loadTurnTimes(selectedBranchId);
    void loadTables(selectedBranchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  useEffect(() => {
    if (!selectedTableId) {
      setTableConfig(DEFAULT_TABLE_CONFIG);
      setTableConfigId(undefined);
      return;
    }
    const load = async () => {
      try {
        const response = await getJson<{ data: TableConfigPayload }>(`/table-configs/table/${selectedTableId}`);
        const config = response.data?.data ?? response.data as unknown as TableConfigPayload;
        setTableConfig({
          minPartySize: config.minPartySize,
          maxPartySize: config.maxPartySize,
          isCombinable: config.isCombinable,
          isAccessible: config.isAccessible,
          isVIP: config.isVIP,
          isSmoking: config.isSmoking,
          notes: config.notes,
        });
        setTableConfigId(config.id);
      } catch {
        setTableConfig(DEFAULT_TABLE_CONFIG);
        setTableConfigId(undefined);
      }
    };
    void load();
  }, [selectedTableId]);

  const loadCommunicationChannels = async () => {
    setCommunicationLoading(true);
    try {
      const response = await getJson<{ data: CommunicationPayload[] }>("/communication-channels");
      const channels = response.data?.data ?? response.data as unknown as CommunicationPayload[] ?? [];
      const mapped = CHANNEL_TYPES.reduce((acc, channel) => {
        const found = channels.find((item) => item.channel === channel);
        acc[channel] = found
          ? { id: found.id, channel, provider: found.provider, apiKey: found.apiKey, senderId: found.senderId, fromName: found.fromName ?? null, isActive: found.isActive }
          : { channel, provider: "", apiKey: "", senderId: "", isActive: false };
        return acc;
      }, {} as Record<CommunicationPayload["channel"], CommunicationPayload>);
      setCommunicationDrafts(mapped);
    } catch {
      setCommunicationDrafts((prev) => prev);
    } finally {
      setCommunicationLoading(false);
    }
  };

  const loadPosIntegrations = async () => {
    setPosLoading(true);
    try {
      const response = await getJson<{ data: PosPayload[] }>("/pos-integrations");
      const dataArr = response.data?.data ?? response.data as unknown as PosPayload[] ?? [];
      const first = dataArr[0];
      if (first) {
        setPosDraft({
          id: first.id,
          provider: first.provider,
          apiKey: first.apiKey,
          endpointUrl: first.endpointUrl ?? null,
          syncFrequencyMins: first.syncFrequencyMins ?? 15,
          syncDirection: first.syncDirection ?? POS_SYNC_DIRECTIONS[2],
          isActive: first.isActive,
        });
      }
    } catch {
      setPosDraft((prev) => prev);
    } finally {
      setPosLoading(false);
    }
  };

  const loadDataImports = async () => {
    setDataImportsLoading(true);
    try {
      const response = await getJson<{ data: DataImportItem[] }>("/data-imports");
      setDataImports(response.data?.data ?? response.data as unknown as DataImportItem[] ?? []);
    } catch {
      setDataImports([]);
    } finally {
      setDataImportsLoading(false);
    }
  };

  const loadBranding = async () => {
    setBrandingLoading(true);
    try {
      const response = await getJson<{ data: BrandingPayload }>("/branding");
      const brandingData = response.data?.data ?? response.data as unknown as BrandingPayload;
      setBranding((prev) => ({ ...prev, ...brandingData }));
    } catch {
      setBranding((prev) => prev);
    } finally {
      setBrandingLoading(false);
    }
  };

  const loadBookingWidgets = async () => {
    setWidgetLoading(true);
    try {
      const response = await getJson<{ data: BookingWidgetPayload[] }>("/booking-widgets");
      const items = response.data?.data ?? response.data as unknown as BookingWidgetPayload[] ?? [];
      setWidgets(items);
      if (items.length) {
        setWidgetDraft(items[0]);
      }
    } catch {
      setWidgets([]);
    } finally {
      setWidgetLoading(false);
    }
  };

  const loadGoLiveStatus = async () => {
    if (!restaurantId) return;
    setGoLiveLoading(true);
    try {
      const response = await getJson<{ data: GoLiveStatus }>(`/go-live/${restaurantId}`);
      setGoLiveStatus(response.data?.data ?? response.data as unknown as GoLiveStatus);
    } catch {
      // toast.error("Unable to load go-live status");
    } finally {
      setGoLiveLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!restaurantId) return;
    void loadCommunicationChannels();
    void loadPosIntegrations();
    void loadDataImports();
    void loadBranding();
    void loadBookingWidgets();
    void loadGoLiveStatus();
  }, [restaurantId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleSaveSchedule = async () => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Saving schedule...");
    try {
      await putJson("/business-hours/bulk", {
        branchId: selectedBranchId,
        schedule: businessHours.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          openTime: day.isOpen ? day.openTime : null,
          closeTime: day.isOpen ? day.closeTime : null,
          shifts: [],
        })),
      });
      toast.success("Schedule saved", { id: toastId });
      void loadBusinessHours(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to save schedule", { id: toastId });
    }
  };

  const handleAddHoliday = async () => {
    if (!selectedBranchId || !holidayDraft.name || !holidayDraft.startDate) {
      toast.error("Name and date required");
      return;
    }
    const toastId = toast.loading("Adding holiday...");
    try {
      await postJson("/business-hours/holidays", {
        branchId: selectedBranchId,
        name: holidayDraft.name,
        startDate: `${holidayDraft.startDate}T00:00:00.000Z`,
        type: holidayDraft.type,
        description: null,
        isRecurring: holidayDraft.isRecurring,
      });
      setHolidayDraft({ name: "", startDate: "", type: HOLIDAY_TYPES[0], isRecurring: false });
      toast.success("Holiday added", { id: toastId });
      void loadHolidays(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to add holiday", { id: toastId });
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Deleting holiday...");
    try {
      await deleteJson(`/business-hours/holidays/${id}`);
      toast.success("Holiday deleted", { id: toastId });
      void loadHolidays(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to delete holiday", { id: toastId });
    }
  };

  const handleSavePolicy = async () => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Saving policy...");
    try {
      const payload = {
        branchId: selectedBranchId,
        minPartySize: reservationPolicy.minPartySize,
        maxPartySize: reservationPolicy.maxPartySize,
        advanceBookingDays: reservationPolicy.advanceBookingDays,
        sameDayCutoffMins: reservationPolicy.sameDayCutoffMins,
        cancellationWindowHours: reservationPolicy.cancellationWindowHours,
        autoConfirm: reservationPolicy.autoConfirm,
        maxBookingsPerSlot: reservationPolicy.maxBookingsPerSlot ?? null,
      };
      if (policyId) {
        await putJson(`/reservation-policies/${policyId}`, payload);
      } else {
        const response = await postJson<{ data: ReservationPolicyPayload }>("/reservation-policies", payload);
        const data = response.data?.data ?? response.data as unknown as ReservationPolicyPayload;
        setPolicyId(data?.id);
      }
      toast.success("Saved", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Unable to save policy", { id: toastId });
    }
  };

  const handleSaveDefaultTurnTime = async () => {
    if (!selectedBranchId || !defaultRuleId) {
      toast.error("Create a default rule first");
      return;
    }
    const toastId = toast.loading("Saving...");
    try {
      await putJson(`/turn-times/${defaultRuleId}`, { durationMins: defaultDuration });
      toast.success("Default duration updated", { id: toastId });
      void loadTurnTimes(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to update duration", { id: toastId });
    }
  };

  const handleAddTurnRule = async () => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Adding rule...");
    try {
      await postJson("/turn-times", {
        branchId: selectedBranchId,
        name: newTurnRule.name || undefined,
        durationMins: newTurnRule.durationMins,
        partySizeMin: newTurnRule.partySizeMin,
        partySizeMax: newTurnRule.partySizeMax,
        priority: 1,
      });
      setNewTurnRule({ name: "", durationMins: 90, partySizeMin: 1, partySizeMax: 4 });
      toast.success("Rule saved", { id: toastId });
      void loadTurnTimes(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to add rule", { id: toastId });
    }
  };

  const handleDeleteTurnRule = async (ruleId: string) => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Removing rule...");
    try {
      await deleteJson(`/turn-times/${ruleId}`);
      toast.success("Rule removed", { id: toastId });
      void loadTurnTimes(selectedBranchId);
    } catch (error: any) {
      toast.error(error.message || "Unable to remove rule", { id: toastId });
    }
  };

  const handleTableConfigSave = async () => {
    if (!selectedBranchId || !selectedTableId) return;
    setTableConfigSaving(true);
    const toastId = toast.loading("Saving table config...");
    try {
      const payload = {
        minPartySize: tableConfig.minPartySize,
        maxPartySize: tableConfig.maxPartySize,
        isCombinable: tableConfig.isCombinable,
        isAccessible: tableConfig.isAccessible,
        isVIP: tableConfig.isVIP,
        isSmoking: tableConfig.isSmoking,
        notes: tableConfig.notes,
      };
      if (tableConfigId) {
        await putJson(`/table-configs/${tableConfigId}`, payload);
      } else {
        await postJson("/table-configs", { tableId: selectedTableId, ...payload });
      }
      toast.success("Saved", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Unable to save table config", { id: toastId });
    } finally {
      setTableConfigSaving(false);
    }
  };

  const handleChannelSave = async (channel: CommunicationPayload["channel"]) => {
    const toastId = toast.loading(`Saving ${channel}...`);
    const draft = communicationDrafts[channel];
    try {
      const payload = {
        provider: draft.provider,
        apiKey: draft.apiKey,
        senderId: draft.senderId,
        fromName: draft.fromName ?? null,
        isActive: draft.isActive,
      };
      if (draft.id) {
        await putJson(`/communication-channels/${draft.id}`, payload);
      } else {
        await postJson("/communication-channels", { channel, ...payload });
      }
      toast.success(`${channel} saved`, { id: toastId });
      void loadCommunicationChannels();
    } catch (error: any) {
      toast.error(error.message || `Unable to save ${channel}`, { id: toastId });
    }
  };

  const handlePosSave = async () => {
    const toastId = toast.loading("Saving...");
    try {
      const payload = {
        provider: posDraft.provider,
        apiKey: posDraft.apiKey,
        endpointUrl: posDraft.endpointUrl,
        syncFrequencyMins: posDraft.syncFrequencyMins,
        syncDirection: posDraft.syncDirection,
        isActive: posDraft.isActive,
      };
      if (posDraft.id) {
        await putJson(`/pos-integrations/${posDraft.id}`, payload);
      } else {
        await postJson("/pos-integrations", payload);
      }
      toast.success("Saved", { id: toastId });
      void loadPosIntegrations();
    } catch (error: any) {
      toast.error(error.message || "Unable to save POS settings", { id: toastId });
    }
  };

  const handleConfirmImport = async (id: string) => {
    const toastId = toast.loading("Confirming...");
    try {
      await postJson(`/data-imports/${id}/confirm`);
      toast.success("Confirmed", { id: toastId });
      void loadDataImports();
    } catch (error: any) {
      toast.error(error.message || "Unable to confirm import", { id: toastId });
    }
  };

  const handleBrandingSave = async () => {
    const toastId = toast.loading("Saving...");
    try {
      await putJson("/branding", branding);
      toast.success("Saved", { id: toastId });
      void loadBranding();
    } catch (error: any) {
      toast.error(error.message || "Unable to save branding", { id: toastId });
    }
  };

  const handleWidgetSave = async () => {
    const toastId = toast.loading("Saving...");
    try {
      const payload = {
        name: widgetDraft.name,
        language: widgetDraft.language,
        timezone: widgetDraft.timezone || null,
        minPartySize: widgetDraft.minPartySize,
        maxPartySize: widgetDraft.maxPartySize,
        availableZones: widgetDraft.availableZones,
        isActive: widgetDraft.isActive,
      };
      if (widgetDraft.id) {
        await putJson(`/booking-widgets/${widgetDraft.id}`, payload);
      } else {
        await postJson("/booking-widgets", payload);
      }
      toast.success("Saved", { id: toastId });
      void loadBookingWidgets();
    } catch (error: any) {
      toast.error(error.message || "Unable to save widget", { id: toastId });
    }
  };

  const handleGoLive = async () => {
    if (!restaurantId) return;
    setGoLiveActivating(true);
    const toastId = toast.loading("Activating...");
    try {
      const response = await postJson<{ message: string }>(`/go-live/${restaurantId}/activate`);
      toast.success(response.data?.message ?? "Restaurant is live", { id: toastId });
      void loadGoLiveStatus();
    } catch (error: any) {
      toast.error(error.message || "Unable to go live", { id: toastId });
    } finally {
      setGoLiveActivating(false);
    }
  };

  const goLiveChecklist = useMemo(() => {
    if (!goLiveStatus) return [];
    const checkpoints: Array<[keyof GoLiveStatus, string]> = [
      ["restaurantProfileDone", "Restaurant profile"],
      ["branchSetupDone", "Branch setup"],
      ["businessHoursDone", "Business hours"],
      ["floorPlanDone", "Floor plan"],
      ["tablesConfiguredDone", "Table configuration"],
      ["turnTimesDone", "Turn time rules"],
      ["reservationPolicyDone", "Reservation policy"],
      ["staffSetupDone", "Staff setup"],
      ["paymentConfiguredDone", "Payment gateway"],
      ["communicationDone", "Communication channels"],
      ["brandingDone", "Branding"],
    ];
    return checkpoints.filter(([key]) => !goLiveStatus[key]);
  }, [goLiveStatus]);

  const goLiveProgress = goLiveStatus?.completionPercentage ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Onboarding</div>
        <div className="mt-1 text-3xl font-semibold text-slate-900">Configuration control center</div>
        <p className="mt-2 text-sm text-slate-500">
          Push every onboarding endpoint back to the API so you can adjust hours, table rules, integrations, branding, widgets, and the go-live checklist from one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
          Restaurant ID: <span className="font-semibold text-slate-900">{restaurantId ?? "(not available)"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Active branch</span>
          {branchesLoading ? (
            <Loader size={20} />
          ) : (
            <select
              value={selectedBranchId ?? ""}
              onChange={(event) => setSelectedBranchId(event.target.value || null)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">All Branches (Global Config)</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {branchError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">{branchError}</div>
        )}
      </div>

      <div className="space-y-5">
        {!selectedBranchId ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
            <h3 className="text-sm font-semibold text-blue-900">Global Configuration Mode</h3>
            <p className="mt-1 text-xs text-blue-700">
              Configure restaurant-wide settings like Branding, POS, and Communications. 
              Select a branch above to configure specific hours, tables, and policies.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiCheckCircle className="text-emerald-500" /> Branch Setup: {branches.find(b => b.id === selectedBranchId)?.name}
            </div>
          </div>
        )}

        {selectedBranchId && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiCalendar /> Business hours & holidays
          </div>
          <div className="mt-4 space-y-3">
            {businessHoursLoading ? (
              <div className="flex justify-center">
                <Loader size={24} />
              </div>
            ) : (
              <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                {businessHours.map((day) => (
                  <div key={day.dayOfWeek} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 rounded-xl border border-slate-100 px-3 py-2">
                    <span className="font-semibold text-slate-900">{day.label}</span>
                    <input
                      type="time"
                      value={day.openTime}
                      disabled={!day.isOpen}
                      onChange={(event) =>
                        setBusinessHours((prev) =>
                          prev.map((entry) =>
                            entry.dayOfWeek === day.dayOfWeek ? { ...entry, openTime: event.target.value } : entry
                          )
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                    />
                    <input
                      type="time"
                      value={day.closeTime}
                      disabled={!day.isOpen}
                      onChange={(event) =>
                        setBusinessHours((prev) =>
                          prev.map((entry) =>
                            entry.dayOfWeek === day.dayOfWeek ? { ...entry, closeTime: event.target.value } : entry
                          )
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                    />
                    <label className="text-[11px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={(event) =>
                          setBusinessHours((prev) =>
                            prev.map((entry) =>
                              entry.dayOfWeek === day.dayOfWeek
                                ? { ...entry, isOpen: event.target.checked }
                                : entry
                            )
                          )
                        }
                      />
                      <span className="ml-1">Open</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleSaveSchedule} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                Save schedule
              </button>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-semibold text-slate-900">Holidays & closures</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {holidays.map((holiday) => (
                  <button
                    key={holiday.id}
                    type="button"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    {holiday.name} ({new Date(holiday.startDate).toLocaleDateString()}) ×
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <input
                  placeholder="Holiday name"
                  value={holidayDraft.name}
                  onChange={(event) => setHolidayDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  type="date"
                  value={holidayDraft.startDate}
                  onChange={(event) => setHolidayDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <select
                  value={holidayDraft.type}
                  onChange={(event) => setHolidayDraft((prev) => ({ ...prev, type: event.target.value as any }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {HOLIDAY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={holidayDraft.isRecurring}
                    onChange={(event) => setHolidayDraft((prev) => ({ ...prev, isRecurring: event.target.checked }))}
                  />
                  Recurring
                </label>
              </div>
              <div className="mt-3">
                <button type="button" onClick={handleAddHoliday} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Add holiday
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiClock /> Reservation policy
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <label className="text-xs text-slate-500">
              Max party size
              <input
                type="number"
                value={reservationPolicy.maxPartySize}
                onChange={(event) =>
                  setReservationPolicy((prev) => ({ ...prev, maxPartySize: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Advance booking (days)
              <input
                type="number"
                value={reservationPolicy.advanceBookingDays}
                onChange={(event) =>
                  setReservationPolicy((prev) => ({ ...prev, advanceBookingDays: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Same-day cutoff (mins)
              <input
                type="number"
                value={reservationPolicy.sameDayCutoffMins}
                onChange={(event) =>
                  setReservationPolicy((prev) => ({ ...prev, sameDayCutoffMins: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Cancellation window (hrs)
              <input
                type="number"
                value={reservationPolicy.cancellationWindowHours}
                onChange={(event) =>
                  setReservationPolicy((prev) => ({ ...prev, cancellationWindowHours: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={reservationPolicy.autoConfirm}
                onChange={(event) => setReservationPolicy((prev) => ({ ...prev, autoConfirm: event.target.checked }))}
              />
              Auto-confirm bookings
            </label>
            <label className="text-xs text-slate-500">
              Max bookings per slot
              <input
                type="number"
                value={reservationPolicy.maxBookingsPerSlot ?? ""}
                onChange={(event) =>
                  setReservationPolicy((prev) => ({
                    ...prev,
                    maxBookingsPerSlot: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3">
            <button type="button" onClick={handleSavePolicy} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              Save policy
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiZap /> Turn time rules
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="text-xs text-slate-500">
                Default duration (mins)
                <input
                  type="number"
                  min={30}
                  value={defaultDuration}
                  onChange={(event) => setDefaultDuration(Number(event.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </label>
              <button type="button" onClick={handleSaveDefaultTurnTime} className="h-fit rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                Update default
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              {turnTimeLoading ? (
                <Loader size={20} />
              ) : turnTimeRules.length ? (
                turnTimeRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div>
                      <div className="font-semibold text-slate-900">{rule.name ?? (rule.isDefault ? "Default" : "Rule")}</div>
                      <div>
                        {rule.durationMins} mins · parties {rule.partySizeMin ?? 1}-{rule.partySizeMax ?? "∞"}
                      </div>
                    </div>
                    {!rule.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTurnRule(rule.id)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-[11px] text-rose-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">No rules yet.</div>
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="text-xs font-semibold text-slate-900">Add rule</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newTurnRule.name}
                  onChange={(event) => setNewTurnRule((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={30}
                  placeholder="Duration"
                  value={newTurnRule.durationMins}
                  onChange={(event) => setNewTurnRule((prev) => ({ ...prev, durationMins: Number(event.target.value) }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Party min"
                  value={newTurnRule.partySizeMin}
                  onChange={(event) => setNewTurnRule((prev) => ({ ...prev, partySizeMin: Number(event.target.value) }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Party max"
                  value={newTurnRule.partySizeMax}
                  onChange={(event) => setNewTurnRule((prev) => ({ ...prev, partySizeMax: Number(event.target.value) }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-3">
                <button type="button" onClick={handleAddTurnRule} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Save rule
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiShield /> Table configuration
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <label className="text-xs text-slate-500">Tables</label>
              {tablesLoading ? (
                <Loader size={20} />
              ) : (
                <select
                  value={selectedTableId ?? ""}
                  onChange={(event) => setSelectedTableId(event.target.value || null)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Select table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-500">
              <label className="block">
                Min party size
                <input
                  type="number"
                  min={1}
                  value={tableConfig.minPartySize}
                  onChange={(event) => setTableConfig((prev) => ({ ...prev, minPartySize: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
              </label>
              <label className="block">
                Max party size
                <input
                  type="number"
                  min={1}
                  value={tableConfig.maxPartySize}
                  onChange={(event) => setTableConfig((prev) => ({ ...prev, maxPartySize: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {["isCombinable", "isVIP", "isAccessible", "isSmoking"].map((key) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tableConfig[key as keyof TableConfigPayload] as boolean}
                    onChange={(event) =>
                      setTableConfig((prev) => ({ ...prev, [key]: event.target.checked } as TableConfigPayload))
                    }
                  />
                  {key.replace("is", "")}
                </label>
              ))}
            </div>
            <textarea
              rows={2}
              placeholder="Notes"
              value={tableConfig.notes}
              onChange={(event) => setTableConfig((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleTableConfigSave}
                disabled={tableConfigSaving}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {tableConfigSaving ? "Saving..." : "Save config"}
              </button>
            </div>
          </div>
        </section>
      </>
    )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiMail /> Communication channels
          </div>
          <div className="mt-4 space-y-3">
            {communicationLoading ? (
              <Loader size={24} />
            ) : (
              CHANNEL_TYPES.map((channel) => {
                const draft = communicationDrafts[channel];
                return (
                  <div key={channel} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                      <span>{channel}</span>
                      <button
                        type="button"
                        disabled={!!selectedBranchId}
                        onClick={() => handleChannelSave(channel)}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <input
                        placeholder="Provider"
                        value={draft.provider}
                        onChange={(event) =>
                          setCommunicationDrafts((prev) => ({
                            ...prev,
                            [channel]: { ...prev[channel], provider: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="API key"
                        value={draft.apiKey}
                        onChange={(event) =>
                          setCommunicationDrafts((prev) => ({
                            ...prev,
                            [channel]: { ...prev[channel], apiKey: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Sender ID"
                        value={draft.senderId}
                        onChange={(event) =>
                          setCommunicationDrafts((prev) => ({
                            ...prev,
                            [channel]: { ...prev[channel], senderId: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={draft.isActive}
                          disabled={!!selectedBranchId}
                          onChange={(event) =>
                            setCommunicationDrafts((prev) => ({
                              ...prev,
                              [channel]: { ...prev[channel], isActive: event.target.checked },
                            }))
                          }
                        />
                        Active
                      </label>
                      <input
                        placeholder="From name"
                        value={draft.fromName ?? ""}
                        disabled={!!selectedBranchId}
                        onChange={(event) =>
                          setCommunicationDrafts((prev) => ({
                            ...prev,
                            [channel]: { ...prev[channel], fromName: event.target.value || null },
                          }))
                        }
                        className="ml-auto w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50 disabled:bg-slate-50"
                      />
                    </div>
                    {selectedBranchId && <div className="mt-2 text-xs text-slate-500 italic">Global setting - read only here</div>}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiLink /> POS integrations
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {posLoading ? (
              <Loader size={24} />
            ) : (
              <>
                <input
                  placeholder="Provider"
                  value={posDraft.provider}
                  onChange={(event) => setPosDraft((prev) => ({ ...prev, provider: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  placeholder="API key"
                  value={posDraft.apiKey}
                  onChange={(event) => setPosDraft((prev) => ({ ...prev, apiKey: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  placeholder="Endpoint URL"
                  value={posDraft.endpointUrl ?? ""}
                  onChange={(event) => setPosDraft((prev) => ({ ...prev, endpointUrl: event.target.value || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min={5}
                    placeholder="Sync mins"
                    value={posDraft.syncFrequencyMins}
                    onChange={(event) => setPosDraft((prev) => ({ ...prev, syncFrequencyMins: Number(event.target.value) }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                  <select
                    value={posDraft.syncDirection}
                    onChange={(event) =>
                      setPosDraft((prev) => ({ ...prev, syncDirection: event.target.value as PosPayload["syncDirection"] }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {POS_SYNC_DIRECTIONS.map((dir) => (
                      <option key={dir} value={dir}>
                        {dir}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={posDraft.isActive}
                    onChange={(event) => setPosDraft((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>
                <button type="button" disabled={!!selectedBranchId} onClick={handlePosSave} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                  Save POS
                </button>
                {selectedBranchId && <span className="text-xs text-slate-500 italic">Global setting - read-only while branch selected</span>}
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiDatabase /> Data imports
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {dataImportsLoading ? (
              <Loader size={24} />
            ) : dataImports.length ? (
              dataImports.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900">{item.fileName}</div>
                    <div className="text-xs text-slate-500">
                      {item.importType} · {item.status}
                    </div>
                  </div>
                  {item.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => handleConfirmImport(item.id)}
                      className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">No imports queued.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiTag /> Branding & themes
          </div>
          <div className="mt-4">
            {brandingLoading ? (
              <div className="flex justify-center">
                <Loader size={24} />
              </div>
            ) : (
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <input
                  placeholder="Logo URL"
                  value={branding.logoUrl ?? ""}
                  onChange={(event) => setBranding((prev) => ({ ...prev, logoUrl: event.target.value || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  placeholder="Primary color"
                  value={branding.primaryColor ?? ""}
                  onChange={(event) => setBranding((prev) => ({ ...prev, primaryColor: event.target.value || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  placeholder="Custom CSS URL"
                  value={branding.customCSSUrl ?? ""}
                  onChange={(event) => setBranding((prev) => ({ ...prev, customCSSUrl: event.target.value || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <input
                  placeholder="Custom domain"
                  value={branding.customDomain ?? ""}
                  onChange={(event) => setBranding((prev) => ({ ...prev, customDomain: event.target.value || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={branding.isWhiteLabel}
                    onChange={(event) => setBranding((prev) => ({ ...prev, isWhiteLabel: event.target.checked }))}
                  />
                  White-label enabled
                </label>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            {!selectedBranchId ? (
              <>
                <button type="button" onClick={handleBrandingSave} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Save branding
                </button>
              </>
            ) : (
                <div className="text-xs text-slate-500 italic">Branding is global and can only be updated from the main dashboard.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiGlobe /> Booking widgets
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {widgetLoading ? (
              <Loader size={24} />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={widgetDraft.id ?? ""}
                    onChange={(event) => {
                      const picked = widgets.find((widget) => widget.id === event.target.value);
                      setWidgetDraft(picked ?? DEFAULT_WIDGET);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="">Create new widget</option>
                    {widgets.map((widget) => (
                      <option key={widget.id} value={widget.id}>
                        {widget.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Widget name"
                    value={widgetDraft.name}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={widgetDraft.language}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, language: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {BOOKING_WIDGET_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Timezone"
                    value={widgetDraft.timezone}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Min party"
                    value={widgetDraft.minPartySize}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, minPartySize: Number(event.target.value) }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                  <input
                    type="number"
                    min={2}
                    placeholder="Max party"
                    value={widgetDraft.maxPartySize}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, maxPartySize: Number(event.target.value) }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={widgetDraft.isActive}
                    onChange={(event) => setWidgetDraft((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>
                <div className="mt-4">
                  <button type="button" onClick={handleWidgetSave} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                    Save widget settings
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiCheckCircle /> Go-live checklist
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {goLiveLoading ? (
              <Loader size={24} />
            ) : (
              <>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Completion</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{goLiveProgress.toFixed(0)}%</div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${goLiveProgress}%` }} />
                  </div>
                </div>
                {goLiveChecklist.length ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    Missing: {goLiveChecklist.map(([, label]) => label).join(", ")}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    All required modules configured.
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={handleGoLive}
              disabled={goLiveActivating || !restaurantId || goLiveChecklist.length > 0}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {goLiveActivating ? "Attempting..." : "Go live"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Onboarding;
