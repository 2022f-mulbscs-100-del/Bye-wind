import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { postJson, getJson, putJson } from "@/lib/api";
import { getStoredRestaurantId, isSessionActive } from "@/lib/auth";
import { useBranchContext } from "@/context/BranchContext";
import { useGoLiveContext } from "@/context/GoLiveContext";

type StaffRole = "STAFF" | "MANAGER";

type StaffRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  staffUsername?: string;
  phone?: string | null;
  role: StaffRole;
  isActive: boolean;
  restaurantId?: string | null;
  createdAt?: string;
  staffCredentialCreatedAt?: string;
  branches?: Array<{
    branchId: string;
    isPrimary: boolean;
    branch?: { id: string; name: string };
  }>;
};

type StaffDetail = StaffRecord & {
  permissions?: Record<string, boolean> | null;
  lastLoginAt?: string | null;
  updatedAt?: string;
};

type StaffForm = StaffDetail & {
  password?: string;
  selectedBranchId?: string | null;
};

const ROLE_OPTIONS: StaffRole[] = ["STAFF", "MANAGER"];
const DEFAULT_ROLE: StaffRole = "STAFF";

const StaffManagment = () => {
  const { selectedBranchId, branches } = useBranchContext();
  const { refreshGoLiveStatus } = useGoLiveContext();
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffForm | null>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const restaurantId = getStoredRestaurantId();
  const apiHeaders = useMemo(
    () => (restaurantId ? { "x-restaurant-id": restaurantId } : undefined),
    [restaurantId]
  );

  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      if (!isSessionActive()) {
        setListLoading(false);
        return;
      }
      try {
        const url = selectedBranchId ? `/staff?branchId=${selectedBranchId}` : `/staff`;
        const response = await getJson<StaffRecord[]>(url, {
          headers: apiHeaders,
        });
        if (!mounted) return;
        setStaffList(response.data ?? []);
      } catch (error) {
        console.error("Unable to load staff list", error);
      } finally {
        if (mounted) setListLoading(false);
      }
    };
    fetchStaff();
    return () => {
      mounted = false;
    };
  }, [apiHeaders, selectedBranchId]);

  const formattedList = useMemo(() => staffList, [staffList]);

  const openForm = async (staff?: StaffRecord, create = false) => {
    setIsCreating(create);
    setFormError("");
    const needsDetail = Boolean(staff && !create);
    setIsDetailLoading(needsDetail);

    const baseline: StaffForm = staff
      ? {
          ...staff,
          phone: staff.phone ?? "",
          restaurantId: staff.restaurantId ?? restaurantId ?? null,
          permissions: null,
          branches: [],
          selectedBranchId: staff.branches?.[0]?.branchId ?? null,
          password: "",
        }
      : {
          id: "new",
          firstName: "",
          lastName: "",
          email: "",
          staffUsername: "",
          phone: "",
          role: DEFAULT_ROLE,
          isActive: true,
          restaurantId: restaurantId ?? null,
          permissions: {},
          branches: [],
          selectedBranchId: selectedBranchId,
          password: "",
        };

    setSelectedStaff(baseline);
    setShowFormModal(true);

    if (needsDetail && staff) {
      try {
        const response = await getJson<StaffDetail>(`/staff/${staff.id}`, {
          headers: apiHeaders,
        });
        setSelectedStaff((prev) =>
          prev
            ? { 
                ...prev, 
                ...response.data, 
                password: "",
                selectedBranchId: response.data.branches?.[0]?.branchId ?? null
              }
            : { ...response.data, password: "", selectedBranchId: response.data.branches?.[0]?.branchId ?? null }
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load staff details.";
        setFormError(message);
      } finally {
        setIsDetailLoading(false);
      }
    } else {
      setIsDetailLoading(false);
    }
  };

  const closeForm = () => {
    setSelectedStaff(null);
    setFormError("");
    setFormLoading(false);
    setIsCreating(false);
    setIsDetailLoading(false);
    setShowFormModal(false);
  };

  const fullName = (staff: StaffRecord) => `${staff.firstName} ${staff.lastName}`;
  const roleOptions = useMemo(() => {
    if (!selectedStaff) return ROLE_OPTIONS;
    return Array.from(new Set([...ROLE_OPTIONS, selectedStaff.role]));
  }, [selectedStaff]);

  const getBranchInfo = (staff: StaffRecord) => {
    if (!staff.branches || staff.branches.length === 0) return "No branch assigned";
    const primaryBranch = staff.branches[0];
    return primaryBranch.branch?.name || 'Unknown';
  };

  const handleSave = async () => {
    if (!selectedStaff) return;

    const trimmedFirstName = selectedStaff.firstName.trim();
    const trimmedLastName = selectedStaff.lastName.trim();
    const trimmedEmail = selectedStaff.email.trim().toLowerCase();

    if (!trimmedFirstName || !trimmedLastName || (isCreating && !trimmedEmail)) {
      setFormError("First name, last name, and email are required.");
      return;
    }

    // Ensure branchId is null if empty string
    const branchId = selectedStaff.selectedBranchId && selectedStaff.selectedBranchId.trim() !== "" 
      ? selectedStaff.selectedBranchId 
      : null;

    const basePayload = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      phone: selectedStaff.phone?.trim() || null,
      role: selectedStaff.role,
      isActive: selectedStaff.isActive,
      branchId,
    };

    if (isCreating) {
      if (!selectedStaff.password || selectedStaff.password.length < 8) {
        setFormError("Password must be at least 8 characters.");
        return;
      }
    }

    setFormLoading(true);
    const toastId = toast.loading(isCreating ? "Registering staff..." : "Updating staff...");
    try {
      if (isCreating) {
        const payload = {
          ...basePayload,
          email: trimmedEmail,
          password: selectedStaff.password,
          restaurantId: restaurantId ?? undefined,
        };
        console.log('Creating staff with payload:', payload);
        const registerResponse = await postJson<{ staff: StaffRecord; token: string }>(
          "/staff/register",
          payload,
          { headers: apiHeaders }
        );

        const newStaff = registerResponse.data.staff;
        setStaffList((prev) => [newStaff, ...prev]);
        toast.success("Staff registered successfully!", { id: toastId });
      } else {
        console.log('Updating staff with payload:', basePayload);
        const updateResponse = await putJson<StaffRecord>(
          `/staff/${selectedStaff.id}`,
          basePayload,
          { headers: apiHeaders }
        );

        const updatedStaff = updateResponse.data;
        console.log('Update response:', updatedStaff);
        setStaffList((prev) =>
          prev.map((staff) =>
            staff.id === selectedStaff.id ? { ...staff, ...updatedStaff, branches: updatedStaff.branches || [] } : staff
          )
        );

        toast.success("Staff updated successfully!", { id: toastId });
      }
      refreshGoLiveStatus(); // Refresh onboarding status
      closeForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save staff.";
      setFormError(message);
      toast.error(message, { id: toastId });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    const toastId = toast.loading("Deactivating staff...");
    try {
      await putJson(`/staff/${id}`, { isActive: false }, { headers: apiHeaders });
      setStaffList((prev) =>
        prev.map((staff) => (staff.id === id ? { ...staff, isActive: false } : staff))
      );
      toast.success("Staff deactivated.", { id: toastId });
      //eslint-disable-next-line
    } catch (error: any) {
      console.error("Unable to deactivate staff", error);
      toast.error(error.message || "Failed to deactivate staff.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Staff
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Staff Management</div>
          <p className="mt-2 text-sm text-slate-500">
            Manage staff profiles, roles, branches, and access credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openForm(undefined, true)}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <FiPlus />
          Add Staff
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {listLoading ? (
          <div className="text-sm text-slate-500">Loading staff…</div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase tracking-wide text-slate-500 sticky top-0 bg-white">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Branches</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formattedList.map((staff) => (
                  <tr key={staff.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{fullName(staff)}</div>
                      <div className="text-xs text-slate-500">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-700">{staff.staffUsername || 'N/A'}</div>
                      <div className="text-xs text-slate-500">Created: {staff.staffCredentialCreatedAt ? new Date(staff.staffCredentialCreatedAt).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">{staff.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 font-medium">{getBranchInfo(staff)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          staff.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {staff.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/staff/${staff.id}`}
                          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                          aria-label={`View ${fullName(staff)}`}
                          title="View profile"
                        >
                          <FiEye />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void openForm(staff)}
                          className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 hover:border-slate-300"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(staff.id)}
                          className="rounded-full border border-slate-200 bg-white p-2 text-rose-500 hover:border-rose-300"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showFormModal && selectedStaff && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4">
        <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">
                {isCreating ? "Register Staff" : "Update Staff"}
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs text-slate-500">
                First name
                <input
                  type="text"
                  autoComplete="off"
                  value={selectedStaff.firstName}
                  onChange={(event) =>
                    setSelectedStaff((prev) => (prev ? { ...prev, firstName: event.target.value } : prev))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                />
              </label>
              <label className="text-xs text-slate-500">
                Last name
                <input
                  type="text"
                  autoComplete="off"
                  value={selectedStaff.lastName}
                  onChange={(event) =>
                    setSelectedStaff((prev) => (prev ? { ...prev, lastName: event.target.value } : prev))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                />
              </label>
              <label className="text-xs text-slate-500 md:col-span-2">
                Email
                <input
                  type="email"
                  autoComplete="off"
                  value={selectedStaff.email}
                  onChange={(event) =>
                    setSelectedStaff((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                  }
                  disabled={!isCreating}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                />
              </label>
              <label className="text-xs text-slate-500">
                Phone
                <input
                  type="tel"
                  autoComplete="off"
                  value={selectedStaff.phone ?? ""}
                  onChange={(event) =>
                    setSelectedStaff((prev) => (prev ? { ...prev, phone: event.target.value } : prev))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                />
              </label>
              <label className="text-xs text-slate-500">
                Role
                <select
                  value={selectedStaff.role}
                  onChange={(event) =>
                    setSelectedStaff((prev) => (prev ? { ...prev, role: event.target.value as StaffRole } : prev))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-500">
                Status
                <select
                  value={selectedStaff.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setSelectedStaff((prev) =>
                      prev
                        ? { ...prev, isActive: event.target.value === "active" }
                        : prev
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              {isCreating && (
                <label className="text-xs text-slate-500 md:col-span-2">
                  Password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={selectedStaff.password ?? ""}
                    onChange={(event) =>
                      setSelectedStaff((prev) =>
                        prev ? { ...prev, password: event.target.value } : prev
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                  />
                </label>
              )}
              
              {!isCreating && selectedStaff.staffUsername && (
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase">Login Credentials</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs text-slate-500">Username</div>
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        {selectedStaff.staffUsername}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedStaff.staffUsername || '');
                            toast.success('Username copied!');
                          }}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    {selectedStaff.password && (
                      <div>
                        <div className="text-xs text-slate-500">Password</div>
                        <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                          {selectedStaff.password}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedStaff.password || '');
                              toast.success('Password copied!');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-slate-500">Created</div>
                      <div className="text-sm font-medium text-slate-900">
                        {selectedStaff.staffCredentialCreatedAt 
                          ? new Date(selectedStaff.staffCredentialCreatedAt).toLocaleDateString() 
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 block">
                  Assign to Branch
                  <select
                    value={selectedStaff.selectedBranchId ?? ""}
                    onChange={(e) =>
                      setSelectedStaff((prev) =>
                        prev ? { ...prev, selectedBranchId: e.target.value || null } : prev
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400"
                  >
                    <option value="">-- No branch assigned --</option>
                    {branches && branches.length > 0 ? (
                      branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No branches available</option>
                    )}
                  </select>
                </label>
              </div>
            </div>
            {formError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={formLoading || isDetailLoading}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {formLoading ? "Saving…" : isCreating ? "Register Staff" : "Save Changes"}
              </button>
            </div>
            {isDetailLoading && (
              <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-white/80 text-sm font-semibold text-slate-600 backdrop-blur-sm">
                Loading staff details…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagment;
