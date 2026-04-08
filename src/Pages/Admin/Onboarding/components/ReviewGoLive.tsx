import { useState } from "react";
import { toast } from "sonner";
import { postJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useGoLiveContext } from "@/context/GoLiveContext";
import { useBranchContext } from "@/context/BranchContext";

export default function ReviewGoLive({ onBack }: { onBack: () => void }) {
  const restaurantId = getStoredRestaurantId();
  const { goLiveStatus, refreshGoLiveStatus } = useGoLiveContext();
  const { refreshBranches, selectedBranchId } = useBranchContext();

  const [isActivating, setIsActivating] = useState(false);

  const handleGoLive = async () => {
    if (!restaurantId) return;
    setIsActivating(true);
    const toastId = toast.loading("Activating your restaurant...");

    try {
      const url = selectedBranchId 
        ? `/go-live/${restaurantId}/activate?branchId=${selectedBranchId}`
        : `/go-live/${restaurantId}/activate`;
      const response = await postJson<{ message: string }>(url);
      await Promise.all([
        refreshGoLiveStatus(),
        refreshBranches()
      ]);
      toast.success(response.data?.message ?? "Restaurant is live!", { id: toastId });
      // Parent component (index.tsx routing logic) will automatically detect `isLive=true` 
      // and switch to Configuration Control Center.
    } catch (err: any) {
      toast.error(err.message || "Failed to go live. Make sure all steps are done.", { id: toastId });
    } finally {
      setIsActivating(false);
    }
  };

  const branchStatus = goLiveStatus?.branchStatuses?.find(s => s.branchId === selectedBranchId);
  const activeChecklist = branchStatus || goLiveStatus;

  const checkpoints = [
    { key: "branchSetupDone", label: "Branch Setup", isDone: goLiveStatus?.branchSetupDone },
    { key: "businessHoursDone", label: "Business Hours", isDone: activeChecklist?.businessHoursDone },
    { key: "tablesConfiguredDone", label: "Floor & Tables", isDone: activeChecklist?.floorPlanDone && activeChecklist?.tablesConfiguredDone },
    { key: "reservationPolicyDone", label: "Rules & Policy", isDone: activeChecklist?.reservationPolicyDone && activeChecklist?.turnTimesDone },
    { key: "staffSetupDone", label: "Staff Management", isDone: goLiveStatus?.staffSetupDone },
    { key: "paymentConfiguredDone", label: "Payment Gateway", isDone: goLiveStatus?.paymentConfiguredDone },
    { key: "communicationDone", label: "Communications", isDone: goLiveStatus?.communicationDone },
    { key: "brandingDone", label: "Branding & Theme", isDone: goLiveStatus?.brandingDone },
  ];

  const incompleteCount = checkpoints.filter((c) => !c.isDone).length;
  const canGoLive = (branchStatus ? branchStatus.completionPercentage === 100 : goLiveStatus?.completionPercentage === 100) || incompleteCount === 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-800">You're almost there!</h2>
        <p className="mt-2 text-slate-500">
          Review your checklist and activate your restaurant to start accepting reservations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
          <span>Go-Live Readiness</span>
          <span className="text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {Math.round(goLiveStatus?.completionPercentage || 0)}% Complete
          </span>
        </h3>
        
        <ul className="space-y-3 mb-6">
          {checkpoints.map((point) => (
            <li key={point.label} className="flex items-center justify-between text-sm p-3 rounded-lg border border-slate-100 bg-slate-50">
              <span className={point.isDone ? "text-slate-800 font-medium" : "text-slate-500"}>{point.label}</span>
              {point.isDone ? (
                <span className="flex items-center text-emerald-600 font-medium gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Done
                </span>
              ) : (
                <span className="text-amber-500 font-medium text-xs uppercase tracking-wide">Pending</span>
              )}
            </li>
          ))}
        </ul>

        {canGoLive ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center font-medium">
            Awesome! All required checks are complete. You are ready to go live.
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center text-sm">
            You still have {incompleteCount} required check(s) to complete before going live.
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          disabled={isActivating}
          className="rounded-xl px-6 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleGoLive}
          disabled={!canGoLive || isActivating}
          className={`flex-1 rounded-xl px-6 py-3 font-bold text-white transition-all ${
            canGoLive 
              ? "bg-emerald-600 shadow-lg shadow-emerald-200 hover:bg-emerald-700" 
              : "bg-slate-300 cursor-not-allowed opacity-80"
          }`}
        >
          {isActivating ? "Activating..." : (canGoLive ? "Go Live Now" : "Complete Steps to Finish")}
        </button>
      </div>
    </div>
  );
}
