import { FiEdit2, FiUser, FiSave, FiX } from "react-icons/fi";
import type { GuestProfileData } from "./types";

type ProfileHeaderProps = {
  profile: GuestProfileData["profile"];
  isEditing: boolean;
  draftProfile: Pick<GuestProfileData["profile"], "name" | "email" | "phone" | "location">;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: "name" | "email" | "phone" | "location", value: string) => void;
};

const ProfileHeader = ({
  profile,
  isEditing,
  draftProfile,
  onToggleEdit,
  onSave,
  onCancel,
  onChange,
}: ProfileHeaderProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <FiUser className="text-3xl text-slate-600" />
          </div>
          <div className="min-w-0">
            {isEditing ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={draftProfile.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="Name"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-lg font-semibold text-slate-900 focus:outline-none sm:col-span-3"
                />
                <input
                  type="text"
                  value={draftProfile.phone}
                  onChange={(event) => onChange("phone", event.target.value)}
                  placeholder="Phone"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
                />
                <input
                  type="text"
                  value={draftProfile.location}
                  onChange={(event) => onChange("location", event.target.value)}
                  placeholder="Location"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none sm:col-span-2"
                />
              </div>
            ) : (
              <div className="text-2xl font-semibold text-slate-900">{profile.name}</div>
            )}
            <div className="text-sm text-slate-500">
              Member since {profile.memberSince}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 "
              >
                <FiSave className="text-white" /> Save
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <FiX className="text-slate-500" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEdit}
              className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 "
            >
              <FiEdit2 className="text-slate-500" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
