import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, putJson, getJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function BookingChannelSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const restaurantId = getStoredRestaurantId();
  const { refreshGoLiveStatus } = useGoLiveContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [widgetConfig, setWidgetConfig] = useState({
    id: "",
    name: "Website Widget",
    language: "en",
    minPartySize: 1,
    maxPartySize: 8,
    isActive: true,
  });

  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const res = await getJson<{ data: any[] }>("/booking-widgets");
        const data = res.data?.data ?? res.data ?? [];
        if (data.length > 0) {
          const w = data[0];
          setWidgetConfig({
            id: w.id,
            name: w.name,
            language: w.language,
            minPartySize: w.minPartySize,
            maxPartySize: w.maxPartySize,
            isActive: w.isActive,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadWidgets();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    setIsSaving(true);
    const toastId = toast.loading("Saving widget settings...");

    try {
      const payload = {
        restaurantId,
        name: widgetConfig.name,
        language: widgetConfig.language,
        minPartySize: widgetConfig.minPartySize,
        maxPartySize: widgetConfig.maxPartySize,
        isActive: widgetConfig.isActive,
      };

      if (widgetConfig.id) {
        await putJson(`/booking-widgets/${widgetConfig.id}`, payload);
      } else {
        await postJson("/booking-widgets", payload);
      }

      await refreshGoLiveStatus();
      toast.success("Settings saved!", { id: toastId });
      onNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings", { id: toastId });
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
        <h2 className="text-xl font-bold text-slate-800">Booking Channel</h2>
        <p className="text-sm text-slate-500">
          Set up the reservation widget you will embed on your website or share via link.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Widget Display Name</label>
              <input
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={widgetConfig.name}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, name: e.target.value })}
                placeholder="My Restaurant Booking"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Default Language</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={widgetConfig.language}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Max Widget Party Size</label>
              <input
                required
                type="number"
                min="1"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={widgetConfig.maxPartySize}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, maxPartySize: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-slate-500 mt-1">
                Beyond this guests must call in.
              </p>
            </div>
          </div>
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
            {isSaving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
