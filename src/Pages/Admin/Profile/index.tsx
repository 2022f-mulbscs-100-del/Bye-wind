import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FiCalendar,
  FiEdit2,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiSettings,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getStoredRestaurantId, getStoredUserId, isSessionActive } from "@/lib/auth";
import { getJson, putJson } from "@/lib/api";
import Loader from "@/Components/loader";

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<Partial<ProfileData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const restaurantId = getStoredRestaurantId();
  const userId = getStoredUserId();

  useEffect(() => {
    if (!isSessionActive() || !userId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const fetchProfile = async () => {
      try {
        const response = await getJson<ProfileData>(`/staff/${userId}`, {
          headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
        });
        if (mounted) {
          setProfile(response.data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError("Unable to load profile information.");
          console.error(err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [userId, restaurantId]);

  const startEdit = () => {
    if (!profile) return;
    setDraft({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft({});
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!userId) return;
    setSaveLoading(true);
    const toastId = toast.loading("Saving changes...");
    try {
      const response = await putJson<ProfileData>(
        `/staff/${userId}`,
        {
          firstName: draft.firstName,
          lastName: draft.lastName,
          phone: draft.phone,
        },
        {
          headers: restaurantId ? { "x-restaurant-id": restaurantId } : undefined,
        }
      );
      setProfile(response.data);
      setIsEditing(false);
      setError("");
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
      toast.error(err.message || "Failed to save changes.", { id: toastId });
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size={32} color="#0f172a" />
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        Profile information not found. Please try logging in again.
      </div>
    );
  }

  const fullName = `${profile?.firstName} ${profile?.lastName}`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FiUser className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">{fullName}</div>
            <div className="text-sm text-slate-500">{profile?.role}</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <FiShield /> Admin Verified
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <FiSave /> {saveLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FiX /> Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Edit Profile
              </button>
            )}
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <FiSettings /> Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Profile Details</div>
            <button
              type="button"
              onClick={isEditing ? cancelEdit : startEdit}
              className="text-slate-400 hover:text-slate-600"
              aria-label={isEditing ? "Cancel editing" : "Edit profile details"}
            >
              {isEditing ? <FiX /> : <FiEdit2 />}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">First Name</div>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.firstName || ""}
                  onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-700">{profile?.firstName}</div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">Last Name</div>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.lastName || ""}
                  onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-700">{profile?.lastName}</div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">Email</div>
              <div className="mt-1 text-sm font-semibold text-slate-400 cursor-not-allowed">{profile?.email}</div>
              <div className="mt-0.5 text-[10px] text-slate-400 italic">Email cannot be changed</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">Phone</div>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.phone || ""}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-700">{profile?.phone || "Not set"}</div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">Role</div>
              <div className="mt-1 text-sm font-semibold text-slate-700">{profile?.role}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase text-slate-400">Joined</div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiMail />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Primary Contact</div>
                <p className="text-xs text-slate-500">Official contact details</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <FiMail className="flex-shrink-0 text-slate-400" /> 
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="flex-shrink-0 text-slate-400" /> {profile?.phone || "No phone linked"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiCalendar />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Last Session</div>
                <p className="text-xs text-slate-500">Security & Access</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-slate-400" />
                <span>
                  {profile?.lastLoginAt ? `Last login: ${new Date(profile.lastLoginAt).toLocaleString()}` : "First login session"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <FiShield className="mt-0.5 text-slate-400" />
                <span className="text-xs leading-relaxed">
                  Your account is protected by role-based access control.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

