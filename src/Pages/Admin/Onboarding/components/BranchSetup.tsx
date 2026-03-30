import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, putJson, getJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";
import { getStoredRestaurantId } from "@/lib/auth";

export default function BranchSetup({ onNext }: { onNext: () => void }) {
  const { refreshBranches, branches, setSelectedBranchId, selectedBranchId } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const restaurantId = getStoredRestaurantId();

  const [formData, setFormData] = useState({
    name: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    timezone: "UTC",
    phone: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [existingBranchId, setExistingBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (branches.length > 0) {
      const b = branches[0] as any;
      setExistingBranchId(b.id);
      setFormData({
        name: b.name,
        address: b.address || { street: "", city: "", state: "", zipCode: "", country: "" },
        timezone: b.timezone || "UTC",
        phone: b.phone || "",
        email: b.email || "",
      });
    }
  }, [branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Restaurant ID missing. Please refresh or contact support.");
      return;
    }

    if (!formData.name || !formData.address.city || !formData.address.country) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving branch details...");

    try {
      if (existingBranchId) {
        await putJson(`/branches/${existingBranchId}`, formData);
      } else {
        await postJson(`/branches`, { restaurantId, ...formData });
      }

      await refreshBranches();
      await refreshGoLiveStatus();
      
      // If no branch is selected, select the first one (likely the one just created)
      if (!selectedBranchId) {
        const response = await getJson<{ data: any[] }>("/branches?limit=50");
        const data = (response.data as any)?.data ?? response.data ?? [];
        if (data.length > 0) {
          setSelectedBranchId(data[0].id);
        }
      }

      toast.success("Branch saved successfully!", { id: toastId });
      onNext();
    } catch (error: any) {
      toast.error(error.message || "Failed to save branch.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Branch Details</h2>
        <p className="text-sm text-slate-500">
          Set up your primary location.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Branch Name <span className="text-red-500">*</span></label>
          <input
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Main Downtown"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Street Address</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              placeholder="123 Food Street"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">City <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              placeholder="New York"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">State / Region</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.address.state}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              placeholder="NY"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Zip / Postal Code</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
              placeholder="10001"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Country <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.address.country}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
              placeholder="United States"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="branch@restaurant.com"
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
