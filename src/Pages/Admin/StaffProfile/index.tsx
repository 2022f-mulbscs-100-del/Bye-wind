import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCopy,
  FiHome,
  FiKey,
  FiMail,
  FiPhone,
  FiUserCheck,
} from "react-icons/fi";
import { toast } from "sonner";
import { getStoredRestaurantId, isSessionActive } from "@/lib/auth";
import { getJson } from "@/lib/api";
import Loader from "@/Components/loader";

type BranchAssignment = {
  branchId: string;
  isPrimary: boolean;
  branch: {
    name: string;
    isActive: boolean;
  };
};

type StaffDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  staffUsername?: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  staffCredentialCreatedAt?: string;
  branches: BranchAssignment[];
};

const StaffProfile = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const restaurantId = getStoredRestaurantId();

  useEffect(() => {
    if (!isSessionActive() || !id) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const fetchStaff = async () => {
      try {
        const response = await getJson<StaffDetail>(`/staff/${id}`, {
          headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
        });
        if (mounted) {
          setStaff(response.data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError("Staff member not found or access denied.");
          console.error(err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchStaff();
    return () => {
      mounted = false;
    };
  }, [id, restaurantId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size={32} color="#0f172a" />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/dashboard/staff"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Back to Staff Management
          </Link>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          <div className="font-semibold">Staff member not found</div>
          <p className="mt-1 text-sm opacity-90">{error || "This profile may have been removed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link
              to="/dashboard/staff"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <FiArrowLeft />
              Back to Staff Management
            </Link>
            <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Staff Profile
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {staff.firstName} {staff.lastName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review contact details, branch assignments, account status, and login credentials.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${staff.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {staff.isActive ? 'Active' : 'Deactivated'}
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              {staff.role.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-inner">
            <FiUserCheck className="text-2xl" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Username</div>
            <div className="text-lg font-semibold text-slate-900">{staff.staffUsername || "Not assigned"}</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <div className="text-sm font-medium text-slate-500">Member since</div>
            <div className="text-lg font-semibold text-slate-900">
              {new Date(staff.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Contact Details</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
                <FiMail />
              </div>
              <div className="text-sm">
                <div className="text-[10px] font-bold uppercase text-slate-400">Email Address</div>
                <div className="font-semibold text-slate-700">{staff.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
                <FiPhone />
              </div>
              <div className="text-sm">
                <div className="text-[10px] font-bold uppercase text-slate-400">Phone Number</div>
                <div className="font-semibold text-slate-700">{staff.phone || "Not provided"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Branch Assignments</div>
          {staff.branches.length > 0 ? (
            <div className="space-y-3">
              {staff.branches.map((assignment) => (
                <div key={assignment.branchId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FiHome className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{assignment.branch.name}</span>
                  </div>
                  {assignment.isPrimary && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl bg-slate-50 text-slate-400 italic">
              <p className="text-sm">No branches assigned</p>
            </div>
          )}
        </div>
      </div>

      {staff.staffUsername && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiKey className="text-blue-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Login Credentials</span>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-white p-3 border border-white shadow-sm">
              <div className="text-[10px] font-bold uppercase text-slate-400">Username</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="font-semibold text-slate-900 font-mono">{staff.staffUsername}</div>
                <button
                  onClick={() => copyToClipboard(staff.staffUsername || '')}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200"
                >
                  <FiCopy className="text-xs" />
                  <span className="text-xs font-semibold">Copy</span>
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 border border-white shadow-sm">
              <div className="text-[10px] font-bold uppercase text-slate-400">Credentials Created</div>
              <div className="mt-1 font-semibold text-slate-900">
                {staff.staffCredentialCreatedAt 
                  ? new Date(staff.staffCredentialCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-white p-3 border border-blue-100 text-xs text-slate-600">
            ℹ️ Staff members use their username and password to log in to the staff portal.
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Information</div>
        <div className="mt-2 text-xs text-slate-500">
          Member since {new Date(staff.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
