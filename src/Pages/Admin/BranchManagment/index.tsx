import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiMapPin,
  FiPlus,
  FiXCircle,
} from "react-icons/fi";
import Loader from "@/Components/loader";
import { getJson, postJson, putJson, type ApiErrorDetail } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";

type BranchAddress = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

type BranchChecklist = {
  completionPercentage: number;
  isReady: boolean;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  reservationPolicyDone: boolean;
  turnTimesDone: boolean;
};

type BranchGoLiveStatus = {
  id: string;
  branchId: string;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  reservationPolicyDone: boolean;
  turnTimesDone: boolean;
  completionPercentage: number;
  isReady: boolean;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
  };
};

type BackendBranch = {
  id: string;
  restaurantId: string;
  name: string;
  timezone: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  isLive: boolean;
  address?: BranchAddress | null;
  goLiveStatus?: BranchChecklist | null;
  status?: string | null;
};

type BranchFormState = {
  name: string;
  timezone: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

type GoLiveChecklist = {
  restaurantId: string;
  restaurantProfileDone: boolean;
  branchSetupDone: boolean;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  reservationPolicyDone: boolean;
  turnTimesDone: boolean;
  staffSetupDone: boolean;
  paymentConfiguredDone: boolean;
  communicationDone: boolean;
  brandingDone: boolean;
  branchStatuses?: BranchGoLiveStatus[];
  completionPercentage: number;
  isLive: boolean;
  wentLiveAt?: string | null;
  lastCheckedAt?: string | null;
};

type ActivationError = ApiErrorDetail;

type PillState = "create" | "pending" | "live";

const PILL_STATES: PillState[] = ["create", "pending", "live"];

const PILL_LABELS: Record<PillState, string> = {
  create: "Create",
  pending: "Pending/Configure",
  live: "Live",
};

const GO_LIVE_CHECKPOINTS: { key: keyof Omit<GoLiveChecklist, "restaurantId" | "completionPercentage" | "isLive" | "wentLiveAt" | "lastCheckedAt" | "branchStatuses">; label: string }[] = [
  { key: "restaurantProfileDone", label: "Restaurant profile configured" },
  { key: "branchSetupDone", label: "Branch setup completed" },
  { key: "businessHoursDone", label: "Business hours configured" },
  { key: "floorPlanDone", label: "Floor plan designed" },
  { key: "tablesConfiguredDone", label: "Tables configured" },
  { key: "reservationPolicyDone", label: "Reservation policy set" },
  { key: "turnTimesDone", label: "Turn times tuned" },
  { key: "staffSetupDone", label: "Staff setup verified" },
  { key: "paymentConfiguredDone", label: "Payment gateway configured" },
  { key: "communicationDone", label: "Communication channels ready" },
  { key: "brandingDone", label: "Branding refreshed" },
];

const createEmptyForm = (): BranchFormState => ({
  name: "",
  timezone: "",
  phone: "",
  email: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
});

const formatAddress = (address?: BranchAddress | null) => {
  const parts = [
    address?.street,
    address?.city,
    address?.state,
    address?.zipCode,
    address?.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "N/A";
};

const normalizeStatus = (status?: string | null) =>
  (status ?? "").toUpperCase();

const getStatusLabel = (branch: BackendBranch | null) => {
  const status = normalizeStatus(branch?.status);
  if (status === "LIVE") return "Live";
  if (status === "PENDING") return "Pending";
  if (status === "DRAFT") return "Draft";
  if (branch?.isLive) return "Live";
  if (branch?.isActive) return "Pending";
  return "Draft";
};

const badgeStyles: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Draft: "bg-slate-100 text-slate-600",
};

const getBranchListEndpoint = (pill: Exclude<PillState, "create">) =>
  pill === "live" ? "/branches/live?limit=50" : "/branches/pending?limit=50";

const BranchManagment = () => {
  const [activePill, setActivePill] = useState<PillState>("pending");
  const [branches, setBranches] = useState<BackendBranch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BackendBranch | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormState>(createEmptyForm());
  const [isCreating, setIsCreating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [goLiveChecklist, setGoLiveChecklist] = useState<GoLiveChecklist | null>(null);
  const [goLiveLoading, setGoLiveLoading] = useState(true);
  const [goLiveActivationErrors, setGoLiveActivationErrors] = useState<ActivationError[]>([]);
  const [activatingGoLive, setActivatingGoLive] = useState(false);
  const restaurantId = getStoredRestaurantId();

  const loadBranches = async (
      pill: Exclude<PillState, "create"> = activePill === "live" ? "live" : "pending",
    preferredBranchId?: string
  ) => {
    setLoadingBranches(true);
    try {
      const response = await getJson<BackendBranch[]>(getBranchListEndpoint(pill));
      const list = response.data ?? [];
      setBranches(list);
      if (!isCreating) {
        setSelectedBranchId((current) => {
          if (
            preferredBranchId &&
            list.some((branch) => branch.id === preferredBranchId)
          ) {
            return preferredBranchId;
          }
          if (current && list.some((branch) => branch.id === current)) {
            return current;
          }
          return list[0]?.id ?? null;
        });
      }
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to load branches at this time."
      );
      setBranches([]);
      setSelectedBranchId(null);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadGoLiveChecklist = async () => {
    if (!restaurantId) {
      setGoLiveChecklist(null);
      setGoLiveLoading(false);
      return;
    }

    setGoLiveLoading(true);
    try {
      const response = await getJson<GoLiveChecklist>(`/go-live/${restaurantId}`);
      setGoLiveChecklist(response.data ?? null);
      setGoLiveActivationErrors([]);
    } catch (err) {
      console.error("Unable to load go-live checklist", err);
      setGoLiveChecklist(null);
    } finally {
      setGoLiveLoading(false);
    }
  };

  const mapBranchToForm = (branch: BackendBranch): BranchFormState => ({
    name: branch.name ?? "",
    timezone: branch.timezone ?? "",
    phone: branch.phone ?? "",
    email: branch.email ?? "",
    address: {
      street: branch.address?.street ?? "",
      city: branch.address?.city ?? "",
      state: branch.address?.state ?? "",
      zipCode: branch.address?.zipCode ?? "",
      country: branch.address?.country ?? "",
    },
  });

  const loadBranchDetail = async (branchId: string) => {
    setLoadingDetail(true);
    try {
      const response = await getJson<BackendBranch>(`/branches/${branchId}`);
      const branch = response.data ?? null;
      setSelectedBranch(branch);
      setBranchForm(branch ? mapBranchToForm(branch) : createEmptyForm());
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to load branch details."
      );
      setSelectedBranch(null);
      setBranchForm(createEmptyForm());
    } finally {
      setLoadingDetail(false);
    }
  };

  const checklistItems = useMemo(() => {
    return GO_LIVE_CHECKPOINTS.map((checkpoint) => ({
      label: checkpoint.label,
      ready: Boolean(goLiveChecklist?.[checkpoint.key]),
    }));
  }, [goLiveChecklist]);

  useEffect(() => {
    void loadBranches("pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    void loadGoLiveChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (isCreating) return;
    if (!selectedBranchId) {
      setSelectedBranch(null);
      setBranchForm(createEmptyForm());
      return;
    }
    void loadBranchDetail(selectedBranchId);
  }, [selectedBranchId, isCreating]);

  useEffect(() => {
    if (activePill === "create" || isCreating) {
      return;
    }
    void loadBranches(activePill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePill, isCreating]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setActivePill("create");
    setSelectedBranchId(null);
    setSelectedBranch(null);
    setBranchForm(createEmptyForm());
    setStatusMessage("");
    setErrorMessage("");
    setGoLiveActivationErrors([]);
  };

  const handleSelectBranch = (branchId: string) => {
    setIsCreating(false);
    const branch = branches.find((item) => item.id === branchId);
    const status = normalizeStatus(branch?.status);
    if (status === "LIVE") {
      setActivePill("live");
    } else {
      setActivePill("pending");
    }
    setSelectedBranchId(branchId);
    setGoLiveActivationErrors([]);
  };

  const handleFormField = (field: keyof BranchFormState, value: string) => {
    setBranchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressField = (field: keyof BranchFormState["address"], value: string) => {
    setBranchForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const buildPayload = () => ({
    name: branchForm.name.trim(),
    timezone: branchForm.timezone.trim(),
    phone: branchForm.phone.trim() || null,
    email: branchForm.email.trim() || null,
    address: {
      street: branchForm.address.street.trim(),
      city: branchForm.address.city.trim(),
      state: branchForm.address.state.trim(),
      zipCode: branchForm.address.zipCode.trim(),
      country: branchForm.address.country.trim(),
    },
  });

  const canSave =
    Boolean(branchForm.name.trim()) &&
    Boolean(branchForm.timezone.trim()) &&
    Boolean(branchForm.address.street.trim()) &&
    Boolean(branchForm.address.city.trim()) &&
    Boolean(branchForm.address.state.trim()) &&
    Boolean(branchForm.address.zipCode.trim()) &&
    Boolean(branchForm.address.country.trim());

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const toastId = toast.loading(isCreating ? "Creating branch..." : "Saving changes...");
    try {
      if (isCreating) {
        const payload = { ...buildPayload(), status: "PENDING" };
        const response = await postJson<BackendBranch>("/branches", payload);
        const created = response.data;
        setIsCreating(false);
        toast.success("Branch created successfully.", { id: toastId });
        setActivePill("pending");
        if (created?.id) {
          setSelectedBranchId(created.id);
          await loadBranches("pending", created.id);
        } else {
          await loadBranches("pending");
        }
      } else if (selectedBranch) {
        const response = await putJson<BackendBranch>(
          `/branches/${selectedBranch.id}`,
          buildPayload()
        );
        const updated = response.data ?? selectedBranch;
        toast.success("Branch updated successfully.", { id: toastId });
        await loadBranches(activePill === "live" ? "live" : "pending", updated.id);
        setSelectedBranchId(updated.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to save branch. Please try again.", { id: toastId });
    } finally {
      await loadGoLiveChecklist();
      setSaving(false);
    }
  };

  const handleToggleActive = async (isActive: boolean) => {
    if (!selectedBranch) return;
    setSaving(true);
    const toastId = toast.loading(isActive ? "Moving to pending..." : "Moving to draft...");
    try {
      const status = isActive ? "PENDING" : "DRAFT";
      const response = await putJson<BackendBranch>(
        `/branches/${selectedBranch.id}`,
        { ...buildPayload(), isActive, status }
      );
      const updated = response.data ?? selectedBranch;
      setSelectedBranch(updated);
      toast.success(isActive ? "Branch moved to pending." : "Branch moved to draft.", { id: toastId });
      setActivePill("pending");
      await loadBranches("pending", updated.id);
      setSelectedBranchId(isActive ? updated.id : null);
    } catch (err: any) {
      toast.error(err.message || "Unable to update branch status.", { id: toastId });
    } finally {
      await loadGoLiveChecklist();
      setSaving(false);
    }
  };

  const handleGoLive = async () => {
    if (!restaurantId || !selectedBranch) return;
    setActivatingGoLive(true);
    const toastId = toast.loading("Activating Go Live...");
    setGoLiveActivationErrors([]);
    try {
      const response = await postJson<{ message: string }>(
        `/go-live/${restaurantId}/activate`
      );
      toast.success(response.message || "Restaurant is now LIVE!", { id: toastId });
      await loadGoLiveChecklist();
      await loadBranches("live", selectedBranch.id);
      setActivePill("live");
    } catch (err: any) {
      const message = err.message || "Unable to mark restaurant as live.";
      toast.error(message, { id: toastId });

      if (err.errors && err.errors.length) {
        setGoLiveActivationErrors(err.errors);
      }
    } finally {
      setActivatingGoLive(false);
    }
  };

  const filteredBranches = useMemo(() => {
    if (activePill === "create") {
      return [];
    }
    return branches;
  }, [branches, activePill]);

  const showBranchList = activePill !== "create";

  useEffect(() => {
    if (isCreating || activePill === "create") {
      setSelectedBranchId(null);
      return;
    }
    if (!filteredBranches.length) {
      setSelectedBranchId(null);
      return;
    }
    if (selectedBranchId && filteredBranches.some((branch) => branch.id === selectedBranchId)) {
      return;
    }
    setSelectedBranchId(filteredBranches[0].id);
  }, [filteredBranches, isCreating, selectedBranchId, activePill]);

  const completionRatio = Math.round(goLiveChecklist?.completionPercentage ?? 0);
  const branchReady = Boolean(selectedBranch?.goLiveStatus?.isReady);
  const goLiveChecklistReady = goLiveChecklist?.completionPercentage === 100;
  const branchStatus = normalizeStatus(selectedBranch?.status);
  const canActivateGoLive = Boolean(
    selectedBranch && branchStatus === "PENDING" && branchReady && goLiveChecklistReady
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Branches
          </div>
          <div className="text-2xl font-semibold text-slate-900">Branches Management</div>
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <FiPlus /> Create New Branch
        </button>
      </div>

      {(errorMessage || statusMessage) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          {errorMessage || statusMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {PILL_STATES.map((pill) => {
          const isSelected = activePill === pill;
          const handlePillClick = () => {
            if (pill === "create") {
              handleStartCreate();
              return;
            }
            setIsCreating(false);
            setSelectedBranch(null);
            setStatusMessage("");
            setErrorMessage("");
            setGoLiveActivationErrors([]);
            setActivePill(pill);
          };
          return (
            <button
              key={pill}
              type="button"
              onClick={handlePillClick}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                isSelected
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {PILL_LABELS[pill]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_2fr]">
        <div className="space-y-3">
          {loadingBranches ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              <Loader size={24} color="#0f172a" />
            </div>
          ) : showBranchList ? (
            filteredBranches.length ? (
              filteredBranches.map((branch) => {
                const status = getStatusLabel(branch);
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      branch.id === selectedBranchId && !isCreating
                        ? "border-slate-900 bg-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{branch.name}</div>
                        <div className="text-xs text-slate-500">{formatAddress(branch.address)}</div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                          badgeStyles[status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <FiMapPin className="text-slate-400" /> {branch.timezone}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                No branches found for this view.
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              {activePill === "create" ? "Add details to create a new branch." : "Select the Create pill or the button above to add a branch, then use Pending/Live to view it."}
            </div>
          )}
        </div>

        {activePill !== "create" && filteredBranches.length === 0 ? (
           <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center">
             <div className="rounded-full bg-slate-50 p-4 mb-4">
                <FiMapPin className="text-3xl text-slate-400" />
             </div>
             <h3 className="text-lg font-semibold text-slate-900 mb-2">No branches found</h3>
             <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
               There are no {activePill} branches for this restaurant. Create a new branch to get started.
             </p>
             <button
               type="button"
               onClick={handleStartCreate}
               className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
             >
               <FiPlus /> Create Branch
             </button>
           </div>
        ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="text-xs font-semibold uppercase text-slate-400">
                {isCreating ? "New branch" : "Branch Profile"}
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {isCreating ? "Create a new branch" : selectedBranch?.name ?? "Select a branch"}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                badgeStyles[getStatusLabel(selectedBranch)] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {isCreating ? "Draft" : getStatusLabel(selectedBranch)}
            </span>
          </div>

          {loadingDetail && !isCreating ? (
            <div className="mt-5 flex items-center justify-center">
              <Loader size={28} color="#0f172a" />
            </div>
          ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Branch name", value: branchForm.name, field: "name" as const },
              { label: "Timezone", value: branchForm.timezone, field: "timezone" as const },
            ].map((item) => (
              <label key={item.label} className="space-y-1 text-xs font-semibold text-slate-500">
                {item.label}
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={item.value}
                  onChange={(event) => handleFormField(item.field, event.target.value)}
                />
              </label>
            ))}

            {[
              { label: "Street", field: "street" as const },
              { label: "City", field: "city" as const },
              { label: "State", field: "state" as const },
              { label: "ZIP Code", field: "zipCode" as const },
              { label: "Country", field: "country" as const },
            ].map((item) => (
              <label key={item.label} className="space-y-1 text-xs font-semibold text-slate-500">
                {item.label}
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={branchForm.address[item.field]}
                  onChange={(event) => handleAddressField(item.field, event.target.value)}
                />
              </label>
            ))}

            {[
              { label: "Phone", field: "phone" as const },
              { label: "Email", field: "email" as const },
            ].map((item) => (
              <label key={item.label} className="space-y-1 text-xs font-semibold text-slate-500">
                {item.label}
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={branchForm[item.field]}
                  onChange={(event) => handleFormField(item.field, event.target.value)}
                />
              </label>
            ))}
          </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm ${
                canSave
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <FiEdit3 />
              {isCreating ? "Create branch" : "Save changes"}
            </button>
            {!isCreating && (
              <>
                <button
                  type="button"
                  onClick={() => handleToggleActive(false)}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FiXCircle /> Move to Draft
                </button>
                <button
                  type="button"
                  onClick={handleGoLive}
                  disabled={!canActivateGoLive || activatingGoLive}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                    canActivateGoLive
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <FiCheckCircle />
                  {activatingGoLive ? "Going Live…" : "Go Live"}
                </button>
              </>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Go-Live Checklist & Validation</span>
              <span className="text-xs text-slate-500">
                {goLiveLoading ? "Loading…" : `${completionRatio}% complete`}
              </span>
            </div>
            {goLiveLoading ? (
              <div className="mt-3 flex items-center justify-center text-xs text-slate-500">
                <Loader size={20} color="#0f172a" />
                <span className="ml-2">Checking go-live readiness…</span>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
                {checklistItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.ready ? (
                      <FiCheckCircle className="text-emerald-500" />
                    ) : (
                      <FiClock className="text-amber-500" />
                    )}
                    {item.label}
                  </div>
                ))}
              </div>
            )}
            {goLiveActivationErrors.length > 0 && (
              <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-600">
                {goLiveActivationErrors.map((error) => (
                  <div key={`${error.field}-${error.message}`} className="flex items-center gap-2">
                    <FiXCircle className="text-rose-500" />
                    <span>
                      <span className="font-semibold">
                        {error.field ?? "Checklist"}
                      </span>
                      {": "}{error.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default BranchManagment;
