import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getJson, putJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

const DAYS = [
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
  { label: "Sun", value: "SUNDAY" },
] as const;

type DayOfWeek = (typeof DAYS)[number]["value"];

type BusinessHoursPayload = {
  id?: string;
  dayOfWeek: DayOfWeek;
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export default function BusinessHoursSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { branches, selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  
  const [businessHours, setBusinessHours] = useState<BusinessHoursPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeBranchId = selectedBranchId || branches[0]?.id;

  useEffect(() => {
    const loadBusinessHours = async () => {
      if (!activeBranchId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await getJson<{ data: BusinessHoursPayload[] }>(`/business-hours?branchId=${activeBranchId}`);
        const raw = response.data?.data ?? response.data ?? [];
        
        const normalized = DAYS.map((day) => {
          const match = raw.find((item: any) => item.dayOfWeek === day.value);
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
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBusinessHours();
  }, [activeBranchId]);

  const handleUpdateDay = (index: number, field: keyof BusinessHoursPayload, value: any) => {
    setBusinessHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!activeBranchId) {
      toast.error("Branch ID missing. Please ensure Location setup is complete.");
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Saving business hours...");
    try {
      await putJson("/business-hours/bulk", {
        branchId: activeBranchId,
        schedule: businessHours.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          openTime: day.isOpen ? day.openTime : null,
          closeTime: day.isOpen ? day.closeTime : null,
          shifts: [],
        })),
      });
      await refreshGoLiveStatus();
      toast.success("Business hours saved!", { id: toastId });
      onNext();
    } catch (error: any) {
      toast.error(error.message || "Failed to save hours", { id: toastId });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Business Hours</h2>
        <p className="text-sm text-slate-500">
          Set up your operating schedule for reservations.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {businessHours.map((day, idx) => (
            <div key={day.dayOfWeek} className="flex items-center justify-between bg-white p-4">
              <div className="flex items-center gap-4 w-1/3">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => handleUpdateDay(idx, "isOpen", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className={`font-medium ${day.isOpen ? "text-slate-900" : "text-slate-400"}`}>
                  {day.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                {day.isOpen ? (
                  <>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleUpdateDay(idx, "openTime", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm w-full max-w-[140px]"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleUpdateDay(idx, "closeTime", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm w-full max-w-[140px]"
                    />
                  </>
                ) : (
                  <span className="text-sm font-medium text-slate-400 italic">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
