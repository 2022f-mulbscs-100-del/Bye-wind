import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useGoLiveContext } from "@/context/GoLiveContext";
import {
  FiAlertTriangle,
  FiEdit2,
  FiPlus,
  FiShield,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Loader from "@/Components/loader";
import { deleteJson, getJson, postJson, putJson } from "@/lib/api";
import { getStoredRestaurantId, isSessionActive } from "@/lib/auth";
import type { BackendPaymentGateway, PaymentGatewayView } from "@/lib/adapters/payment";
import { mapPaymentGatewayToView } from "@/lib/adapters/payment";

type GatewayFormData = {
  id?: string;
  provider: "STRIPE" | "SQUARE";
  currency: string;
  isActive: boolean;
  isTestMode: boolean;
  taxRate: number;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
};

const Payment = () => {
  const [gateways, setGateways] = useState<PaymentGatewayView[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [gatewayError, setGatewayError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshGoLiveStatus } = useGoLiveContext();
  const [formData, setFormData] = useState<GatewayFormData>({
    provider: "STRIPE",
    currency: "USD",
    isActive: true,
    isTestMode: true,
    taxRate: 0,
    apiKey: "",
    secretKey: "",
    webhookSecret: "",
  });

  const restaurantId = getStoredRestaurantId();

  const loadGateways = async () => {
    if (!isSessionActive()) {
      setLoadingGateways(false);
      return;
    }

    setLoadingGateways(true);
    try {
      const response = await getJson<BackendPaymentGateway[]>("/payment-gateways", {
        headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
      });
      const payload = response.data.length ? response.data : [];
      setGateways(payload.map(mapPaymentGatewayToView));
      setGatewayError("");
    } catch (err) {
      setGateways([]);
      setGatewayError("Unable to fetch payment gateway data.");
      console.error(err);
    } finally {
      setLoadingGateways(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, [restaurantId]);

  const handleOpenModal = (gateway?: PaymentGatewayView) => {
    if (gateway) {
      setFormData({
        id: gateway.id,
        provider: gateway.provider as "STRIPE" | "SQUARE",
        currency: gateway.currency,
        isActive: gateway.status === "Active",
        isTestMode: gateway.isTestMode,
        taxRate: gateway.taxRate ?? 0,
        apiKey: "********", // Don't show actual keys
        secretKey: "********",
        webhookSecret: "********",
      });
    } else {
      setFormData({
        provider: "STRIPE",
        currency: "USD",
        isActive: true,
        isTestMode: true,
        taxRate: 0,
        apiKey: "",
        secretKey: "",
        webhookSecret: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this gateway?")) return;
    const toastId = toast.loading("Removing gateway...");
    try {
      await deleteJson(`/payment-gateways/${id}`, {
        headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
      });
      setGateways((prev) => prev.filter((g) => g.id !== id));
      refreshGoLiveStatus(); // Refresh onboarding status
      toast.success("Gateway removed.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete gateway.", { id: toastId });
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Saving configuration...");
    try {
      const isUpdate = !!formData.id;
      const url = isUpdate ? `/payment-gateways/${formData.id}` : "/payment-gateways";
      const method = isUpdate ? putJson : postJson;

      // Filter out dummy keys if they weren't changed
      const payload: any = { ...formData };
      if (payload.apiKey === "********") delete payload.apiKey;
      if (payload.secretKey === "********") delete payload.secretKey;
      if (payload.webhookSecret === "********") delete payload.webhookSecret;

      await method(url, payload, {
        headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
      });

      setIsModalOpen(false);
      loadGateways();
      refreshGoLiveStatus(); // Refresh onboarding status
      toast.success("Gateway configuration saved!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to save gateway configuration.", { id: toastId });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gatewayStats = useMemo(() => {
    const total = gateways.length;
    const activeGateways = gateways;
    const active = activeGateways.filter((gateway) => gateway.status === "Active").length;
    const testMode = activeGateways.filter((gateway) => gateway.isTestMode).length;
    const currencies = new Set(activeGateways.map((gateway) => gateway.currency)).size;
    return [
      { label: "Connected gateways", value: `${active}/${total}` },
      { label: "Test mode enabled", value: `${testMode}` },
      { label: "Currencies supported", value: `${currencies}` },
    ];
  }, [gateways]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payments & Billing
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Payment Gateways</div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <FiPlus /> Connect Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {gatewayStats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase text-slate-400">
                {item.label}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiTag />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Configured Gateways</div>
              <p className="mt-1 text-sm text-slate-500">
                Manage your payment processing integrations and environments.
              </p>
            </div>
            <FiShield className="text-slate-400" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {loadingGateways ? (
              <div className="flex items-center justify-center py-6">
                <Loader size={28} color="#0f172a" />
              </div>
            ) : (
              <>
                {gatewayError && (
                  <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {gatewayError}
                  </div>
                )}
                {gateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all hover:border-slate-300 hover:bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        {gateway.provider} 
                        {gateway.isTestMode && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">TEST</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {gateway.currency} · {gateway.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleOpenModal(gateway)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600"
                        title="Edit Configuration"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                         onClick={() => handleDelete(gateway.id)}
                         className="p-1.5 text-slate-400 hover:text-rose-600"
                         title="Remove Gateway"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
                {gateways.length === 0 && !gatewayError && (
                  <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <p>No gateways connected yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiAlertTriangle /> Status Monitor
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-500">
              Webhooks are automatically configured to sync payment status in real-time.
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Webhook listener active
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Security Note</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Credentials are encrypted using AES-256 before being stored. Only authenticated requests can trigger transactions.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {formData.id ? "Edit Gateway" : "Connect Gateway"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Provider</label>
                <select 
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value as any})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="STRIPE">Stripe</option>
                  <option value="SQUARE">Square</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Currency</label>
                  <input 
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                    placeholder="USD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tax Rate (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">API Key</label>
                <input 
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                  placeholder={formData.id ? "Leave unchanged" : "pk_test_..."}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Secret Key</label>
                <input 
                  type="password"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                  placeholder={formData.id ? "Leave unchanged" : "sk_test_..."}
                />
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isTestMode}
                    onChange={(e) => setFormData({...formData, isTestMode: e.target.checked})}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Test Mode</span>
                </label>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;

