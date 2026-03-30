import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getJson, putJson, postJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function ReservationRulesSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { branches, selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const activeBranchId = selectedBranchId || branches[0]?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(null);

  const [reservationPolicy, setReservationPolicy] = useState({
    minPartySize: 1,
    maxPartySize: 8,
    advanceBookingDays: 30,
    sameDayCutoffMins: 60,
    cancellationWindowHours: 12,
    autoConfirm: true,
  });

  useEffect(() => {
    const loadPolicy = async () => {
      if (!activeBranchId) return;
      try {
        const response = await getJson<{ data: any }>(`/reservation-policies?branchId=${activeBranchId}`);
        const data = response.data?.data ?? response.data;
        if (data && data.id) {
          setPolicyId(data.id);
          setReservationPolicy({
            minPartySize: data.minPartySize,
            maxPartySize: data.maxPartySize,
            advanceBookingDays: data.advanceBookingDays,
            sameDayCutoffMins: data.sameDayCutoffMins,
            cancellationWindowHours: data.cancellationWindowHours,
            autoConfirm: data.autoConfirm,
          });
        }
      } catch (err) {
        // use defaults
      } finally {
        setIsLoading(false);
      }
    };
    void loadPolicy();
  }, [activeBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranchId) {
      toast.error("Branch ID missing. Please ensure Location setup is complete.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving reservation rules...");

    try {
      const payload = {
        branchId: activeBranchId,
        ...reservationPolicy
      };

      if (policyId) {
        await putJson(`/reservation-policies/${policyId}`, payload);
      } else {
        await postJson("/reservation-policies", payload);
      }

      await refreshGoLiveStatus();
      toast.success("Reservation rules saved!", { id: toastId });
      onNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to save policy", { id: toastId });
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
        <h2 className="text-xl font-bold text-slate-800">Reservation Rules</h2>
        <p className="text-sm text-slate-500">
          Set basic parameters for how guests can book a table.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Min Party Size</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={reservationPolicy.minPartySize}
                onChange={(e) => setReservationPolicy({ ...reservationPolicy, minPartySize: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Max Party Size</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={reservationPolicy.maxPartySize}
                onChange={(e) => setReservationPolicy({ ...reservationPolicy, maxPartySize: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Advance Booking (Days)</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={reservationPolicy.advanceBookingDays}
                onChange={(e) => setReservationPolicy({ ...reservationPolicy, advanceBookingDays: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Same-Day Cutoff (Mins prior)</label>
              <input
                type="number"
                min="0"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={reservationPolicy.sameDayCutoffMins}
                onChange={(e) => setReservationPolicy({ ...reservationPolicy, sameDayCutoffMins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoConfirm"
              checked={reservationPolicy.autoConfirm}
              onChange={(e) => setReservationPolicy({ ...reservationPolicy, autoConfirm: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="autoConfirm" className="text-sm font-medium text-slate-700">
              Auto-confirm reservations (Skip manual review)
            </label>
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
            {isSaving ? "Saving..." : "Save Rules & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
