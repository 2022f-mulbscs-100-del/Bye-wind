import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, getJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function FloorTableSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { branches, selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const activeBranchId = selectedBranchId || branches[0]?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingLayout, setHasExistingLayout] = useState(false);
  
  const [quickSetup, setQuickSetup] = useState({
    twoSeaters: 0,
    fourSeaters: 0,
    sixSeaters: 0,
    eightSeaters: 0,
  });

  useEffect(() => {
    const checkExisting = async () => {
      if (!activeBranchId) return;
      try {
        const res = await getJson<{ data: any[] }>(`/floor-plans?branchId=${activeBranchId}`);
        const data = res.data?.data ?? res.data ?? [];
        if (data.length > 0) {
          setHasExistingLayout(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void checkExisting();
  }, [activeBranchId]);

  const handleQuickSetupSave = async () => {
    if (!activeBranchId) {
      toast.error("Branch ID missing. Please ensure Location setup is complete.");
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Generating floor plan & tables...");
    try {
      // Create a default floor plan
      const fpRes = await postJson<{ data: any }>("/floor-plans", {
        branchId: activeBranchId,
        name: "Main Dining Room",
        canvasWidth: 800,
        canvasHeight: 600,
        isActive: true,
      });
      
      const floorPlanId = (fpRes.data?.data as any)?.id ?? (fpRes.data as any)?.id;

      // Create Tables based on counts
      const tablesToCreate: any[] = [];
      let nextNumber = 1;

      const addTables = (count: number, capacity: number) => {
        for (let i = 0; i < count; i++) {
          tablesToCreate.push({
            floorPlanId,
            tableNumber: `T${nextNumber++}`,
            capacity,
            shape: capacity > 4 ? "RECTANGLE" : "SQUARE",
            width: capacity > 4 ? 120 : 60,
            height: 60,
            positionX: (nextNumber * 40) % 700,
            positionY: (nextNumber * 30) % 500
          });
        }
      };

      addTables(quickSetup.twoSeaters, 2);
      addTables(quickSetup.fourSeaters, 4);
      addTables(quickSetup.sixSeaters, 6);
      addTables(quickSetup.eightSeaters, 8);

      if (tablesToCreate.length > 0) {
        await postJson("/tables/bulk", { tables: tablesToCreate });
      }

      await refreshGoLiveStatus();
      toast.success("Tables generated!", { id: toastId });
      onNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to setup tables", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipToAdvanced = () => {
    // Optionally mark floor plan done on backend empty, but let's just proceed
    onNext();
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
        <h2 className="text-xl font-bold text-slate-800">Floor & Table Setup</h2>
        <p className="text-sm text-slate-500">
          How many tables do you have? We'll create a default layout you can customize later.
        </p>
      </div>

      {hasExistingLayout && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-sm text-emerald-800 font-medium">
            You already have a floor plan set up! You can proceed or generate more tables.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Option A: Quick Setup</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>2-Seater Tables</span>
                <span className="text-slate-400 font-normal">Capacity: 1-2</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={quickSetup.twoSeaters}
                onChange={(e) => setQuickSetup({ ...quickSetup, twoSeaters: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>4-Seater Tables</span>
                <span className="text-slate-400 font-normal">Capacity: 3-4</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={quickSetup.fourSeaters}
                onChange={(e) => setQuickSetup({ ...quickSetup, fourSeaters: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>6-Seater Tables</span>
                <span className="text-slate-400 font-normal">Capacity: 5-6</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={quickSetup.sixSeaters}
                onChange={(e) => setQuickSetup({ ...quickSetup, sixSeaters: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>8+ Seater Tables</span>
                <span className="text-slate-400 font-normal">Capacity: 7-8+</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={quickSetup.eightSeaters}
                onChange={(e) => setQuickSetup({ ...quickSetup, eightSeaters: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <button
            onClick={handleQuickSetupSave}
            disabled={isSaving}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Generating..." : "Generate Tables & Continue"}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-slate-900">Or</span>
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <h3 className="font-semibold text-slate-800 mb-2">Option B: Advanced Drag & Drop</h3>
          <p className="text-sm text-slate-500 mb-4">
            Want to visually draw your walls, zones, and custom seating? You can do this in the main dashboard after onboarding.
          </p>
          <button
            onClick={handleSkipToAdvanced}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Skip for now & Setup Later
          </button>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
