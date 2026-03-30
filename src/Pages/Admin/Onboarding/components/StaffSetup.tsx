import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, getJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function StaffSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const restaurantId = getStoredRestaurantId();
  const { refreshGoLiveStatus } = useGoLiveContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "MANAGER",
    password: "", // In a real flow, you'd send an invite email, but here we require a password setup
  });

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await getJson<{ data: any[] }>("/staff");
        setStaffList(res.data?.data ?? res.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    if (!newStaff.firstName || !newStaff.email || !newStaff.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Adding staff...");

    try {
      const payload = {
        restaurantId,
        firstName: newStaff.firstName,
        lastName: newStaff.lastName,
        email: newStaff.email,
        password: newStaff.password,
        role: newStaff.role,
        branchIds: [], // Assign to all or defaults
      };

      const res = await postJson<{ data: any }>("/staff", payload);
      const added = res.data?.data ?? res.data;
      setStaffList([...staffList, added]);

      setNewStaff({ firstName: "", lastName: "", email: "", role: "MANAGER", password: "" });
      toast.success("Staff added!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to add staff", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipOrNext = async () => {
    // Optionally trigger an empty PUT to /go-live/:id to just mark it as done
    // Or just rely on the step progression.
    await refreshGoLiveStatus();
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size={30} />
      </div>
    );
  }

  const existingOtherStaff = staffList.filter(s => s.role !== "OWNER");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Staff Setup (Optional)</h2>
        <p className="text-sm text-slate-500">
          Add Managers or Hosts to help run the restaurant, or do it later.
        </p>
      </div>

      {existingOtherStaff.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3">Added Staff</h3>
          <ul className="divide-y divide-slate-100">
            {existingOtherStaff.map((s, idx) => (
              <li key={idx} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">{s.firstName} {s.lastName}</div>
                  <div className="text-xs text-slate-500">{s.email}</div>
                </div>
                <div className="text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  {s.role}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleAddStaff} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="font-medium text-slate-800 mb-4">Add new team member</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
            <input
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newStaff.firstName}
              onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newStaff.lastName}
              onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Initial Password</label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            >
              <option value="MANAGER">Manager</option>
              <option value="HOST">Host</option>
              <option value="STAFF">Waitstaff</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg border border-indigo-600 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
        >
          {isSaving ? "Adding..." : "Add Staff Member"}
        </button>
      </form>

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={handleSkipOrNext}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          {existingOtherStaff.length > 0 ? "Continue" : "Skip & Continue"}
        </button>
      </div>
    </div>
  );
}
