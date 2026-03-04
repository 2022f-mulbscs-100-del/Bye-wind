import { useState } from "react";
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

type ProfileData = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
};

const STORAGE_KEY = "admin_profile_v1";

const defaultProfile: ProfileData = {
  fullName: "Ava Collins",
  role: "Operations Admin",
  email: "ava.collins@byewind.com",
  phone: "+1 (415) 555-2033",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
};

const readStoredProfile = (): ProfileData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<ProfileData>) };
  } catch {
    return defaultProfile;
  }
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>(() => readStoredProfile());
  const [draft, setDraft] = useState<ProfileData>(() => readStoredProfile());
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveEdit = () => {
    setProfile(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setIsEditing(false);
  };

  const fields: Array<{ key: keyof ProfileData; label: string }> = [
    { key: "fullName", label: "Full name" },
    { key: "role", label: "Role" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "timezone", label: "Timezone" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FiUser className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">{profile.fullName}</div>
            <div className="text-sm text-slate-500">{profile.role}</div>
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
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <FiSave /> Save
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
            {fields.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs font-semibold uppercase text-slate-400">{item.label}</div>
                {isEditing ? (
                  <input
                    type={item.key === "email" ? "email" : "text"}
                    value={draft[item.key]}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, [item.key]: event.target.value }))
                    }
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-slate-700">{profile[item.key]}</div>
                )}
              </div>
            ))}
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
                <p className="text-xs text-slate-500">Preferred channel</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <FiMail className="text-slate-400" /> {profile.email}
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-slate-400" /> {profile.phone}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiCalendar />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {["Updated booking policies", "Approved 2 branches", "Added new staff member"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <FiMapPin className="text-slate-400" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
