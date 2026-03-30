import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, putJson, getJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function PaymentSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const restaurantId = getStoredRestaurantId();
  const { refreshGoLiveStatus } = useGoLiveContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // We'll just manage one draft conceptually for Stripe
  const [stripeConfig, setStripeConfig] = useState({
    id: "",
    provider: "STRIPE",
    apiKey: "",
    secretKey: "",
    isActive: false,
  });

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const res = await getJson<{ data: any[] }>("/payment-gateways");
        const data = res.data?.data ?? res.data ?? [];
        const stripe = data.find((d: any) => d.provider === "STRIPE");
        if (stripe) {
          setStripeConfig({
            id: stripe.id,
            provider: stripe.provider,
            apiKey: stripe.apiKey,
            secretKey: "********", // Don't expose real secret on fetch
            isActive: stripe.isActive,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadPayment();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    if (stripeConfig.isActive && (!stripeConfig.apiKey || !stripeConfig.secretKey)) {
      toast.error("API keys are required if payment is active.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving payment gateway...");

    try {
      const payload = {
        restaurantId,
        provider: "STRIPE",
        apiKey: stripeConfig.apiKey,
        secretKey: stripeConfig.secretKey.includes("***") ? undefined : stripeConfig.secretKey,
        isActive: stripeConfig.isActive,
      };

      if (stripeConfig.id) {
        await putJson(`/payment-gateways/${stripeConfig.id}`, payload);
      } else {
        await postJson("/payment-gateways", payload);
      }

      await refreshGoLiveStatus();
      toast.success("Payment setup saved!", { id: toastId });
      onNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment setup", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Payment Setup</h2>
        <p className="text-sm text-slate-500">
          Connect your Stripe account to capture deposits or cancelation fees.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="stripeActive"
                checked={stripeConfig.isActive}
                onChange={(e) => setStripeConfig({ ...stripeConfig, isActive: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="stripeActive" className="text-sm font-medium text-slate-700">
                Enable Stripe integration
              </label>
            </div>
            {!stripeConfig.isActive && (
              <p className="text-xs text-slate-500 ml-8">
                You can skip this if you don't plan to collect deposits upfront.
              </p>
            )}
          </div>

          {stripeConfig.isActive && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Publishable Key</label>
                <input
                  required
                  placeholder="pk_live_..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={stripeConfig.apiKey}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, apiKey: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Secret Key</label>
                <input
                  required
                  type="password"
                  placeholder="sk_live_..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={stripeConfig.secretKey}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : stripeConfig.isActive ? "Save & Continue" : "Skip & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
